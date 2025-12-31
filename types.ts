
export interface DreamItem {
  id: string;
  name: string;
  price: number;
}

export interface EventFormData {
  customerName: string;
  eventDate?: string; // Made optional
  guests: number;
  dietaryPreferences: string; 
  eventClass: 'small' | 'medium' | 'large';
  kosherType: 'none' | 'certificate' | 'supervisor';
  distanceType: 'close' | 'far' | 'special';
  eventType: string; 
  foodStyle: string;
  // New Fields
  fishLocation?: 'starters' | 'mains' | 'both';
  includeClearing: boolean;
  includeNightStation?: boolean; // New
  nightStationCost?: number; // New: Manual cost per head
  eventOrder: string;
  dreamItems: DreamItem[]; // New field for "Dream Realization"
}

export interface AuditItem {
  category: 'מזון' | 'כוח אדם' | 'השכרה' | 'לוגיסטיקה' | 'תוספות';
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  explanation: string; // The logic behind the calculation
}

export interface PricingSteps {
  directCost: number;
  safetyMargin: number;
  overhead: number;
  profitMultiplier: number;
  finalPrice: number;
}

export interface CalculationResult {
  totalPrice: number;
  pricePerPerson: number;
  stationsCount: number;
  breakdown: CostBreakdown;
  auditDetails: AuditItem[];
  pricingSteps: PricingSteps; // New field for specific calculation steps
}

export interface MenuCategories {
  counter: string[];   
  field: string[];     
  taboon: string[];    
  coals: string[];     
  sweets: string[];    
}

export interface ProposalResponse {
  customer_name: string;
  total_price: number;
  stations_count: number;
  menu_draft: MenuCategories;
  summary_text: string;
  audit_details: AuditItem[]; // Added for the review document
}

export const SERVING_STYLES = [
  "בופה",
  "שוק",
  "ביס בעמדות",
  "ביס מסתובבים"
];

// New Constraints Definition
export const SERVING_STYLE_LIMITS: Record<string, { min: number, max: number }> = {
  "בופה": { min: 1, max: 150 },
  "שוק": { min: 50, max: 400 },
  "ביס בעמדות": { min: 50, max: 400 },
  "ביס מסתובבים": { min: 1, max: 120 }
};

export const FOOD_STYLES = [
  "הכל",
  "טבעוני",
  "צמחוני",
  "צמחוני דגים",
  "בשר בלי דגים"
];

export const FISH_LOCATIONS = [
    { label: 'ראשונות בלבד', value: 'starters' },
    { label: 'עיקריות בלבד', value: 'mains' },
    { label: 'גם וגם', value: 'both' }
];

export const EVENT_ORDERS = [
  "חתונה הפוכה",
  "חתונה מפוצלת"
];

export const DISTANCE_TYPES = [
  { label: 'קרוב', value: 'close' },
  { label: 'רחוק', value: 'far' },
  { label: 'מיוחד', value: 'special' }
];

export interface CostBreakdown {
  food: number;
  labor: number;
  equipment: number;
  logistics: number;
}

// New Types for CRM features
export interface LeadTask {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate?: string;
  assignedTo?: string; // Optional: Employee name
}

export interface LeadActivity {
  id: string;
  type: 'note' | 'status_change' | 'call' | 'email' | 'meeting' | 'system';
  content: string;
  timestamp: string;
  author: string;
}

export interface OperationalStatus {
    menuFinalized: boolean;
    staffArranged: boolean;
    equipmentOrdered: boolean;
    vehiclesArranged: boolean;
    foodOrdered: boolean;
}

// Operations & Staffing Types
export interface Worker {
    id: string;
    name: string;
    origin: string; // From where (e.g., Haifa, TLV)
    phone?: string; 
    // Wage & Hours Fields
    hourlyWage?: number; // Default 60
    startTime?: string; // Format HH:MM
    travelDistance?: number; // In KM
    isPaid?: boolean;
}

export interface StaffingDetails {
    kitchenWorkers: Worker[];
    floorWorkers: Worker[];
    kitchenManager: string; // Default: Noam
    floorManager: string;
    eventManager: string; // Default: Yael
    eventEndTime?: string; // Format HH:MM for global calculation
}

export interface EventManagementDetails {
    schedule: string;
    producerName: string;
    producerPhone: string;
    notes: string;
}

export interface SavedFile {
    id: string;
    name: string;
    type: 'pdf' | 'doc';
    date: string;
    isGenerated: boolean;
}

export interface SavedEvent extends EventFormData {
  id: string; 
  status: 'פנייה ראשונית' | 'אחרי שיחת היכרות' | 'קיבלו הצעת מחיר' | 'ממתין להעברת מקדמה' | 'סגור' | 'לא רלוונטי' | 'בוצע'; 
  totalPrice?: number;
  createdAt: string;
  
  email?: string;
  additionalEmail?: string; // New
  phone?: string;
  additionalPhone?: string;
  leadSource?: 'פייסבוק' | 'אינסטגרם' | 'גוגל' | 'המלצה מלקוח' | 'שיתוף פעולה';
  campaignName?: string; // Marketing campaign tracking

  location?: string;
  
  introCall?: string; 
  proposalLink?: string; 
  proposalStatus?: 'not_generated' | 'draft' | 'approved' | 'sent'; // New field for approval workflow
  isSigned?: boolean; // New field for contract signature status
  followUpDate?: string; 
  meetingScheduled?: string; // New: Tracks if a meeting is set (ISO Date)
  lastCallSummary?: string; 
  notes?: string; 

  pricePerHead?: number;
  isPriceVerified?: boolean; // New field: Indicates price was calculated/verified in calculator
  extrasDescription?: string; 
  extrasCost?: number;
  estimatedCost?: number; 
  costBreakdown?: CostBreakdown; 
  
  actualCostBreakdown?: CostBreakdown; 
  debriefNotes?: string; 
  
  paymentStatus?: 'טרם שולם' | 'שולמה מקדמה' | 'שולם מלא' | 'חוב';
  
  // Generated Proposal Data
  menu_draft?: MenuCategories;
  summary_text?: string;
  auditDetails?: AuditItem[];

  // CRM Enhancements
  tasks?: LeadTask[];
  activities?: LeadActivity[];
  savedFiles?: SavedFile[]; // New field for manually saved docs
  
  // Operations Logic
  operationalStatus?: OperationalStatus;
  
  // NEW: Ops Data
  staffing?: StaffingDetails;
  opsTasks?: LeadTask[]; // Specific tasks for operations
  managementDetails?: EventManagementDetails;
  menuFile?: string; // New field for uploaded menu file

  // Legacy fields
  followUp1?: string; 
  followUp2?: string;
  isClosed?: boolean;
  advancePayment?: boolean;
  tastingDate?: string;
  lostReason?: string;
}

export type Tab = 'proposal' | 'crm' | 'operations' | 'finance' | 'timeline';

// --- Auth & RBAC ---
export type Role = 'admin' | 'sales' | 'operations';

export interface User {
    username: string;
    name: string;
    role: Role;
}
