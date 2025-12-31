
import { EventFormData, AuditItem, CalculationResult, CostBreakdown, PricingSteps } from "../types";

// --- Constants & Configuration ---

export const FIXED_COSTS = {
  OLIVE_OIL_PRICE_PER_LITER: 38, 
  MEAT_PRICE_PER_KG: 106, 
  FISH_STARTER_PRICE_PER_KG: 171.0,
  FISH_MAIN_PRICE_PER_KG: 85.5,

  PORTION_MEAT: 0.300, 
  PORTION_FISH_STARTER: 0.060,
  PORTION_FISH_MAIN: 0.300, 

  KITCHEN_WORKER_COST: 600, 
  KITCHEN_MANAGER_COST: 1200, 
  WAITER_COST: 600, 
  DISHWASHER_COST: 600,
  LOGISTICS_MANAGER_COST: 1200,
  LOGISTICS_WORKER_COST: 900,
  FLOOR_MANAGER_COST: 600,
  
  // New specific clearing costs
  CLEARING_STAFF_COST: 600,
  CLEARING_MANAGER_COST: 1000,
  
  // Kosher Costs (Updated)
  KOSHER_CERTIFICATE_SMALL: 700,
  KOSHER_CERTIFICATE_MEDIUM_LARGE: 1000,
  KOSHER_SUPERVISOR_BASE: 500,
  KOSHER_SUPERVISOR_FAR: 1000,

  STATION_COST: 350, // This is the rental cost per station unit
  FRIDGE_COST: 250,
  OVEN_COST: 500,
  WARMER_COST: 500,
  WORK_TABLE_COST: 30,
  
  // Dish Prices
  PRICE_PALM_DESSERT: 0.5,
  PRICE_PALM_MAIN: 0.5,
  PRICE_RENTAL_12: 1.4,
  PRICE_RENTAL_19: 1.4,
  PRICE_FORK_SMALL: 1.2, 
  PRICE_KNIFE: 1.2,
  PRICE_FORK: 1.2,
  PRICE_TEASPOON: 1.2,
  PRICE_SPOON: 1.2,
  PRICE_HOT_CUP: 1.4,
  
  TRUCK_BASE_CLOSE: 800,
  TRUCK_BASE_FAR: 1200,
  TRUCK_BASE_SPECIAL: 4000,
  
  FUEL_RATE_PER_KM: 2.5, // For Truck only
  STAFF_TRAVEL_RATE_PER_KM: 1.0, // For Staff Cars (New Requirement)

  // Distance Definitions (Round Trip estimate in KM)
  KM_CLOSE: 200,
  KM_FAR: 500,
  KM_SPECIAL: 1000,

  GAS_BALLOON_PRICE: 156,
  COALS_BAG: 80, // Price per bag (unit)
  
  DISPOSABLES_SMALL: 100,
  DISPOSABLES_MEDIUM: 200,
  DISPOSABLES_LARGE: 300
};

// --- DATA TABLES ---

type StaffRow = { maxGuests: number; buffet: number; market: number; stations: number; rotating: number };
type CostRow = { maxGuests: number; all: number; meatNoFish: number; meat: number; dairy: number; pescatarian: number; vegetarian: number; vegan: number };
type QuantityRow = { maxGuests: number; value: number };

// Updated Staff Tables
export const KITCHEN_STAFF_TABLE: StaffRow[] = [
  { maxGuests: 30, buffet: 2, market: 2, stations: 2, rotating: 2 },
  { maxGuests: 50, buffet: 3, market: 3, stations: 3, rotating: 3 },
  { maxGuests: 59, buffet: 4, market: 4, stations: 4, rotating: 4 },
  { maxGuests: 60, buffet: 4, market: 4, stations: 4, rotating: 4 },
  { maxGuests: 90, buffet: 5, market: 5, stations: 5, rotating: 5 },
  { maxGuests: 120, buffet: 6, market: 6, stations: 6, rotating: 6 },
  { maxGuests: 150, buffet: 7, market: 7, stations: 7, rotating: 7 },
  { maxGuests: 180, buffet: 8, market: 8, stations: 8, rotating: 8 },
  { maxGuests: 190, buffet: 9, market: 9, stations: 9, rotating: 9 },
  { maxGuests: 220, buffet: 10, market: 10, stations: 10, rotating: 10 },
  { maxGuests: 270, buffet: 11, market: 11, stations: 11, rotating: 11 },
  { maxGuests: 290, buffet: 12, market: 12, stations: 12, rotating: 12 },
  { maxGuests: 350, buffet: 13, market: 13, stations: 13, rotating: 13 },
  { maxGuests: 1000, buffet: 14, market: 14, stations: 14, rotating: 14 },
];

