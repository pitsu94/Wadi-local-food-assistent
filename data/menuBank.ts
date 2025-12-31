
export interface Dish {
    name: string;
    description?: string; // Optional description for the AI to use if needed
    tags: ('meat' | 'dairy' | 'vegan' | 'fish' | 'gluten-free')[];
}

export interface SeasonMenu {
    field: Dish[];
    counter: Dish[]; // Sometimes referred to as "Bar" or "Buffet"
    taboon: Dish[];
    coals: Dish[];
    sweets: Dish[];
}

export const MENU_BANK = {
    winter: {
        field: [
            { name: "חסה, ג'רג'ר, ויניגרט הדרים וגבינת תום עזים", tags: ['dairy'] },
            { name: "סלקים צלויים עם גבינה בשלה, דבש רימונים, אגוזי מלך ואזוב", tags: ['dairy'] },
            { name: "תפוחי אדמה צלויים עם איולי אזוב ושמנת חמוצה", tags: ['dairy', 'gluten-free'] },
            { name: "שורש סלרי מהפחמים בחמאה חומה ומרווה", tags: ['dairy', 'gluten-free'] },
            { name: "שומר צלוי עם גבינת תום כבשים ופלפל שחור", tags: ['dairy', 'gluten-free'] },
            { name: "כרוב מלפוף צלוי לילה ביין לבן ומרווה", tags: ['vegan', 'gluten-free'] },
            { name: "מחבת לוהטת של פטריות ותפוחי אדמה צלויים עם סקורדיליה", tags: ['vegan', 'gluten-free'] },
            { name: "בצלים ממולאים צרובים בטאבון עם פטה ורימונים", tags: ['dairy'] }
        ],
        counter: [
            { name: "קולורבי צלוי מעושן, ריקוטה עזים, זוטא ושמן זית קורונייקי", tags: ['dairy', 'gluten-free'] },
            { name: "ברוסקטת מחמצת עם שום ירוק, ציטרה, עגבניות מגי וגבינת בזלת", tags: ['dairy'] },
            { name: "מסאבחה עדשים עם ירוקים מהבר - סרפד, חובזה ופרחי חרדל", tags: ['vegan', 'gluten-free'] },
            { name: "קרוסטיני שיפון עם שמנת חמוצה, פורל מהדן כבוש ואביונות צלף", tags: ['fish', 'dairy'] },
            { name: "סשימי פלמידה עם ויניגרט תותים, חריף ונענע משובלת", tags: ['fish', 'gluten-free'] },
            { name: "גבינה בשלה נמסה במחבת מהגחלים עם ציטרה ופלפל חריף", tags: ['dairy', 'gluten-free'] }
        ],
        taboon: [
            { name: "מאפה פטריות צלויות עם גבינה בשלה, דבש צ'ילי ושמן ציטרה", tags: ['dairy'] },
            { name: "מאפה ירוקים מלוקטים וג'יבנה-אזוב", tags: ['dairy'] },
            { name: "מאפה בעג'ין כבש עם צנוברים, חריף וטחינה-יוגורט", tags: ['meat', 'dairy'] },
            { name: "פוקאצ'ת מרווה עם חמאה, מלח ים ויערת דבש", tags: ['dairy'] },
            { name: "מאפה סלק, גבינה כחולה ועלי סלק", tags: ['dairy'] },
            { name: "סינייה טלה עם ירקות אביב צלויים וטחינה בטאבון", tags: ['meat'] },
            { name: "פסטה ראגו בשר מפורק בבישול ארוך", tags: ['meat'] }
        ],
        coals: [
            { name: "פיקניה בגחלים עם גרמולטה של עלי גפן וצלפים", tags: ['meat', 'gluten-free'] },
            { name: "נתחים של לילה עם מרווה וציטרה מפורקים על פריקי", tags: ['meat'] },
            { name: "שוק טלה חפור בגחלים עם ענבים, שום ובהרט", tags: ['meat', 'gluten-free'] },
            { name: "פילה לברק צלוי על עלי מנגולד עם סלסת בצל ירוק", tags: ['fish', 'gluten-free'] },
            { name: "פרידה שלמה בחמאה, עשבים ועגבניות", tags: ['fish', 'dairy', 'gluten-free'] },
            { name: "קציצות בר-ים עם לימון כבוש ועשבים", tags: ['fish'] }
        ],
        sweets: [
            { name: "פורטוקופיטה של חורף - קינוח פילו יווני, יוגורט ולואיזה", tags: ['dairy'] },
            { name: "שמרים עם שוקולד מריר, פיסטוק והל", tags: ['dairy'] },
            { name: "טראפלס שוקולד חזק עם מלח אטלנטי וצנוברים", tags: ['vegan', 'gluten-free'] },
            { name: "מלבי קוקוס עם סירופ רימונים וורדים", tags: ['vegan', 'gluten-free'] }
        ]
    },
    summer: {
        counter: [
            { name: "קרוסטיני מחמצת", description: "עם גבינת בושה וריבת משמש-פרחי בזיליקום", tags: ['dairy'] },
            { name: "ברוסקטה עגבניות", description: "עם עגבניות שרי טריות וקונפי, וזיתים מיובשים", tags: ['vegan'] },
            { name: "אבטיח ולאבנה", description: "אבטיח, לאבנה, זוטא ושמן זית קורונייקי", tags: ['dairy', 'gluten-free'] },
            { name: "סביצ'ה מוסר ים", description: "עם פאקוס ובצל סגול ונקטרינה בעלה לאליק", tags: ['fish', 'gluten-free'] },
            { name: "קרקר גרעינים ופורל", description: "עם שמנת חמוצה, פורל מהדן כבוש וזרעי חרדל מותססים", tags: ['fish', 'dairy'] },
            { name: "סשימי פלמידה לבנה", description: "עם ויניגרט נענע משובלת ופלפל חריף", tags: ['fish', 'gluten-free'] },
            { name: "בורקס מים", description: "מאפה בצק פילו קריספי עם מילויים של גבינות, תרד ובצל מקורמל", tags: ['dairy'] },
            { name: "פיתות סאג' עם דג", description: "דג מפורק, לאבנה, מטבוחה פלפלים, איולי נענע וירקות", tags: ['fish', 'dairy'] },
            { name: "קולורבי צלוי מעושן", description: "עם זוטא ושמן זית קורונייקי", tags: ['vegan', 'gluten-free'] },
            { name: "צלעות תירס מתוק", description: "בפרמזן, פלפל חריף ולימון", tags: ['dairy', 'gluten-free'] },
            { name: "חלומי עזים טריה צרובה", description: "קרם עגבניות שרי, שמן בזיליקום", tags: ['dairy', 'gluten-free'] }
        ],
        field: [
            { name: "מסאבחה עדשים", description: "בהמון שמן זית סורי ולימון", tags: ['vegan', 'gluten-free'] },
            { name: "דלעת יפנית ופריקי", description: "דלעות יפניות צלויות עם תבשיל פריקי עשיר", tags: ['vegan'] },
            { name: "סינייה אביבית", description: "של ירקות, פריקי וטחינה בטאבון", tags: ['vegan'] }
        ],
        taboon: [
            { name: "לחמי טאבון", description: "עם מרווה ומלח מלדון", tags: ['vegan'] },
            { name: "מאפה עלי גפן", description: "ענבים, גבינת עזים בשלה ודבש", tags: ['dairy'] },
            { name: "מאפה ירוקים וג'יבנה", description: "עם גרידת לימון", tags: ['dairy'] },
            { name: "מאפה בצל סומאק אזוב", description: "בצק עם בצל, סומאק ואזוב", tags: ['vegan'] },
            { name: "מאפה בעג'ין חציל", description: "חציל עם צנוברים", tags: ['vegan'] },
            { name: "מאפה בעג'ין כבש וליה", description: "עם צנוברים ודבש-רימונים", tags: ['meat'] },
            { name: "שווארמה הודו", description: "מאפים מהטאבון ממולאים שווארמה הודו", tags: ['meat'] },
            { name: "מאפה סינייה בשר", description: "עם טחינה וצנוברים", tags: ['meat'] }
        ],
        coals: [
            { name: "פילה לברק צלוי", description: "בטאבון על עלי תאנה עם סלסת בצל ירוק וצלפים", tags: ['fish', 'gluten-free'] },
            { name: "פורל שלם עם עשבים", description: "מבושל בחמאה", tags: ['fish', 'dairy', 'gluten-free'] },
            { name: "סינייה בקר ופריקי", description: "עם ירקות אביב וטחינה בטאבון", tags: ['meat'] },
            { name: "פסטה ראגו בשר", description: "בשר מפורק בבישול ארוך", tags: ['meat'] },
            { name: "פיקניה בגחלים", description: "עם גרמולטה של עלי גפן", tags: ['meat', 'gluten-free'] },
            { name: "מסאחן עוף לולו", description: "קונפי בשמן זית ובצל-סומאק, עם ג'רג'ר וצנונית", tags: ['meat'] }
        ],
        sweets: [
            { name: "פורטוקופיטה של קיץ", description: "בצק פילו, הדרים ותאנים מקורמלות", tags: ['dairy'] },
            { name: "הר קצפת לאבנה", description: "עם סירופ עלי תאנה ופטל מרמת הגולן", tags: ['dairy', 'gluten-free'] },
            { name: "מגש פירות העונה", description: "אבטיח, מלון, ענבים, תאנים", tags: ['vegan', 'gluten-free'] },
            { name: "יוגורט עזים סמיך", description: "תותים, שקדי משמש וסירופ עלי תאנה", tags: ['dairy', 'gluten-free'] },
            { name: "גאלט אגסים", description: "עם קרמל טימין", tags: ['dairy'] }
        ]
    }
};
