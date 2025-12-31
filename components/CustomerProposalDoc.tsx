
import React from 'react';
import { SavedEvent } from '../types';

interface CustomerProposalDocProps {
    lead: SavedEvent;
    onClose: () => void;
    onSaveToCRM?: () => void; // New callback
}

const CustomerProposalDoc: React.FC<CustomerProposalDocProps> = ({ lead, onClose, onSaveToCRM }) => {
    
    // Calculate Price EXCLUDING VAT (as per latest request)
    const totalPrice = lead.totalPrice || 0;
    const pricePerHead = Math.ceil(totalPrice / (lead.guests || 1));

    const eventDate = new Date(lead.eventDate).toLocaleDateString('he-IL');
    const sendDate = new Date().toLocaleDateString('he-IL');

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-stone-900/80 backdrop-blur-sm flex flex-col items-center justify-start overflow-y-auto">
            {/* Toolbar */}
            <div className="w-full bg-white border-b border-stone-200 p-4 shadow-md sticky top-0 z-50 flex justify-between items-center no-print">
                <h2 className="text-xl font-bold text-stone-800">הצעת מחיר רשמית - {lead.customerName}</h2>
                <div className="flex gap-3">
                    {onSaveToCRM && (
                        <button onClick={onSaveToCRM} className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-4 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                            שמור בתיק אירוע
                        </button>
                    )}
                    <button onClick={handlePrint} className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-bold shadow flex items-center gap-2 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        הדפס / שמור כ-PDF
                    </button>
                    <button onClick={onClose} className="bg-stone-200 hover:bg-stone-300 text-stone-700 px-4 py-2 rounded-lg font-bold transition">
                        סגור
                    </button>
                </div>
            </div>

            {/* Document Container */}
            <div className="py-10 print:py-0 w-full flex flex-col items-center gap-10">
                <style>{`
                    @media print {
                        .no-print { display: none !important; }
                        body { background: white; }
                        @page { size: A4; margin: 0; }
                    }
                    :root {
                        --primary-color: #588e96;
                        --line-color: #b2d1d4;
                    }
                    .proposal-doc {
                        font-family: 'Assistant', sans-serif;
                        color: var(--primary-color);
                    }
                    .proposal-page {
                        width: 210mm;
                        min-height: 296mm;
                        padding: 20mm;
                        background: white;
                        box-sizing: border-box;
                        position: relative;
                        display: flex;
                        flex-direction: column;
                        box-shadow: 0 0 15px rgba(0,0,0,0.1);
                    }
                    @media print {
                        .proposal-page {
                            box-shadow: none;
                            margin: 0;
                            page-break-after: always;
                        }
                    }
                    .header-logo {
                        display: block;
                        margin: 0 auto 30px auto;
                        width: 280px;
                    }
                    .header-logo.small { width: 160px; margin-bottom: 20px; }
                    
                    .footer {
                        position: absolute;
                        bottom: 15mm;
                        left: 0;
                        width: 100%;
                        text-align: center;
                    }
                    .mountain-line {
                        width: 85%;
                        margin: 0 auto 10px auto;
                        border-bottom: 1.5px solid var(--primary-color);
                        opacity: 0.3;
                    }
                    .proposal-h2 {
                        font-size: 20px;
                        font-weight: 600;
                        margin-top: 20px;
                        margin-bottom: 10px;
                        border-bottom: 1px solid var(--line-color);
                        display: inline-block;
                    }
                    .proposal-p, .proposal-li { font-size: 15px; line-height: 1.6; font-weight: 300; margin-bottom: 8px; }
                    .center-text { text-align: center; width: 100%; }
                    .detail-line {
                        display: flex;
                        justify-content: center;
                        align-items: baseline;
                        gap: 5px;
                        margin-bottom: 10px;
                        font-size: 18px;
                    }
                    .line-fill {
                        /* Styles updated to match document text seamlessly */
                        border-bottom: none; 
                        display: inline;
                        margin: 0 3px;
                        color: inherit; /* Matches var(--primary-color) */
                        font-weight: 700; /* Bold to distinct data but same font family */
                    }
                    .proposal-ul { padding-right: 20px; margin-bottom: 15px; list-style-type: none; }
                    .proposal-li::before { content: "- "; margin-left: 5px; }
                `}</style>

                {/* PAGE 1 */}
                <div className="proposal-page proposal-doc">
                    <img src="https://static.wixstatic.com/media/e87984_d30b09d55a744b22b13a5720ba722b7f~mv2.png/v1/fill/w_766,h_504,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/%D7%9C%D7%95%D7%92%D7%95%20%D7%9E%D7%90%D7%A1%D7%98%D7%A7%D7%A1%D7%98%20%2B%20%D7%98%D7%A7%D7%A1%D7%98%20%D7%A9%D7%A7%D7%95%D7%A3%20.png" className="header-logo" alt="Logo" />
                    
                    <div className="center-text" style={{ margin: '60px 0' }}>
                        <div className="detail-line">חתונה של <span className="line-fill">{lead.customerName}</span></div>
                        <div className="detail-line"><span className="line-fill">{eventDate}</span></div>
                        <div className="detail-line">ב <span className="line-fill">{lead.location || 'מיקום לא צוין'}</span></div>
                        <div className="detail-line">אורחים <span className="line-fill">{lead.guests}</span></div>
                        <br />
                        <div className="detail-line" style={{ marginTop: '20px' }}>
                            <span className="line-fill">{lead.customerName}</span> הנהדרים!
                        </div>
                    </div>

                    <div className="center-text" style={{ maxWidth: '85%', margin: '0 auto' }}>
                        <p className="proposal-p">מצורפים פרטים לקראת האירוע וגם תפריט שמח וצבעוני שהשקענו בו הרבה אהבה ומחשבה.</p>
                        <p className="proposal-p">כמובן שאם יש שאלות או השגות דברו איתנו, הכל גמיש ובסוף כל מה שחשוב זה שיהיה כיף ומדויק לכם ולמי שמגיע...</p>
                    </div>

                    <div className="footer">
                        <div className="mountain-line"></div>
                        <div style={{ fontSize: '13px' }}>wadi.localfood@gmail.com | 058-6995461</div>
                    </div>
                </div>

                {/* PAGE 2 */}
                <div className="proposal-page proposal-doc">
                    <img src="https://static.wixstatic.com/media/e87984_d30b09d55a744b22b13a5720ba722b7f~mv2.png/v1/fill/w_766,h_504,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/%D7%9C%D7%95%D7%92%D7%95%20%D7%9E%D7%90%D7%A1%D7%98%D7%A7%D7%A1%D7%98%20%2B%20%D7%98%D7%A7%D7%A1%D7%98%20%D7%A9%D7%A7%D7%95%D7%A3%20.png" className="header-logo small" alt="Logo" />
                    
                    <h2 className="proposal-h2">איך זה עובד</h2>
                    <p className="proposal-p">בדרך כלל אנחנו מתחילים בהכנת האוכל וההתרגשות לאורך השבוע שלקראת החתונה – מלקטים, מצנצנים, מעמידים סירים, מנביטים, מוודאים שמה שרצינו להכין תואם את מצב העונה ומשנים כדי לדייק את עצמנו ולהכין רק עם מה שטעים טעים וטרי טרי. זה חשוב לנו גם כדי להשאיר את הראש של כולנו פתוח ואת היצירתיות וההתלהבות מכל מה שנכין לארוחה החגיגית.</p>
                    <p className="proposal-p">ביום עצמו נגיע ונתמקם, נדאג לכל הירקות הטריים, נכין בצק שיתפח, נקים את המטבח עצמו ונהנה מהפינה היפה שהבאתם אותנו אליה. בשעה שנקבע נתחיל להוציא את האוכל במשך כשעתיים, אז תלכו לחלק החשוב באמת וכשתחזרו (נשואים!), יחכו לכם קומקום קפה וקומקום תה וקינוחים שנוציא לעמדה במשך כחצי שעה. אחרי הוצאת הקינוחים נקפל את המטבח ונסדר אחרינו, ונשאיר אתכם להמשיך לשמוח ולהנות. אם תרצו נשאיר עמדת אוכל טעים שתחכה לכם לשלב שיעלה שוב הרעב במהלך הריקודים.</p>

                    <h2 className="proposal-h2">ההצעה כוללת</h2>
                    <ul className="proposal-ul">
                        <li className="proposal-li">ארוחה מתמשכת לאורך שעתיים</li>
                        <li className="proposal-li">קינוחים, קפה ותה</li>
                        <li className="proposal-li">ציוד מטבח, עמדות, כלי הגשה וכלי אוכל (צלחות, סכו"ם, כוסות שתיה חמה)</li>
                        <li className="proposal-li">עובדי מטבח ועמדות</li>
                        <li className="proposal-li">עמדת אוכל ריקודים - אם תרצו</li>
                    </ul>

                    <h2 className="proposal-h2">אתם תדאגו</h2>
                    <p className="proposal-p">עבור המטבח - מרחב חוץ מתוחם של כ-80-100 מ"ר עם: צל טוב, חשמל, תאורה, חיבור למים וכיור נח לעבודה, ומאווררים עבור העמדות.</p>
                    <p className="proposal-p">לפינויים - לא בניהולנו אלא תחת ההפקה: עובדים, עמדה ומגשים.</p>

                    <h2 className="proposal-h2">עלות</h2>
                    <p className="proposal-p">העלות היא <span className="line-fill">{pricePerHead}</span> ש"ח לאדם (מינימום <span className="line-fill">{lead.guests}</span> איש) <strong>לא כולל מע"מ</strong> עבור תפריט <span className="line-fill">{lead.foodStyle}</span>.</p>
                    <p className="proposal-p">שליש מהסכום הכולל יועבר כמקדמה עבור שריון תאריך בעת אישור ההזמנה. באירוע עצמו יועבר צ'ק על שארית הסכום, ו-6,000 ₪ במזומן.</p>

                    <h2 className="proposal-h2">ביטולים ומילים חשובות</h2>
                    <p className="proposal-p">במקרה של ביטול האירוע מצידכם תשמש המקדמה כדמי ביטול. במקרה של דחייה תשמש המקדמה כחלק מהתשלום עבור האירוע בתאריך החדש, בניכוי עלויות עד 15% מהעלות הכוללת. חשוב לנו לומר שאנו יודעים ומחזיקים את זה שמקרה של דחייה או ביטול כרוך כמעט תמיד בקשיים, רגשיים וכלכליים, ועל כן תמיד נעשה כמיטב יכולתנו לראות את התמונה השלמה.</p>
                    <p className="proposal-p">המטבח שלנו איננו סטרילי - יש בו אגוזים, בוטנים, שקדים, גלוטן וכל חומר גלם אחר. לכן, בבחירתכם בנו כל אורח יהיה אחראי על בחירתו לאכול את האוכל שיוגש.</p>

                    <div style={{ marginTop: 'auto', borderTop: '1px solid var(--line-color)', paddingTop: '10px' }}>
                        <p className="proposal-p"><strong>לסיום:</strong> התפריט ישמש כבסיס פתוח לשינויים על פי שיקול הדעת והעונה, מתוך מחשבה על דיוק הארוחה אליכם.</p>
                        <p style={{ fontSize: '12px', color: '#888', textAlign: 'center' }}>הצעת המחיר תקפה מ- <span className="line-fill">{sendDate}</span> למשך שבועיים.</p>
                    </div>

                    <div className="footer">
                        <div className="mountain-line"></div>
                        <div style={{ fontSize: '13px' }}>wadi.localfood@gmail.com | 058-6995461</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerProposalDoc;