export const FLOOR_STAFF_TABLE: StaffRow[] = [
  { maxGuests: 50, buffet: 2, market: 2, stations: 2, rotating: 2 },
  { maxGuests: 70, buffet: 3, market: 3, stations: 3, rotating: 3 },
  { maxGuests: 120, buffet: 4, market: 4, stations: 4, rotating: 4 },
  { maxGuests: 160, buffet: 5, market: 5, stations: 5, rotating: 5 },
  { maxGuests: 190, buffet: 6, market: 6, stations: 6, rotating: 6 },
  { maxGuests: 220, buffet: 7, market: 7, stations: 7, rotating: 7 },
  { maxGuests: 270, buffet: 8, market: 8, stations: 8, rotating: 8 },
  { maxGuests: 320, buffet: 9, market: 9, stations: 9, rotating: 9 },
  { maxGuests: 350, buffet: 10, market: 10, stations: 10, rotating: 10 },
  { maxGuests: 1000, buffet: 11, market: 11, stations: 11, rotating: 11 },
];

export const CARS_TABLE: StaffRow[] = [
    { maxGuests: 30, buffet: 2, market: 2, stations: 2, rotating: 2 },
    { maxGuests: 59, buffet: 3, market: 3, stations: 3, rotating: 3 },
    { maxGuests: 90, buffet: 4, market: 4, stations: 4, rotating: 4 },
    { maxGuests: 120, buffet: 5, market: 5, stations: 5, rotating: 5 },
    { maxGuests: 180, buffet: 6, market: 6, stations: 6, rotating: 6 },
    { maxGuests: 190, buffet: 6, market: 6, stations: 6, rotating: 6 },
    { maxGuests: 230, buffet: 10, market: 10, stations: 10, rotating: 10 },
    { maxGuests: 270, buffet: 11, market: 11, stations: 11, rotating: 11 },
    { maxGuests: 350, buffet: 12, market: 12, stations: 12, rotating: 12 },
    { maxGuests: 1000, buffet: 13, market: 13, stations: 13, rotating: 13 },
];

export const STATIONS_COUNT_TABLE: StaffRow[] = [
    { maxGuests: 50, buffet: 0, market: 0, stations: 2, rotating: 0 },
    { maxGuests: 100, buffet: 0, market: 0, stations: 3, rotating: 0 },
    { maxGuests: 150, buffet: 0, market: 0, stations: 4, rotating: 0 },
    { maxGuests: 200, buffet: 0, market: 0, stations: 5, rotating: 0 },
    { maxGuests: 250, buffet: 0, market: 0, stations: 6, rotating: 0 },
    { maxGuests: 300, buffet: 0, market: 0, stations: 7, rotating: 0 },
    { maxGuests: 350, buffet: 0, market: 0, stations: 8, rotating: 0 },
    { maxGuests: 1000, buffet: 0, market: 0, stations: 9, rotating: 0 },
];

// --- COST TABLES ---

export const VEG_COST_TABLE: CostRow[] = [
  { maxGuests: 30, all: 800, meatNoFish: 800, meat: 800, dairy: 800, pescatarian: 800, vegetarian: 800, vegan: 800 },
  { maxGuests: 40, all: 1000, meatNoFish: 1000, meat: 1000, dairy: 1000, pescatarian: 1000, vegetarian: 1000, vegan: 1000 },
  { maxGuests: 60, all: 1200, meatNoFish: 1200, meat: 1200, dairy: 1200, pescatarian: 1200, vegetarian: 1200, vegan: 1200 },
  { maxGuests: 100, all: 1800, meatNoFish: 1800, meat: 1800, dairy: 1800, pescatarian: 1800, vegetarian: 1800, vegan: 1800 },
  { maxGuests: 140, all: 2000, meatNoFish: 2000, meat: 2000, dairy: 2000, pescatarian: 2000, vegetarian: 2000, vegan: 2000 },
  { maxGuests: 160, all: 2400, meatNoFish: 2400, meat: 2400, dairy: 2400, pescatarian: 2400, vegetarian: 2400, vegan: 2400 },
  { maxGuests: 180, all: 2800, meatNoFish: 2800, meat: 2800, dairy: 2800, pescatarian: 2800, vegetarian: 2800, vegan: 2800 },
  { maxGuests: 200, all: 3000, meatNoFish: 3000, meat: 3000, dairy: 3000, pescatarian: 3000, vegetarian: 3000, vegan: 3000 },
  { maxGuests: 220, all: 3400, meatNoFish: 3400, meat: 3400, dairy: 3400, pescatarian: 3400, vegetarian: 3400, vegan: 3400 },
  { maxGuests: 240, all: 3800, meatNoFish: 3800, meat: 3800, dairy: 3800, pescatarian: 3800, vegetarian: 3800, vegan: 3800 },
  { maxGuests: 260, all: 4000, meatNoFish: 4000, meat: 4000, dairy: 4000, pescatarian: 4000, vegetarian: 4000, vegan: 4000 },
  { maxGuests: 300, all: 4200, meatNoFish: 4200, meat: 4200, dairy: 4200, pescatarian: 4200, vegetarian: 4200, vegan: 4200 },
  { maxGuests: 360, all: 4500, meatNoFish: 4500, meat: 4500, dairy: 4500, pescatarian: 4500, vegetarian: 4500, vegan: 4500 },
  { maxGuests: 380, all: 4800, meatNoFish: 4800, meat: 4800, dairy: 4800, pescatarian: 4800, vegetarian: 4800, vegan: 4800 },
  { maxGuests: 1000, all: 5000, meatNoFish: 5000, meat: 5000, dairy: 5000, pescatarian: 5000, vegetarian: 5000, vegan: 5000 },
];

