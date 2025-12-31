
import React, { useState, useEffect } from 'react';
import { EventFormData, SERVING_STYLES, FOOD_STYLES, EVENT_ORDERS, DISTANCE_TYPES, CalculationResult, DreamItem, SERVING_STYLE_LIMITS, FISH_LOCATIONS } from '../types';
import { calculateQuoteDetails } from '../services/pricingCalculator';

interface EventFormProps {
  onSubmit: (data: EventFormData) => void;
  isLoading: boolean;
}

const EventForm: React.FC<EventFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<EventFormData>({
    customerName: '',
    eventDate: '',
    guests: 50,
    eventType: SERVING_STYLES[0],
    dietaryPreferences: '',
    eventClass: 'small', 
    kosherType: 'none',   
    distanceType: 'close',
    foodStyle: FOOD_STYLES[0],
    eventOrder: EVENT_ORDERS[0],
    includeClearing: false, // Default no clearing
    includeNightStation: false, // Default no night station
    nightStationCost: 0, 
    fishLocation: 'both', // Default
    dreamItems: [] 
  });

  const [liveQuote, setLiveQuote] = useState<CalculationResult | null>(null);

  // Validate and Auto-Correct Serving Style when Guests Change
  useEffect(() => {
    const limits = SERVING_STYLE_LIMITS[formData.eventType];
    if (limits) {
        if (formData.guests < limits.min || formData.guests > limits.max) {
             // Find a valid fallback
             const validStyle = SERVING_STYLES.find(style => {
                 const l = SERVING_STYLE_LIMITS[style];
                 return formData.guests >= l.min && formData.guests <= l.max;
             });
             
             if (validStyle) {
                 setFormData(prev => ({ ...prev, eventType: validStyle }));
             }
        }
    }
  }, [formData.guests]);

  useEffect(() => {
    let size: 'small' | 'medium' | 'large' = 'small';
    if (formData.guests > 200) size = 'large';
    else if (formData.guests > 100) size = 'medium';
    else size = 'small';

    if (formData.eventClass !== size) {
        setFormData(prev => ({ ...prev, eventClass: size }));
    }

    const updatedData = { ...formData, eventClass: size };
    const quote = calculateQuoteDetails(updatedData);
    setLiveQuote(quote);

  }, [formData.guests, formData.eventType, formData.foodStyle, formData.distanceType, formData.kosherType, formData.eventOrder, formData.eventClass, formData.dreamItems, formData.includeClearing, formData.fishLocation, formData.includeNightStation, formData.nightStationCost]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let finalValue: any = value;

    if (name === 'guests') {
        const parsed = parseInt(value) || 0;
        // Cap guests at 400
        if (parsed > 400) finalValue = 400;
        else finalValue = parsed;
    }
    
    if (name === 'nightStationCost') {
        finalValue = parseFloat(value) || 0;
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleSelection = (name: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- Dream Items Logic ---
  const addDreamItem = () => {
    setFormData(prev => ({
      ...prev,
      dreamItems: [...prev.dreamItems, { id: crypto.randomUUID(), name: '', price: 0 }]
    }));
  };

  const removeDreamItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      dreamItems: prev.dreamItems.filter(item => item.id !== id)
    }));
  };

  const updateDreamItem = (id: string, field: keyof DreamItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      dreamItems: prev.dreamItems.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getEventClassLabel = (cls: string) => {
      switch(cls) {
          case 'small': return 'אירוע קטן (עד 100)';
          case 'medium': return 'אירוע בינוני (100-200)';
          case 'large': return 'אירוע גדול (200+)';
          default: return '';
      }
  };

  // Colorful Badge Logic
  const getSizeColor = (cls: string) => {
      switch(cls) {
          case 'small': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
          case 'medium': return 'bg-violet-100 text-violet-800 border-violet-200';
          case 'large': return 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200';
          default: return 'bg-stone-100';
      }
  };

  // Compact Toggle Component
  const CompactToggle = ({ 
      label, 
      options, 
      value, 
      field, 
      colorClass, 
      gridCols = 'grid-cols-2',
      guestCount // Optional pass for validation
  }: { 
      label: string, 
      options: {label: string, value: string}[], 
      value: string, 
      field: keyof EventFormData, 
      colorClass: string,
      gridCols?: string,
      guestCount?: number
  }) => (
    <div className="flex flex-col gap-1.5 animate-fade-in">
        <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">{label}</label>
        <div className={`grid ${gridCols} gap-1.5`}>
            {options.map((opt) => {
                const isActive = value === opt.value;
                let isDisabled = false;
                let disabledReason = "";

                // Check constraints if guestCount is provided (only for eventType field)
                if (field === 'eventType' && guestCount !== undefined) {
                    const limits = SERVING_STYLE_LIMITS[opt.value];
                    if (limits) {
                        if (guestCount < limits.min || guestCount > limits.max) {
                            isDisabled = true;
                            disabledReason = `טווח אורחים: ${limits.min}-${limits.max}`;
                        }
                    }
                }

                return (
                <button
                    key={opt.value}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleSelection(field, opt.value)}
                    title={isDisabled ? disabledReason : ''}
                    className={`px-1 py-2 rounded-md text-xs font-medium transition-all duration-200 border shadow-sm w-full text-center truncate relative group
                        ${isDisabled 
                            ? 'bg-stone-50 text-stone-300 border-stone-100 cursor-not-allowed decoration-stone-300' 
                            : (isActive 
                                ? `${colorClass} text-white border-transparent shadow-md transform scale-[1.02]` 
                                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-50')
                        }`}
                >
                    {opt.label}
                    {isDisabled && (
                         <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-stone-800 text-white text-[9px] py-1 px-2 rounded shadow-lg whitespace-nowrap z-20">
                             {disabledReason}
                         </div>
                    )}
                </button>
            )})}
        </div>
    </div>
  );

  // Check if fish options should be shown
  const showFishOptions = formData.foodStyle === "הכל" || formData.foodStyle === "צמחוני דגים";

  return (
    <div className="w-full max-w-5xl mx-auto bg-white/95 backdrop-blur-xl p-4 md:p-6 rounded-3xl shadow-2xl border border-white ring-1 ring-black/5 flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        
        {/* Top Row: Basic Details (Inputs) */}
        <div className="grid grid-cols-12 gap-3 md:gap-4">
            {/* Customer Name */}
            <div className="col-span-12 md:col-span-4 bg-blue-50/50 p-3 rounded-2xl border border-blue-100 hover:border-blue-300 transition-colors group">
                <label className="block text-xs font-bold text-blue-800 mb-1 group-hover:text-blue-600" htmlFor="customerName">שם הלקוח</label>
                <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                    className="w-full bg-transparent border-none p-0 text-stone-800 font-bold focus:ring-0 placeholder-blue-300 text-sm"
                    placeholder="ישראל ישראלי"
                />
            </div>
            {/* Date - NOT REQUIRED */}
            <div className="col-span-12 md:col-span-3 bg-blue-50/50 p-3 rounded-2xl border border-blue-100 hover:border-blue-300 transition-colors group">
                <label className="block text-xs font-bold text-blue-800 mb-1 group-hover:text-blue-600" htmlFor="eventDate">תאריך (אופציונלי)</label>
                <input
                    type="date"
                    id="eventDate"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleChange}
                    className="w-full bg-transparent border-none p-0 text-stone-800 font-bold focus:ring-0 text-sm"
                />
            </div>
            {/* Guests - Max 400 */}
            <div className={`col-span-12 md:col-span-5 p-3 rounded-2xl border transition-colors group flex items-center justify-between ${getSizeColor(formData.eventClass)}`}>
                <div className="flex-1">
                    <label className="block text-xs font-bold mb-1 opacity-80" htmlFor="guests">כמות אורחים (מקס' 400)</label>
                    <input
                        type="number"
                        id="guests"
                        name="guests"
                        min="1"
                        max="400"
                        value={formData.guests}
                        onChange={handleChange}
                        required
                        className="w-20 bg-transparent border-none p-0 font-black text-xl focus:ring-0"
                    />
                </div>
                <div className="text-right">
                    <span className="block text-[10px] font-bold opacity-60 uppercase">סיווג אוטומטי</span>
                    <span className="text-sm font-bold">{getEventClassLabel(formData.eventClass)}</span>
                </div>
            </div>
        </div>

        {/* Middle Section: Configuration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            
            {/* Left Column: Food & Style (Green/Teal Theme) */}
            <div className="space-y-4">
                 <CompactToggle 
                    label="פורמט הגשה" 
                    field="eventType"
                    value={formData.eventType}
                    options={SERVING_STYLES.map(s => ({ label: s, value: s }))}
                    colorClass="bg-teal-600"
                    gridCols="grid-cols-2 md:grid-cols-4"
                    guestCount={formData.guests}
                />
                <CompactToggle 
                    label="סגנון קולינרי" 
                    field="foodStyle"
                    value={formData.foodStyle}
                    options={FOOD_STYLES.map(s => ({ label: s, value: s }))}
                    colorClass="bg-emerald-600"
                    gridCols="grid-cols-2 md:grid-cols-4"
                />
                
                {/* CONDITIONAL FISH SELECTION */}
                {showFishOptions && (
                    <CompactToggle 
                        label="שילוב דגים בתפריט" 
                        field="fishLocation"
                        value={formData.fishLocation || 'both'}
                        options={FISH_LOCATIONS}
                        colorClass="bg-blue-600"
                        gridCols="grid-cols-3"
                    />
                )}

                 <CompactToggle 
                    label="כשרות" 
                    field="kosherType"
                    value={formData.kosherType}
                    options={[
                        { label: 'ללא תעודה', value: 'none' },
                        { label: 'תעודת כשרות', value: 'certificate' },
                        { label: 'משגיח צמוד', value: 'supervisor' }
                    ]}
                    colorClass="bg-lime-600"
                    gridCols="grid-cols-3"
                />
                
                {/* Dietary Input (Small) */}
                <div className="pt-2">
                    <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1 block" htmlFor="dietaryPreferences">
                        רגישויות ומגבלות תזונה
                    </label>
                    <input
                        type="text"
                        id="dietaryPreferences"
                        name="dietaryPreferences"
                        value={formData.dietaryPreferences}
                        onChange={handleChange}
                        className="w-full p-2.5 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition text-sm"
                        placeholder="למשל: 2 צליאק, 5 טבעונים, אלרגיה לאגוזים..."
                    />
                </div>
            </div>

            {/* Right Column: Logistics & Dreams (Amber/Orange Theme) */}
            <div className="space-y-4 flex flex-col h-full">
                <div className="grid grid-cols-2 gap-4">
                     <CompactToggle 
                        label="מרחק" 
                        field="distanceType"
                        value={formData.distanceType}
                        options={DISTANCE_TYPES}
                        colorClass="bg-amber-500"
                        gridCols="grid-cols-1"
                     />
                     <div className="flex flex-col gap-2">
                        <CompactToggle 
                            label="סדר אירוע" 
                            field="eventOrder"
                            value={formData.eventOrder}
                            options={EVENT_ORDERS.map(s => ({ label: s, value: s }))}
                            colorClass="bg-orange-500"
                            gridCols="grid-cols-1"
                        />
                        {/* Clearing (Pinuyim) Toggle */}
                        <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-200 mt-auto">
                            <span className="text-xs font-bold text-stone-600">צוות לפינוי</span>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, includeClearing: !prev.includeClearing }))}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.includeClearing ? 'bg-orange-500' : 'bg-stone-300'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${formData.includeClearing ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        {/* Night Station Toggle & Input */}
                        <div className="flex flex-col gap-2 bg-stone-50 border border-stone-200 rounded-lg p-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-stone-600">עמדת לילה</span>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, includeNightStation: !prev.includeNightStation }))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.includeNightStation ? 'bg-purple-500' : 'bg-stone-300'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${formData.includeNightStation ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            
                            {formData.includeNightStation && (
                                <div className="animate-fade-in-up">
                                    <div className="relative">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-bold">₪ למנה</span>
                                        <input 
                                            type="number"
                                            name="nightStationCost"
                                            placeholder="תוספת עלות למנה"
                                            value={formData.nightStationCost || ''}
                                            onChange={handleChange}
                                            className="w-full text-xs p-1.5 pl-14 rounded border border-purple-200 focus:border-purple-400 focus:ring-1 focus:ring-purple-200 outline-none text-purple-900 font-bold bg-white"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                     </div>
                </div>
                
                {/* Dream Realization Section (Replaces generic notes) */}
                <div className="flex-1 flex flex-col pt-2 border-t border-dashed border-stone-200 mt-2">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            הגשמת חלומות (תוספות)
                        </label>
                        <button 
                            type="button" 
                            onClick={addDreamItem}
                            className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100 font-bold transition flex items-center gap-1"
                        >
                            + הוסף שורה
                        </button>
                    </div>
                    
                    <div className="flex-1 bg-stone-50 rounded-xl border border-stone-200 p-2 overflow-y-auto max-h-[200px] space-y-2 custom-scrollbar">
                         {formData.dreamItems.length === 0 && (
                             <div className="text-center text-xs text-stone-400 py-4 italic">
                                 לחץ על "הוסף שורה" כדי להוסיף תוספות מיוחדות לאירוע (דיג'יי, עיצוב, עמדת קוקטיילים...)
                             </div>
                         )}
                         
                         {formData.dreamItems.map((item) => (
                             <div key={item.id} className="flex gap-2 items-center animate-fade-in-up">
                                 <input
                                    type="text"
                                    placeholder="תיאור החלום / התוספת"
                                    value={item.name}
                                    onChange={(e) => updateDreamItem(item.id, 'name', e.target.value)}
                                    className="flex-[2] p-2 rounded-lg border border-stone-200 text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 outline-none"
                                 />
                                 <div className="relative flex-1">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400 text-xs">₪</span>
                                    <input
                                        type="number"
                                        placeholder="עלות"
                                        value={item.price || ''}
                                        onChange={(e) => updateDreamItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                                        className="w-full p-2 pl-5 rounded-lg border border-stone-200 text-sm font-mono focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 outline-none"
                                    />
                                 </div>
                                 <button 
                                    type="button"
                                    onClick={() => removeDreamItem(item.id)}
                                    className="text-stone-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition"
                                 >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                 </button>
                             </div>
                         ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Footer: Live Quote & Action */}
        <div className="mt-2 bg-stone-900 text-white rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between shadow-lg relative overflow-hidden group gap-4 md:gap-0">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-900 to-stone-900 opacity-50"></div>
            
            {liveQuote && (
                <div className="relative z-10 flex w-full md:w-auto justify-around md:justify-start gap-4 md:gap-6 items-center border-b md:border-b-0 border-stone-700 pb-3 md:pb-0">
                    <div className="text-center md:text-right">
                         <span className="text-[10px] text-stone-400 block uppercase tracking-widest">מחיר למנה</span>
                         <span className="text-lg md:text-xl font-bold text-white">₪{liveQuote.pricePerPerson}</span>
                    </div>
                    <div className="hidden md:block w-px h-8 bg-stone-700"></div>
                    <div className="text-center md:text-right">
                         <span className="text-[10px] text-teal-400 block uppercase tracking-widest">סה"כ (לפני מע"מ)</span>
                         <span className="text-xl md:text-2xl font-black text-teal-400 tracking-tight">₪{liveQuote.totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="hidden md:block w-px h-8 bg-stone-700"></div>
                     <div className="hidden md:block text-center md:text-right">
                         <span className="text-[10px] text-stone-400 block uppercase tracking-widest">כולל מע"מ</span>
                         <span className="text-lg font-bold text-stone-300 tracking-tight">₪{Math.round(liveQuote.totalPrice * 1.18).toLocaleString()}</span>
                    </div>
                </div>
            )}
            
            <div className="relative z-10 flex flex-col md:flex-row gap-3 w-full md:w-auto">
                 <button
                    type="button"
                    onClick={() => onSubmit(formData)}
                    disabled={isLoading}
                    className={`w-full md:w-auto px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2
                        ${isLoading ? 'bg-stone-700 text-stone-400 cursor-wait' : 'bg-teal-600 text-white hover:bg-teal-50'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>הורדת הצעת מחיר</span>
                </button>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full md:w-auto px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2
                        ${isLoading ? 'bg-stone-700 text-stone-400 cursor-wait' : 'bg-white text-stone-900 hover:bg-teal-50'}`}
                >
                    {isLoading ? (
                        <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        מעבד...
                        </>
                    ) : (
                        <>
                        <span>הצגת נתונים</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                        </>
                    )}
                </button>
            </div>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
