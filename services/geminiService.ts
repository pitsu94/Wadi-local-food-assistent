
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { EventFormData, ProposalResponse } from "../types";
import { calculateQuoteDetails } from "./pricingCalculator";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const menuSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    counter: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "מנות מהדלפק"
    },
    field: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "מנות מהשדה"
    },
    taboon: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "מנות מהטאבון"
    },
    coals: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "מנות מהגחלים"
    },
    sweets: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "קינוחים"
    }
  },
  required: ["counter", "field", "taboon", "coals", "sweets"]
};

const proposalSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    customer_name: { type: Type.STRING },
    menu_draft: menuSchema,
    summary_text: { type: Type.STRING, description: "Marketing summary in a warm, local 'Wadi' tone" }
  },
  required: ["customer_name", "menu_draft", "summary_text"]
};

export const generateProposal = async (formData: EventFormData): Promise<ProposalResponse> => {
  const modelId = "gemini-3-flash-preview";
  
  // 1. Calculate Price Deterministically
  const calculatorResult = calculateQuoteDetails(formData);

  const systemInstruction = `
    אתה העוזר הדיגיטלי והמנוע הלוגי של 'ואדי אוכל מקומי' (Wadi Local Food). תפקידך הוא לייצר תפריט מפורט וטקסט שיווקי.
    
    עונתיות:
    - חודשים 11-3 (נובמבר עד מרץ): חורף. מנות שורש, בישול ארוך, תבשילי קדרה, ירוקים חמים.
    - חודשים 4-10 (אפריל עד אוקטובר): קיץ. סלטים טריים, פירות קיץ, דגים נאים, עשבי תיבול רעננים, ירקות צלויים קלות.
    
    סגנון התפריט:
    - מקומי, עונתי, טרי, מחובר לאדמה ולמקום.
    - השתמש בשמות מנות מעוררי תיאבון (למשל: "סלקים צלויים בטאבון עם גבינת המאירי", "אסאדו בבישול לילי").
    - **חשוב מאוד:** התחשב בהעדפות התזונתיות ובסגנון האוכל (foodStyle) שהמשתמש ציין! (למשל: אם נבחר "טבעוני" - אסור שיהיה בשר או חלב).
    
    סגנון כתיבה (summary_text):
    - חם, מזמין, אישי. דוגמה: "השקענו המון אהבה ומחשבה... בסוף הכל גמיש, דברו איתנו".
    - השתמש בעברית תקנית אך בגובה העיניים.
    - אם יש "הגשמת חלומות" (תוספות מיוחדות), אנא התייחס אליהם בטקסט השיווקי וציין שאנחנו שמחים להגשים להם את זה.
  `;

  // Format dreams for the prompt
  const dreamsText = formData.dreamItems && formData.dreamItems.length > 0 
    ? formData.dreamItems.map(d => `${d.name}`).join(", ")
    : "ללא תוספות מיוחדות";

  const eventDateStr = formData.eventDate ? formData.eventDate : "טרם נקבע (התאם תפריט כללי לפי העונה הנוכחית)";

  const prompt = `
    נתוני אירוע:
    שם לקוח: ${formData.customerName}
    תאריך: ${eventDateStr}
    כמות אורחים: ${formData.guests}
    סגנון הגשה (פורמט): ${formData.eventType}
    סגנון אוכל: ${formData.foodStyle}
    סדר אירוע: ${formData.eventOrder}
    העדפות תזונתיות מיוחדות: ${formData.dietaryPreferences || "ללא"}
    
    הגשמת חלומות (תוספות שהלקוח ביקש): ${dreamsText}
    
    אנא צור תפריט המותאם בדיוק לסגנון האוכל שנבחר (למשל ${formData.foodStyle}).
    המחיר מחושב במערכת נפרדת, אך תייצר את שאר הנתונים.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: proposalSchema
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI");
    }

    const aiResult = JSON.parse(text);

    // Merge Calculator Results (including Audit) with AI Menu
    return {
      customer_name: aiResult.customer_name || formData.customerName,
      total_price: calculatorResult.totalPrice,
      stations_count: calculatorResult.stationsCount,
      menu_draft: aiResult.menu_draft,
      summary_text: aiResult.summary_text,
      audit_details: calculatorResult.auditDetails // Pass the audit details
    } as ProposalResponse;

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback if AI fails
    return {
      customer_name: formData.customerName,
      total_price: calculatorResult.totalPrice,
      stations_count: calculatorResult.stationsCount,
      menu_draft: { counter: [], field: [], taboon: [], coals: [], sweets: [] },
      summary_text: "אירעה שגיאה ביצירת התוכן המילולי, אך המחיר חושב בהצלחה. אנא נסה שנית.",
      audit_details: calculatorResult.auditDetails
    };
  }
};