export const DRY_GOODS_COST_TABLE: CostRow[] = [
  { maxGuests: 30, all: 800, meatNoFish: 800, meat: 800, dairy: 800, pescatarian: 800, vegetarian: 800, vegan: 800 },
  { maxGuests: 40, all: 1000, meatNoFish: 1000, meat: 1000, dairy: 1000, pescatarian: 1000, vegetarian: 1000, vegan: 1000 },
  { maxGuests: 60, all: 1200, meatNoFish: 1200, meat: 1200, dairy: 1200, pescatarian: 1200, vegetarian: 1200, vegan: 1200 },
  { maxGuests: 100, all: 1800, meatNoFish: 1800, meat: 1800, dairy: 1800, pescatarian: 1800, vegetarian: 1800, vegan: 1800 },
  { maxGuests: 140, all: 2000, meatNoFish: 2000, meat: 2000, dairy: 2000, pescatarian: 2000, vegetarian: 2000, vegan: 2000 },
  { maxGuests: 160, all: 2400, meatNoFish: 2400, meat: 2400, dairy: 2400, pescatarian: 2400, vegetarian: 2400, vegan: 2400 },
  { maxGuests: 180, all: 2800, meatNoFish: 2800, meat: 2800, dairy: 2800, pescatarian: 2800, vegetarian: 2800, vegan: 2800 },
  { maxGuests: 200, all: 3000, meatNoFish: 3000, meat: 3000, dairy: 3000, pescatarian: 3000, vegetarian: 3000, vegan: 3000 },
  { maxGuests: 220, all: 3400, meatNoFish: 3400, meat: 3400, dairy: 3400, pescatarian: 3400, vegetarian: 3400, vegan: 3400 },
  { maxGuests: 240, all: 3800, meatNoFish: 3800, meat: 3800, dairy: 3800, pescatarian: 3800, vegetarian: 3800, vegan: 3800 },
  { maxGuests: 260, all: 4000, meatNoFish: 4000, meat: 4000, dairy: 4000, pescatarian: 4000, vegetarian: 4000, vegan: 4000 },
  { maxGuests: 300, all: 4200, meatNoFish: 4200, meat: 4200, dairy: 4200, pescatarian: 4200, vegetarian: 4200, vegan: 4200 },
  { maxGuests: 360, all: 4500, meatNoFish: 4500, meat: 4500, dairy: 4500, pescatarian: 4500, vegetarian: 4500, vegan: 4500 },
  { maxGuests: 380, all: 4800, meatNoFish: 4800, meat: 4800, dairy: 4800, pescatarian: 4800, vegetarian: 4800, vegan: 4800 },
  { maxGuests: 1000, all: 5000, meatNoFish: 5000, meat: 5000, dairy: 5000, pescatarian: 5000, vegetarian: 5000, vegan: 5000 },
];

export const BREAD_COST_TABLE: CostRow[] = [
    { maxGuests: 40, all: 100, meatNoFish: 100, meat: 100, dairy: 100, pescatarian: 100, vegetarian: 100, vegan: 100 },
    { maxGuests: 80, all: 150, meatNoFish: 150, meat: 150, dairy: 150, pescatarian: 150, vegetarian: 150, vegan: 150 },
    { maxGuests: 120, all: 200, meatNoFish: 200, meat: 200, dairy: 200, pescatarian: 200, vegetarian: 200, vegan: 200 },
    { maxGuests: 160, all: 250, meatNoFish: 250, meat: 250, dairy: 250, pescatarian: 250, vegetarian: 250, vegan: 250 },
    { maxGuests: 200, all: 300, meatNoFish: 300, meat: 300, dairy: 300, pescatarian: 300, vegetarian: 300, vegan: 300 },
    { maxGuests: 240, all: 350, meatNoFish: 350, meat: 350, dairy: 350, pescatarian: 350, vegetarian: 350, vegan: 350 },
    { maxGuests: 280, all: 400, meatNoFish: 400, meat: 400, dairy: 400, pescatarian: 400, vegetarian: 400, vegan: 400 },
    { maxGuests: 300, all: 450, meatNoFish: 450, meat: 450, dairy: 450, pescatarian: 450, vegetarian: 450, vegan: 450 },
    { maxGuests: 320, all: 500, meatNoFish: 500, meat: 500, dairy: 500, pescatarian: 500, vegetarian: 500, vegan: 500 },
    { maxGuests: 360, all: 500, meatNoFish: 500, meat: 500, dairy: 500, pescatarian: 500, vegetarian: 500, vegan: 500 },
    { maxGuests: 1000, all: 550, meatNoFish: 550, meat: 550, dairy: 550, pescatarian: 550, vegetarian: 550, vegan: 550 },
];

