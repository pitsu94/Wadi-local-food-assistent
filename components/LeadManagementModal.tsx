
import React, { useState, useMemo, useEffect } from 'react';
import { SavedEvent, LeadTask, LeadActivity, SERVING_STYLES, FOOD_STYLES, DISTANCE_TYPES, SavedFile } from '../types';
import CustomerProposalDoc from './CustomerProposalDoc';
import { calculateQuoteDetails } from '../services/pricingCalculator';

// --- Schedule Meeting Modal ---
export const ScheduleMeetingModal: React.FC<{
    lead: SavedEvent,
    onClose: () => void,
    onSuccess: (lead: SavedEvent) => void
}> = ({ lead, onClose, onSuccess }) => {
    // ... (No changes here)
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState("10:00");
    const [duration, setDuration] = useState(30);

    const handleSchedule = () => {
        // Construct the Google Calendar Link
        const startTime = new Date(`${date}T${time}:00`);
        const endTime = new Date(startTime.getTime() + duration * 60000);

        const formatTime = (d: Date) => d.toISOString().replace(/-|:|\.\d{3}/g, "");
        
        const startStr = formatTime(startTime);
        const endStr = formatTime(endTime);
        
        const title = encodeURIComponent(`שיחת היכרות: ${lead.customerName}`);
        const details = encodeURIComponent(
            `פרטי ליד:\n` +
            `שם: ${lead.customerName}\n` +
            `טלפון: ${lead.phone}\n` +
            `אירוע: ${new Date(lead.eventDate).toLocaleDateString()}\n` +
            `אורחים: ${lead.guests}\n` +
            `סגנון: ${lead.eventType}\n\n` +
            `נוצר ע"י מערכת ואדי`
        );
        const location = encodeURIComponent(lead.location || "");
        
        const businessEmail = "wadi.localfood@gmail.com";
        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}&add=${businessEmail}`;
        
        window.open(url, '_blank');
        
        // Optimistic update
        const newActivity: LeadActivity = {
            id: crypto.randomUUID(),
            type: 'call',
            content: `נפתח יומן לשיבוץ שיחה בתאריך ${startTime.toLocaleDateString()} שעה ${time}`,
            timestamp: new Date().toISOString(),
            author: 'מערכת'
        };
        
        const updatedLead: SavedEvent = {
            ...lead,
            activities: lead.activities ? [newActivity, ...lead.activities] : [newActivity],
            meetingScheduled: startTime.toISOString(), 
        };
        
        onSuccess(updatedLead);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 p-6 relative animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 left-4 text-stone-400 hover:text-stone-600">✕</button>
                
                <h3 className="text-xl font-bold text-teal-800 mb-2">תיאום שיחת היכרות</h3>
                <p className="text-sm text-stone-500 mb-6">בחר מועד לשיחה. המערכת תפתח את היומן שלך ותזמין אוטומטית את <b>wadi.localfood@gmail.com</b>.</p>
                
                <div className="space-y-4">
                    <div className="bg-stone-50 p-3 rounded border border-stone-200 text-sm">
                        <span className="font-bold text-stone-700 block mb-1">פרטי הליד:</span>
                        <div>{lead.customerName} | {lead.phone}</div>
                        <div className="text-xs text-stone-500 mt-1">תאריך אירוע מבוקש: {new Date(lead.eventDate).toLocaleDateString()}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-500 mb-1">תאריך השיחה</label>
                            <input type="date" className="w-full border rounded p-2 text-sm" value={date} onChange={e => setDate(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-500 mb-1">שעה</label>
                            <input type="time" className="w-full border rounded p-2 text-sm" value={time} onChange={e => setTime(e.target.value)} />
                        </div>
                    </div>
                    
                    <div>
                         <label className="block text-xs font-bold text-stone-500 mb-1">משך זמן (דקות)</label>
                         <select className="w-full border rounded p-2 text-sm" value={duration} onChange={e => setDuration(Number(e.target.value))}>
                            <option value={15}>15 דקות</option>
                            <option value={30}>30 דקות</option>
                            <option value={45}>45 דקות</option>
                            <option value={60}>60 דקות</option>
                         </select>
                    </div>

                    <button 
                        onClick={handleSchedule} 
                        className="w-full py-2.5 rounded-lg font-bold text-white shadow-md flex justify-center items-center gap-2 mt-2 bg-blue-600 hover:bg-blue-700"
                    >
                        פתח יומן גוגל ושמור אירוע
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Lead Management Modal ---
export const LeadManagementModal: React.FC<{ 
    lead: SavedEvent, 
    initialTab?: 'intro' | 'docs' | 'tasks' | 'menu',
    onClose: () => void, 
    onUpdate: (l: SavedEvent) => void,
    onSchedule: (l: SavedEvent) => void,
    onWhatsApp: (phone: string, name: string, type?: 'intro' | 'followup') => void,
    onGenerateMenu: (l: SavedEvent) => Promise<void>
}> = ({ lead, initialTab, onClose, onUpdate, onSchedule, onWhatsApp, onGenerateMenu }) => {
    // If initialTab was 'menu', redirect to 'docs'
    const startTab = initialTab === 'menu' ? 'docs' : (initialTab || 'intro');
    const [activeTab, setActiveTab] = useState<'intro' | 'docs' | 'tasks'>(startTab as any);
    const [newTaskText, setNewTaskText] = useState("");
    const [lastCallSummary, setLastCallSummary] = useState(lead.lastCallSummary || "");
    const [isGenerating, setIsGenerating] = useState(false);
    const [showOfficialProposal, setShowOfficialProposal] = useState(false);

    // Editing State for Intro Tab
    const [editLead, setEditLead] = useState<SavedEvent>(lead);
    const [liveQuote, setLiveQuote] = useState<any>(null);
    const [isDirty, setIsDirty] = useState(false);

    // Calculate quote whenever editLead changes
    useEffect(() => {
        const quote = calculateQuoteDetails(editLead);
        setLiveQuote(quote);
    }, [editLead.guests, editLead.eventType, editLead.foodStyle, editLead.distanceType, editLead.kosherType, editLead.eventOrder, editLead.fishLocation]);

    // Handle Field Changes
    const handleEditChange = (field: keyof SavedEvent, value: any) => {
        setIsDirty(true);
        setEditLead(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveChanges = () => {
        if (!liveQuote) return;
        
        const activity: LeadActivity = {
            id: crypto.randomUUID(),
            type: 'system',
            content: 'עודכנו פרטי אירוע ומחיר',
            timestamp: new Date().toISOString(),
            author: 'מערכת'
        };

        const updatedLead: SavedEvent = {
            ...editLead,
            totalPrice: liveQuote.totalPrice,
            auditDetails: liveQuote.auditDetails, // Important: Save the breakdown!
            costBreakdown: liveQuote.breakdown,
            activities: [...(lead.activities || []), activity]
        };

        onUpdate(updatedLead);
        setIsDirty(false);
    };

    // ... (Rest of handlers unchanged) ...
    const handleSaveProposalToFiles = () => {
        const newFile: SavedFile = {
            id: crypto.randomUUID(),
            name: `הצעת מחיר - ${new Date().toLocaleDateString('he-IL')}`,
            type: 'pdf',
            date: new Date().toISOString(),
            isGenerated: true
        };
        const activity: LeadActivity = {
            id: crypto.randomUUID(),
            type: 'system',
            content: 'הצעת מחיר נשמרה בתיק האירוע',
            timestamp: new Date().toISOString(),
            author: 'משתמש'
        };
        const updatedLead: SavedEvent = {
            ...lead,
            savedFiles: [...(lead.savedFiles || []), newFile],
            activities: [...(lead.activities || []), activity]
        };
        onUpdate(updatedLead);
        setShowOfficialProposal(false);
        setActiveTab('docs');
    };

    const addTask = () => {
        if (!newTaskText) return;
        const newTask: LeadTask = { id: crypto.randomUUID(), title: newTaskText, isCompleted: false };
        const updatedTasks = lead.tasks ? [...lead.tasks, newTask] : [newTask];
        onUpdate({ ...lead, tasks: updatedTasks });
        setNewTaskText("");
    };

    const toggleTask = (taskId: string) => {
        const updatedTasks = lead.tasks?.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t);
        onUpdate({ ...lead, tasks: updatedTasks });
    };
    
    const saveCallSummary = () => {
        onUpdate({ ...lead, lastCallSummary: lastCallSummary });
    };

    const toggleSignedStatus = () => {
        const newStatus = !lead.isSigned;
        const activity: LeadActivity = {
            id: crypto.randomUUID(),
            type: 'status_change',
            content: newStatus ? 'סומן כחתום' : 'סומן כלא חתום',
            timestamp: new Date().toISOString(),
            author: 'משתמש'
        };
        onUpdate({ 
            ...lead, 
            isSigned: newStatus,
            activities: [...(lead.activities || []), activity]
        });
    };

    const handlePaymentStatusChange = (newStatus: string) => {
        const activity: LeadActivity = {
            id: crypto.randomUUID(),
            type: 'status_change',
            content: `סטטוס תשלום עודכן ל-${newStatus}`,
            timestamp: new Date().toISOString(),
            author: 'משתמש'
        };
        onUpdate({
            ...lead,
            paymentStatus: newStatus as any,
            activities: [...(lead.activities || []), activity]
        });
    };
    
    // --- Docs & Files Logic ---
    const files = useMemo(() => {
        const list = [];
        if (lead.savedFiles) {
            lead.savedFiles.forEach(f => list.push(f));
        }
        if (lead.proposalLink || lead.menu_draft) {
             const hasManualSave = lead.savedFiles?.some(f => f.isGenerated && f.name.includes('הצעת מחיר'));
             if (!hasManualSave) {
                 list.push({ id: 'auto-1', type: 'pdf', name: 'טיוטת הצעת מחיר (אוטומטי)', date: lead.createdAt, isGenerated: true });
             }
        }
        if (lead.introCall) {
            list.push({ id: 'auto-2', type: 'doc', name: lead.introCall, date: lead.createdAt, isGenerated: false });
        }
        if (lead.menuFile) {
            list.push({ id: 'auto-3', type: 'pdf', name: `תפריט חתום - ${lead.menuFile}`, date: new Date().toISOString(), isGenerated: false });
        }
        return list;
    }, [lead]);

    // ** RENDER OFFICIAL PROPOSAL OVERLAY **
    if (showOfficialProposal) {
        return (
            <CustomerProposalDoc 
                lead={editLead} 
                onClose={() => setShowOfficialProposal(false)} 
                onSaveToCRM={handleSaveProposalToFiles}
            />
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="w-full max-w-2xl bg-white shadow-2xl h-full relative flex flex-col animate-slide-in-right md:rounded-l-2xl overflow-hidden">
                
                {/* Header - Fixed */}
                <div className="p-4 md:p-6 border-b border-stone-200 bg-stone-50 flex justify-between items-start shrink-0">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                             <span className={`px-2 py-0.5 text-[10px] rounded font-bold uppercase tracking-wider bg-teal-600 text-white`}>תיק אירוע</span>
                             <span className={`px-2 py-0.5 text-[10px] rounded font-bold uppercase tracking-wider bg-stone-200 text-stone-600`}>{lead.status}</span>
                             {isDirty && <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 rounded animate-pulse">● יש שינויים לא שמורים</span>}
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-stone-800">{lead.customerName}</h2>
                        <div className="text-xs md:text-sm text-stone-500 mt-1 flex items-center gap-2">
                             <span>{new Date(lead.eventDate).toLocaleDateString('he-IL')}</span>
                             <span>•</span>
                             <span>{lead.guests} אורחים</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {isDirty && (
                             <button 
                                onClick={handleSaveChanges} 
                                className="bg-teal-600 hover:bg-teal-700 text-white p-2 px-4 rounded-lg font-bold shadow-md animate-bounce-in"
                                title="שמור שינויים"
                             >
                                שמור שינויים
                             </button>
                        )}
                         {!lead.meetingScheduled && !isDirty && (
                            <button onClick={() => onSchedule(lead)} className="bg-orange-100 text-orange-600 p-2 rounded-full hover:bg-orange-200" title="תאם שיחה">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </button>
                         )}
                        <button onClick={() => onWhatsApp(lead.phone || '', lead.customerName)} className="bg-emerald-100 text-emerald-600 p-2 rounded-full hover:bg-emerald-200" title="וואטסאפ">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                        </button>
                        <button onClick={onClose} className="text-stone-400 hover:text-stone-600 bg-white p-2 rounded-full shadow-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-stone-200 overflow-x-auto">
                    <button onClick={() => setActiveTab('intro')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap px-4 ${activeTab === 'intro' ? 'border-teal-500 text-teal-700' : 'border-transparent text-stone-500'}`}>דף היכרות</button>
                    <button onClick={() => setActiveTab('docs')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap px-4 ${activeTab === 'docs' ? 'border-teal-500 text-teal-700' : 'border-transparent text-stone-500'}`}>מסמכים</button>
                    <button onClick={() => setActiveTab('tasks')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap px-4 ${activeTab === 'tasks' ? 'border-teal-500 text-teal-700' : 'border-transparent text-stone-500'}`}>משימות</button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-stone-50/30 p-4 md:p-6 pb-20 md:pb-6">
                    
                    {/* TAB 1: Intro Page (דף היכרות) */}
                    {activeTab === 'intro' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* LIVE QUOTE BANNER */}
                            {liveQuote && (
                                <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-xl shadow-md p-4 text-white flex justify-between items-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
                                    <div className="z-10 w-full flex justify-between items-center">
                                        <div className="text-teal-100 text-[10px] font-bold uppercase tracking-wider">
                                            מחיר למנה לפני מע"מ
                                            {lead.isPriceVerified && (
                                                <span className="mr-2 bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[9px] font-black border border-emerald-300">
                                                    הנתונים נבדקו ✓
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-2xl font-black">
                                            ₪{liveQuote.pricePerPerson.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ... Rest of the form remains same ... */}
                            <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                                <div className="bg-stone-50 px-4 py-2 border-b border-stone-100 font-bold text-stone-700 text-xs flex justify-between items-center uppercase tracking-wider">
                                    <span>פרטי האירוע</span>
                                </div>
                                <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-4 text-xs">
                                    {/* (Inputs for date, guests, style, etc. same as before) */}
                                    <div>
                                        <label className="block text-[10px] text-stone-400 mb-1">תאריך האירוע</label>
                                        <input 
                                            type="date"
                                            className="w-full bg-stone-50 border border-stone-200 rounded p-1 font-bold text-stone-800 focus:border-teal-500 outline-none"
                                            value={editLead.eventDate ? new Date(editLead.eventDate).toISOString().split('T')[0] : ''}
                                            onChange={(e) => handleEditChange('eventDate', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-stone-400 mb-1">כמות אורחים</label>
                                        <input 
                                            type="number"
                                            className="w-full bg-stone-50 border border-stone-200 rounded p-1 font-bold text-stone-800 focus:border-teal-500 outline-none"
                                            value={editLead.guests}
                                            onChange={(e) => handleEditChange('guests', parseInt(e.target.value))}
                                        />
                                    </div>
                                    {/* ... Other selects ... */}
                                    <div>
                                        <label className="block text-[10px] text-stone-400 mb-1">סגנון הגשה</label>
                                        <select 
                                            className="w-full bg-stone-50 border border-stone-200 rounded p-1 font-medium text-stone-800 focus:border-teal-500 outline-none"
                                            value={editLead.eventType}
                                            onChange={(e) => handleEditChange('eventType', e.target.value)}
                                        >
                                            {SERVING_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-stone-400 mb-1">סגנון קולינרי</label>
                                        <select 
                                            className="w-full bg-stone-50 border border-stone-200 rounded p-1 font-medium text-stone-800 focus:border-teal-500 outline-none"
                                            value={editLead.foodStyle}
                                            onChange={(e) => handleEditChange('foodStyle', e.target.value)}
                                        >
                                             {FOOD_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    {/* ... rest of inputs ... */}
                                    <div>
                                        <label className="block text-[10px] text-stone-400 mb-1">כשרות</label>
                                        <select 
                                            className="w-full bg-stone-50 border border-stone-200 rounded p-1 font-medium text-stone-800 focus:border-teal-500 outline-none"
                                            value={editLead.kosherType}
                                            onChange={(e) => handleEditChange('kosherType', e.target.value)}
                                        >
                                             <option value="none">ללא תעודה</option>
                                             <option value="certificate">תעודת כשרות</option>
                                             <option value="supervisor">משגיח צמוד</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-stone-400 mb-1">מרחק</label>
                                        <select 
                                            className="w-full bg-stone-50 border border-stone-200 rounded p-1 font-medium text-stone-800 focus:border-teal-500 outline-none"
                                            value={editLead.distanceType}
                                            onChange={(e) => handleEditChange('distanceType', e.target.value)}
                                        >
                                             {DISTANCE_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[10px] text-stone-400 mb-1">מיקום</label>
                                        <input 
                                            type="text"
                                            className="w-full bg-stone-50 border border-stone-200 rounded p-1 font-medium text-stone-800 focus:border-teal-500 outline-none"
                                            value={editLead.location || ''}
                                            onChange={(e) => handleEditChange('location', e.target.value)}
                                            placeholder="מיקום האירוע"
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* ... Customer Details and Notes (unchanged) ... */}
                            <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                                <div className="bg-stone-50 px-4 py-2 border-b border-stone-100 font-bold text-stone-700 text-xs uppercase tracking-wider">פרטי לקוח</div>
                                <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                    {/* Inputs for customer details */}
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-[10px] text-stone-400 mb-1">שם מלא</label>
                                        <input 
                                            className="w-full bg-white border border-stone-200 rounded p-1 font-medium text-stone-800 focus:border-teal-500 outline-none"
                                            value={editLead.customerName}
                                            onChange={(e) => handleEditChange('customerName', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-stone-400 mb-1">טלפון</label>
                                        <input 
                                            className="w-full bg-white border border-stone-200 rounded p-1 font-medium text-stone-800 focus:border-teal-500 outline-none"
                                            value={editLead.phone}
                                            onChange={(e) => handleEditChange('phone', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-stone-400 mb-1">טלפון נוסף</label>
                                        <input 
                                            className="w-full bg-white border border-stone-200 rounded p-1 font-medium text-stone-800 focus:border-teal-500 outline-none"
                                            value={editLead.additionalPhone || ''}
                                            onChange={(e) => handleEditChange('additionalPhone', e.target.value)}
                                            placeholder="טלפון נוסף"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-stone-400 mb-1">אימייל</label>
                                        <input 
                                            className="w-full bg-white border border-stone-200 rounded p-1 font-medium text-stone-800 focus:border-teal-500 outline-none"
                                            value={editLead.email || ''}
                                            onChange={(e) => handleEditChange('email', e.target.value)}
                                        />
                                    </div>
                                     <div>
                                        <label className="block text-[10px] text-stone-400 mb-1">מייל נוסף</label>
                                        <input 
                                            className="w-full bg-white border border-stone-200 rounded p-1 font-medium text-stone-800 focus:border-teal-500 outline-none"
                                            value={editLead.additionalEmail || ''}
                                            onChange={(e) => handleEditChange('additionalEmail', e.target.value)}
                                            placeholder="מייל נוסף"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-stone-400 mb-1">מקור הגעה</label>
                                        <div className="font-medium text-stone-800 pt-1">{editLead.leadSource}</div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Notes Section - Editable */}
                            <div className="bg-amber-50 rounded-xl border border-amber-100 p-4">
                                <label className="block text-[10px] font-bold text-amber-700 mb-2">הערות ודגשים מיוחדים</label>
                                <textarea 
                                    className="w-full bg-white/50 border border-amber-200 rounded p-2 text-xs text-stone-700 outline-none focus:bg-white resize-none"
                                    value={editLead.notes || ''}
                                    onChange={(e) => handleEditChange('notes', e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}

                    {/* TAB 2 & 3 content unchanged in logic, just need to render correctly if selected */}
                    {activeTab === 'docs' && (
                        /* Reuse existing docs content */
                        <div className="space-y-6 animate-fade-in">
                            {/* Proposal Button */}
                            <div className="bg-white p-4 rounded-xl border shadow-sm flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="bg-purple-50 p-2 rounded-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-stone-800 text-sm">הצעת מחיר רשמית</h4>
                                        <p className="text-xs text-stone-500">הצג והדפס את המסמך הרשמי ללקוח</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowOfficialProposal(true)}
                                    className="bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm px-5 py-2.5 rounded-lg font-bold transition shadow-sm"
                                >
                                    הצעת מחיר
                                </button>
                            </div>
                            {/* ... Contract Status, Files, Payment ... */}
                            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-4 relative overflow-hidden">
                                <div className={`absolute top-0 right-0 w-1.5 h-full ${lead.isSigned ? 'bg-emerald-500' : 'bg-stone-300'}`}></div>
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold text-stone-700 flex items-center gap-2 text-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        סטטוס חתימה
                                    </h4>
                                    <button 
                                        onClick={toggleSignedStatus}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-2
                                            ${lead.isSigned 
                                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                                                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
                                    >
                                        {lead.isSigned ? 'הלקוח חתם' : 'ממתין לחתימה'}
                                    </button>
                                </div>
                            </div>
                            
                            {/* Intro Call Summary */}
                            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-4">
                                <h4 className="font-bold text-stone-700 mb-3 flex items-center gap-2 text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                                    סיכום שיחת היכרות
                                </h4>
                                <textarea
                                    className="w-full h-24 p-3 border border-stone-200 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-200 outline-none resize-none bg-stone-50"
                                    placeholder="כתוב כאן את סיכום השיחה הראשונית עם הלקוח..."
                                    value={lastCallSummary}
                                    onChange={(e) => setLastCallSummary(e.target.value)}
                                    onBlur={saveCallSummary}
                                />
                            </div>

                            {/* Files */}
                            <div>
                                <h4 className="font-bold text-stone-400 text-xs uppercase mb-3 flex items-center gap-2">ארכיון קבצים ומסמכים</h4>
                                <div className="grid grid-cols-1 gap-3">
                                    {files.map((file, idx) => (
                                        <div key={idx} className="bg-white p-3 rounded-xl border border-stone-200 flex justify-between items-center shadow-sm group hover:border-blue-300 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${file.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-stone-800 text-sm group-hover:text-blue-700 transition">{file.name}</div>
                                                    <div className="text-xs text-stone-400">
                                                        {new Date(file.date).toLocaleDateString()} • {file.isGenerated ? 'נוצר במערכת' : 'הועלה ידנית'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tasks' && (
                         <div className="space-y-6 animate-fade-in">
                             {/* Tasks Section */}
                             <div>
                                <h4 className="font-bold text-stone-400 text-xs uppercase mb-3">משימות פתוחות</h4>
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <input 
                                            className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:border-teal-500 outline-none"
                                            placeholder="הוסף משימה חדשה..."
                                            value={newTaskText}
                                            onChange={e => setNewTaskText(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && addTask()}
                                        />
                                        <button onClick={addTask} className="bg-teal-600 text-white px-4 rounded-lg font-bold hover:bg-teal-700">+</button>
                                    </div>
                                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                        {lead.tasks?.map(task => (
                                            <div key={task.id} className={`flex items-center gap-3 p-3 rounded-lg border transition group ${task.isCompleted ? 'bg-stone-50 border-stone-100' : 'bg-white border-stone-200 shadow-sm'}`}>
                                                <div 
                                                    onClick={() => toggleTask(task.id)}
                                                    className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition 
                                                        ${task.isCompleted 
                                                            ? 'bg-teal-500 border-teal-500 text-white' 
                                                            : 'border-stone-300 bg-white hover:border-teal-400'}`}
                                                >
                                                    {task.isCompleted && (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className={`flex-1 text-sm font-medium transition select-none cursor-pointer ${task.isCompleted ? 'text-stone-400 line-through' : 'text-stone-800'}`} onClick={() => toggleTask(task.id)}>
                                                    {task.title}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                             </div>
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
};