export const OIL_QUANTITY_TABLE: CostRow[] = [
    { maxGuests: 40, all: 6, meatNoFish: 6, meat: 6, dairy: 6, pescatarian: 6, vegetarian: 6, vegan: 6 },
    { maxGuests: 100, all: 12, meatNoFish: 12, meat: 12, dairy: 12, pescatarian: 12, vegetarian: 12, vegan: 12 },
    { maxGuests: 160, all: 14, meatNoFish: 14, meat: 14, dairy: 14, pescatarian: 14, vegetarian: 14, vegan: 14 },
    { maxGuests: 220, all: 16, meatNoFish: 16, meat: 16, dairy: 16, pescatarian: 16, vegetarian: 16, vegan: 16 },
    { maxGuests: 280, all: 18, meatNoFish: 18, meat: 18, dairy: 18, pescatarian: 18, vegetarian: 18, vegan: 18 },
    { maxGuests: 340, all: 20, meatNoFish: 20, meat: 20, dairy: 20, pescatarian: 20, vegetarian: 20, vegan: 20 },
    { maxGuests: 1000, all: 22, meatNoFish: 22, meat: 22, dairy: 22, pescatarian: 22, vegetarian: 22, vegan: 22 },
];

// --- HEAVY EQUIPMENT TABLES ---

export const COALS_TABLE: QuantityRow[] = [
    { maxGuests: 100, value: 160 },
    { maxGuests: 248, value: 240 },
    { maxGuests: 1000, value: 320 }
];

export const FRIDGE_TABLE: QuantityRow[] = [
    { maxGuests: 247, value: 2 },
    { maxGuests: 1000, value: 3 }
];

export const WORK_TABLE_QUANTITY: QuantityRow[] = [
    { maxGuests: 40, value: 10 },
    { maxGuests: 100, value: 10 },
    { maxGuests: 247, value: 15 },
    { maxGuests: 1000, value: 20 }
];

export const SERVING_STATIONS_QUANTITY: QuantityRow[] = [
    { maxGuests: 30, value: 2 },
    { maxGuests: 50, value: 2 },
    { maxGuests: 100, value: 3 },
    { maxGuests: 150, value: 4 },
    { maxGuests: 200, value: 5 },
    { maxGuests: 250, value: 6 },
    { maxGuests: 300, value: 7 },
    { maxGuests: 350, value: 8 },
    { maxGuests: 1000, value: 9 }
];

export const GAS_QUANTITY: QuantityRow[] = [
    { maxGuests: 98, value: 2 },
    { maxGuests: 248, value: 5 },
    { maxGuests: 1000, value: 7 }
];

export const SPOON_QUANTITY: QuantityRow[] = [
    { maxGuests: 30, value: 10 },
    { maxGuests: 70, value: 15 },
    { maxGuests: 120, value: 20 },
    { maxGuests: 200, value: 25 },
    { maxGuests: 300, value: 30 },
    { maxGuests: 1000, value: 35 }
];

export const DISH_QUANTITY_TABLE = [
    { name: 'צלחת ראשונות 12', price: 1.4, buffet: '1.5x + 2', market: '1.5x + 2', stations: '1.5x + 2', rotating: '-' },
    { name: 'צלחת קינוח 12', price: 1.4, buffet: '1.3x', market: '1.3x', stations: '1.3x', rotating: '-' },
    { name: 'צלחת עיקרית 19', price: 1.4, buffet: '1.3x', market: '1.3x', stations: '1.3x', rotating: '-' },
    { name: 'מזלגון', price: 1.2, buffet: '1.3x', market: '-', stations: '-', rotating: '-' },
    { name: 'מזלג', price: 1.2, buffet: '1.3x', market: '-', stations: '-', rotating: '-' },
    { name: 'סכין', price: 1.2, buffet: '0.5x', market: '0.5x', stations: '0.5x', rotating: '0.5x' },
    { name: 'כפית', price: 1.2, buffet: '1x + 1', market: '1x + 1', stations: '1x + 1', rotating: '1x + 1' },
    { name: 'כוס שתייה חמה', price: 1.4, buffet: '1.3x', market: '1.3x', stations: '1.3x', rotating: '1.3x' },
    { name: 'צלחת דקל (קינוח)', price: 0.5, buffet: '-', market: '-', stations: '3x', rotating: '-' },
    { name: 'צלחת דקל (מנה)', price: 0.5, buffet: '-', market: '-', stations: '-', rotating: '7x' },
];


// --- Helper Functions ---

function getLookupRow<T extends { maxGuests: number }>(table: T[], guests: number): T {
    const match = table.find(row => row.maxGuests >= guests);
    return match || table[table.length - 1];
}

function getColumnKeyForEventType(eventType: string): 'buffet' | 'market' | 'stations' | 'rotating' {
    switch (eventType) {
        case "בופה": return 'buffet';
        case "שוק": return 'market';
        case "ביס בעמדות": return 'stations';
        case "ביס מסתובבים": return 'rotating';
        default: return 'buffet';
    }
}

function getColumnKeyForFoodStyle(foodStyle: string): keyof CostRow {
    switch(foodStyle) {
        case "הכל": return 'all';
        case "בשר בלי דגים": return 'meatNoFish';
        case "צמחוני": return 'vegetarian';
        case "טבעוני": return 'vegan';
        case "צמחוני דגים": return 'pescatarian';
        default: return 'all';
    }
}

// --- MAIN CALCULATOR ---

export const calculateQuoteDetails = (formData: EventFormData): CalculationResult => {
    const { guests, eventType, foodStyle, distanceType, includeClearing, includeNightStation, nightStationCost = 0, fishLocation = 'both', dreamItems = [], kosherType = 'none', eventClass } = formData;
    const audit: AuditItem[] = [];

    // Helper to add audit item with 18% VAT Logic (except for Vegetables AND Labor)
    const addAudit = (category: AuditItem['category'], name: string, qty: number, basePrice: number, explanation: string) => {
        if (qty > 0) {
            // Logic: Vegetables AND Labor (כוח אדם) are exempt from the extra VAT addition. 
            // Also exempt: Night Station and Travel Reimbursements.
            // Everything else gets +18%.
            const isExempt = name === 'ירקות ופירות' || 
                             category === 'כוח אדם' || 
                             name.includes('עמדת לילה') || 
                             name.includes('החזרי נסיעות');

            const priceWithInputVat = isExempt ? basePrice : basePrice * 1.18; // 18% Input VAT
            
            // Append VAT info to explanation if applicable
            let finalExplanation = explanation;
            if (!isExempt) {
                finalExplanation += ' (כולל מע"מ 18%)';
            }

            audit.push({
                category,
                name,
                quantity: qty,
                unitPrice: priceWithInputVat,
                total: qty * priceWithInputVat,
                explanation: finalExplanation
            });
        }
    };

    const eventKey = getColumnKeyForEventType(eventType);
    const foodKey = getColumnKeyForFoodStyle(foodStyle);

    // --- 1. FOOD COSTS ---
    
    // Veg & Fruit
    const vegRow = getLookupRow(VEG_COST_TABLE, guests);
    addAudit('מזון', 'ירקות ופירות', 1, vegRow[foodKey], `טבלה: ${guests} אורחים`);

    // Dry Goods & Cheese
    const dryRow = getLookupRow(DRY_GOODS_COST_TABLE, guests);
    addAudit('מזון', 'יבשים וגבינות', 1, dryRow[foodKey], `טבלה: ${guests} אורחים`);

    // Bread
    const breadRow = getLookupRow(BREAD_COST_TABLE, guests);
    addAudit('מזון', 'לחמים ומאפים', 1, breadRow[foodKey], `טבלה: ${guests} אורחים`);

    // Olive Oil
    const oilRow = getLookupRow(OIL_QUANTITY_TABLE, guests);
    const oilLiters = oilRow[foodKey];
    addAudit('מזון', 'שמן זית', oilLiters, FIXED_COSTS.OLIVE_OIL_PRICE_PER_LITER, `${oilLiters} ליטר לפי טבלה`);

    // Meat
    const hasMeat = foodStyle === "הכל" || foodStyle === "בשר בלי דגים";
    if (hasMeat) {
        addAudit('מזון', 'בשר', guests, FIXED_COSTS.PORTION_MEAT * FIXED_COSTS.MEAT_PRICE_PER_KG, 
            `${FIXED_COSTS.PORTION_MEAT} ק"ג לאדם * ${FIXED_COSTS.MEAT_PRICE_PER_KG} ₪/ק"ג`);
    }

    // Fish
    const hasFish = foodStyle === "הכל" || foodStyle === "צמחוני דגים";
    if (hasFish) {
        if (fishLocation === 'starters' || fishLocation === 'both') {
             addAudit('מזון', 'דג (ראשונות)', guests, FIXED_COSTS.PORTION_FISH_STARTER * FIXED_COSTS.FISH_STARTER_PRICE_PER_KG, 
                `${FIXED_COSTS.PORTION_FISH_STARTER} ק"ג לאדם * ${FIXED_COSTS.FISH_STARTER_PRICE_PER_KG} ₪/ק"ג`);
        }
        if (fishLocation === 'mains' || fishLocation === 'both') {
             addAudit('מזון', 'דג (עיקריות)', guests, FIXED_COSTS.PORTION_FISH_MAIN * FIXED_COSTS.FISH_MAIN_PRICE_PER_KG, 
                `${FIXED_COSTS.PORTION_FISH_MAIN} ק"ג לאדם * ${FIXED_COSTS.FISH_MAIN_PRICE_PER_KG} ₪/ק"ג`);
        }
    }
    
    // Night Station (Extra Cost) - EXEMPT FROM VAT
    if (includeNightStation && nightStationCost > 0) {
        addAudit('מזון', 'עמדת לילה (תוספת למנה)', guests, nightStationCost, 'תוספת ידנית למנה');
    }

    // --- 2. LABOR COSTS ---
    
    // Kitchen
    const kitchenRow = getLookupRow(KITCHEN_STAFF_TABLE, guests);
    const kitchenCount = kitchenRow[eventKey];
    addAudit('כוח אדם', 'עובדי מטבח', kitchenCount, FIXED_COSTS.KITCHEN_WORKER_COST, `טבלה: עד ${kitchenRow.maxGuests} אורחים`);

    // Floor (Waiters)
    const floorRow = getLookupRow(FLOOR_STAFF_TABLE, guests);
    const floorCount = floorRow[eventKey];
    addAudit('כוח אדם', 'מלצרים/פלור', floorCount, FIXED_COSTS.WAITER_COST, `טבלה: עד ${floorRow.maxGuests} אורחים`);

    // Dishwasher
    addAudit('כוח אדם', 'שטף כלים', 1, FIXED_COSTS.DISHWASHER_COST, 'קבוע לאירוע');

    // Managers
    addAudit('כוח אדם', 'מנהל מטבח', 1, FIXED_COSTS.KITCHEN_MANAGER_COST, 'קבוע לאירוע');
    addAudit('כוח אדם', 'מנהל לוגיסטיקה', 1, FIXED_COSTS.LOGISTICS_MANAGER_COST, 'קבוע לאירוע');
    
    // Logistics Worker (0 up to 100, 1 above)
    const logisticsWorkerCount = guests > 100 ? 1 : 0;
    if (logisticsWorkerCount > 0) {
        addAudit('כוח אדם', 'עובד לוגיסטיקה', logisticsWorkerCount, FIXED_COSTS.LOGISTICS_WORKER_COST, 'מעל 100 אורחים');
    }
    
    // Event Manager (1 up to 150, 1.5 above)
    // Using 2 people but splitting cost or logic? Assuming we charge 1.5 units of "Manager Cost"
    const floorManagerQty = guests > 150 ? 1.5 : 1;
    addAudit('כוח אדם', 'מנהל אירוע', floorManagerQty, FIXED_COSTS.FLOOR_MANAGER_COST, floorManagerQty > 1 ? 'מעל 150 אורחים' : 'בסיס');

    // Clearing Staff (Pinuyim)
    if (includeClearing) {
        const clearingCount = Math.ceil(guests / 70);
        addAudit('כוח אדם', 'צוות פינוי', clearingCount, FIXED_COSTS.CLEARING_STAFF_COST, 'לפי 1 ל-70 אורחים');
    }


    // --- 3. LOGISTICS ---
    
    // Kosher Costs
    if (kosherType === 'certificate') {
        const certCost = eventClass === 'small' ? FIXED_COSTS.KOSHER_CERTIFICATE_SMALL : FIXED_COSTS.KOSHER_CERTIFICATE_MEDIUM_LARGE;
        const certLabel = eventClass === 'small' ? 'אירוע קטן' : 'אירוע בינוני/גדול';
        addAudit('לוגיסטיקה', 'תעודת כשרות (אגרה וטיפול)', 1, certCost, `תוספת כשרות - ${certLabel}`);
    } else if (kosherType === 'supervisor') {
        let supervisorCost = FIXED_COSTS.KOSHER_SUPERVISOR_BASE;
        let explanation = 'מחיר בסיס';
        if (distanceType === 'special') {
            supervisorCost = FIXED_COSTS.KOSHER_SUPERVISOR_FAR;
            explanation = 'כולל תוספת מרחק';
        }
        addAudit('כוח אדם', 'משגיח כשרות צמוד', 1, supervisorCost, `תוספת משגיח (${explanation})`);
    }

    // Transport (Truck) - Moved to RENTAL category, renamed
    let truckCost = 0;
    let truckLabel = '';
    if (distanceType === 'close') { truckCost = FIXED_COSTS.TRUCK_BASE_CLOSE; truckLabel = 'קרוב'; }
    else if (distanceType === 'far') { truckCost = FIXED_COSTS.TRUCK_BASE_FAR; truckLabel = 'רחוק'; }
    else { truckCost = FIXED_COSTS.TRUCK_BASE_SPECIAL; truckLabel = 'מיוחד'; }
    addAudit('השכרה', `הובלת ציוד השכרה (${truckLabel})`, 1, truckCost, 'הובלת ציוד');
    
    // Truck Fuel
    let distanceKm = distanceType === 'close' ? FIXED_COSTS.KM_CLOSE : (distanceType === 'far' ? FIXED_COSTS.KM_FAR : FIXED_COSTS.KM_SPECIAL);
    addAudit('לוגיסטיקה', 'דלק משאית', distanceKm, FIXED_COSTS.FUEL_RATE_PER_KM, `${distanceKm} ק"מ`);

    // Staff Cars - EXEMPT FROM VAT
    const carsRow = getLookupRow(CARS_TABLE, guests);
    const carsCount = carsRow[eventKey];
    addAudit('לוגיסטיקה', 'החזרי נסיעות (רכבים)', carsCount, distanceKm * FIXED_COSTS.STAFF_TRAVEL_RATE_PER_KM, 
        `${carsCount} רכבים * ${distanceKm} ק"מ * ${FIXED_COSTS.STAFF_TRAVEL_RATE_PER_KM} ש"ח`);


    // --- 4. EQUIPMENT ---

    // Serving Stations
    // Map "עמדות פרונטליות" to "buffet" key in logic
    if (eventType === 'בופה') {
        const stationsRow = getLookupRow(SERVING_STATIONS_QUANTITY, guests);
        addAudit('השכרה', 'עמדות הגשה', stationsRow.value, FIXED_COSTS.STATION_COST, 'לפי מפתח בופה');
    } else {
        // Fallback or specific logic for other types if needed, using standard table
        const stationCountRow = getLookupRow(STATIONS_COUNT_TABLE, guests);
        const stationsNeeded = stationCountRow[eventKey];
        if (stationsNeeded > 0) {
            addAudit('השכרה', 'עמדות קצה', stationsNeeded, FIXED_COSTS.STATION_COST, 'לפי מפתח עמדות');
        }
    }

    // Heavy Equipment Tables
    const fridgeRow = getLookupRow(FRIDGE_TABLE, guests);
    addAudit('השכרה', 'מקרר', fridgeRow.value, FIXED_COSTS.FRIDGE_COST, 'לפי כמות אורחים');

    const ovenQty = guests > 100 ? 1 : 0;
    if (ovenQty > 0) addAudit('השכרה', 'תנור תעשייתי', ovenQty, FIXED_COSTS.OVEN_COST, 'מעל 100 אורחים');

    const warmerQty = guests > 100 ? 1 : 0;
    if (warmerQty > 0) addAudit('השכרה', 'ארון חימום', warmerQty, FIXED_COSTS.WARMER_COST, 'מעל 100 אורחים');

    const workTableRow = getLookupRow(WORK_TABLE_QUANTITY, guests);
    addAudit('השכרה', 'שולחנות עבודה', workTableRow.value, FIXED_COSTS.WORK_TABLE_COST, 'לפי טבלה');

    const gasRow = getLookupRow(GAS_QUANTITY, guests);
    addAudit('השכרה', 'בלוני גז', gasRow.value, FIXED_COSTS.GAS_BALLOON_PRICE, 'לפי טבלה');

    const coalsRow = getLookupRow(COALS_TABLE, guests);
    // Coals is total price in JSON, assumed as cost. If bag price is 80, we calc bags or just add cost.
    // The table provides VALUE (price or quantity?). JSON says "160, 240". 160 is 2 bags (2*80). 
    // Assuming the table value is the COST.
    addAudit('השכרה', 'פחמים', 1, coalsRow.value, 'לפי טבלה'); // Quantity 1 of "Coal Package"

    // --- DISHES LOGIC ---
    
    // 1. Palm Dessert Plate (3x) - Only for "ביס בעמדות"
    if (eventType === 'ביס בעמדות') {
        addAudit('השכרה', 'צלחת דקל לקינוח', guests * 3, FIXED_COSTS.PRICE_PALM_DESSERT, 'מקדם 3');
    }

    // 2. Palm Main Plate (7x) - Only for "ביס מסתובבים"
    if (eventType === 'ביס מסתובבים') {
        addAudit('השכרה', 'צלחת דקל', guests * 7, FIXED_COSTS.PRICE_PALM_MAIN, 'מקדם 7');
    }

    // 3. Rental Plates (Buffet, Market, Station Bites)
    if (['בופה', 'שוק', 'ביס בעמדות'].includes(eventType)) {
        // Rental 12 First (1.5x + 2)
        const rental12Qty = Math.ceil(guests * 1.5) + 2;
        addAudit('השכרה', 'צלחת ראשונות השכרה 12', rental12Qty, FIXED_COSTS.PRICE_RENTAL_12, '1.5x + 2');

        // Rental 12 Dessert (1.3x)
        addAudit('השכרה', 'צלחת קינוח השכרה 12', Math.ceil(guests * 1.3), FIXED_COSTS.PRICE_RENTAL_12, 'מקדם 1.3');

        // Rental 19 (1.3x)
        addAudit('השכרה', 'צלחת השכרה 19', Math.ceil(guests * 1.3), FIXED_COSTS.PRICE_RENTAL_19, 'מקדם 1.3');
    }

    // 4. Cutlery
    // Fork Small (1.3x) - "בופה"
    if (eventType === 'בופה') {
        addAudit('השכרה', 'מזלגון', Math.ceil(guests * 1.3), FIXED_COSTS.PRICE_FORK_SMALL, 'מקדם 1.3');
        addAudit('השכרה', 'מזלג', Math.ceil(guests * 1.3), FIXED_COSTS.PRICE_FORK, 'מקדם 1.3');
    }
    // Knife (0.5x) - All
    addAudit('השכרה', 'סכין', Math.ceil(guests * 0.5), FIXED_COSTS.PRICE_KNIFE, 'מקדם 0.5');
    
    // Teaspoon (1x + 1) - All
    addAudit('השכרה', 'כפית', guests + 1, FIXED_COSTS.PRICE_TEASPOON, 'מקדם 1 + 1');

    // Spoon (Table) - All? (Assumed based on data presence)
    const spoonRow = getLookupRow(SPOON_QUANTITY, guests);
    addAudit('השכרה', 'כף', spoonRow.value, FIXED_COSTS.PRICE_SPOON, 'לפי טבלה');

    // Hot Cup (1.3x) - All
    addAudit('השכרה', 'כוס שתייה חמה', Math.ceil(guests * 1.3), FIXED_COSTS.PRICE_HOT_CUP, 'מקדם 1.3');

    
    // Disposables (Napkins, wipes, etc)
    let disposableCost = FIXED_COSTS.DISPOSABLES_SMALL;
    if (guests > 100) disposableCost = FIXED_COSTS.DISPOSABLES_MEDIUM;
    if (guests > 200) disposableCost = FIXED_COSTS.DISPOSABLES_LARGE;
    addAudit('השכרה', 'ציוד מטבח מתקלה', 1, disposableCost, 'לפי גודל אירוע');

    // --- 5. DREAMS / EXTRAS ---
    dreamItems.forEach(item => {
        if (item.price > 0) {
            addAudit('תוספות', item.name, 1, item.price, 'תוספת מיוחדת');
        }
    });

    // --- SUMMARY & CALCULATIONS ---
    
    const directCost = audit.reduce((sum, item) => sum + item.total, 0);
    const safetyMargin = 0; 
    
    // Overhead: 18% of Direct Costs
    const overhead = directCost * 0.18; 
    
    // Profit Logic: 20% of Direct Costs (Changed from 30%)
    const profitComponent = directCost * 0.20; 

    const finalPriceRaw = directCost + overhead + profitComponent;
    
    const finalPrice = Math.ceil(finalPriceRaw / 100) * 100; // Round to 100
    const pricePerPerson = Math.ceil(finalPrice / guests);

    const breakdown: CostBreakdown = {
        food: audit.filter(i => i.category === 'מזון').reduce((s, i) => s + i.total, 0),
        labor: audit.filter(i => i.category === 'כוח אדם').reduce((s, i) => s + i.total, 0),
        equipment: audit.filter(i => i.category === 'השכרה').reduce((s, i) => s + i.total, 0),
        logistics: audit.filter(i => i.category === 'לוגיסטיקה' || i.category === 'תוספות').reduce((s, i) => s + i.total, 0)
    };

    const pricingSteps: PricingSteps = {
        directCost,
        safetyMargin,
        overhead,
        profitMultiplier: 0.2, // Changed from 0.3
        finalPrice
    };

    return {
        totalPrice: finalPrice,
        pricePerPerson,
        stationsCount: 0, // Stations logic moved to audit items directly
        breakdown,
        auditDetails: audit,
        pricingSteps
    };
};
