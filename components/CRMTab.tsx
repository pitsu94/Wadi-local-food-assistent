
import React, { useState, useEffect, useMemo } from 'react';
import { SavedEvent, LeadActivity, LeadTask } from '../types';
import { LeadManagementModal, ScheduleMeetingModal } from './LeadManagementModal';
import { generateProposal } from '../services/geminiService';

interface CRMTabProps {
  events: SavedEvent[];
  onAddEvent: (event: SavedEvent) => void;
  onUpdateEvent: (event: SavedEvent) => void;
}

const STAGES = [
    { id: 'פנייה ראשונית', label: 'פנייה ראשונית', color: 'border-t-4 border-blue-400', bg: 'bg-blue-50/50' },
    { id: 'אחרי שיחת היכרות', label: 'אחרי שיחת היכרות', color: 'border-t-4 border-indigo-400', bg: 'bg-indigo-50/50' },
    { id: 'קיבלו הצעת מחיר', label: 'נשלחה הצעה', color: 'border-t-4 border-purple-400', bg: 'bg-purple-50/50' },
    { id: 'ממתין להעברת מקדמה', label: 'ממתין להעברת מקדמה', color: 'border-t-4 border-amber-400', bg: 'bg-amber-50/50' }
];

const LOST_REASONS = [
    "מחיר",
    "תאריך לא פנוי",
    "האירוע בוטל",
    "כוח עליון",
    "אחר"
];

// --- Sub-Components ---

// 1. LeadCard
const LeadCard: React.FC<{ 
    lead: SavedEvent, 
    stageId: string, 
    activeFollowUpMenu?: boolean,
    isGenerating?: boolean,
    onClick: () => void, 
    onDragStart: (e: React.DragEvent, id: string) => void,
    onSchedule: () => void,
    onWhatsApp: (phone: string, name: string) => void,
    onGenerateMenu: () => void,
    onViewMenu: () => void,
    onToggleTask: (taskId: string) => void,
    onToggleFollowUpMenu: () => void,
    onFollowUpAction: (action: 'done' | 'update', date?: string) => void,
    onArchive: () => void // New prop
}> = ({ lead, stageId, activeFollowUpMenu, isGenerating, onClick, onDragStart, onSchedule, onWhatsApp, onGenerateMenu, onViewMenu, onToggleTask, onToggleFollowUpMenu, onFollowUpAction, onArchive }) => {
    
    const nextTask = lead.tasks?.find(t => !t.isCompleted);
    const isScheduled = !!lead.meetingScheduled;
    const scheduledDate = lead.meetingScheduled ? new Date(lead.meetingScheduled) : null;
    const hasMenuDraft = !!lead.menu_draft;
    
    // Check if follow up exists and is relevant (future or today)
    const hasFollowUp = lead.followUpDate;
    const followUpDateObj = hasFollowUp ? new Date(lead.followUpDate) : null;
    const isFollowUpToday = followUpDateObj && new Date().toDateString() === followUpDateObj.toDateString();
    
    // For Reschedule Logic
    const [rescheduleDate, setRescheduleDate] = useState(lead.followUpDate ? lead.followUpDate.split('T')[0] : new Date().toISOString().split('T')[0]);
    const [showDateInput, setShowDateInput] = useState(false);

    // Reset local state when menu closes
    useEffect(() => {
        if (!activeFollowUpMenu) setShowDateInput(false);
    }, [activeFollowUpMenu]);

    return (
        <div 
            draggable 
            onDragStart={(e) => onDragStart(e, lead.id)}
            onClick={onClick}
            className="bg-white p-3 rounded-lg shadow-sm border border-stone-100 cursor-pointer hover:shadow-md hover:border-teal-200 transition group relative flex flex-col gap-2 z-0 hover:z-10"
        >
            <div className="flex justify-between items-start">
                 <div className="flex-1 text-center pr-6 pl-6"> {/* Added padding to offset absolute icons */}
                    <span className="font-bold text-stone-800 text-base sm:text-lg group-hover:text-teal-700 block truncate">{lead.customerName || 'לקוח ללא שם'}</span>
                    <span className="text-[10px] text-stone-400 block -mt-0.5 font-medium">
                        התקבל: {new Date(lead.createdAt).toLocaleDateString('he-IL')}
                    </span>
                 </div>
                 
                 {/* WhatsApp Quick Action (Left) */}
                 <button 
                    onClick={(e) => { e.stopPropagation(); onWhatsApp(lead.phone || '', lead.customerName); }}
                    className="absolute left-2 top-2 text-emerald-500 hover:text-emerald-600 bg-emerald-50 p-1.5 rounded-full hover:bg-emerald-100 transition"
                    title="שלח וואטסאפ"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                 </button>

                 {/* Archive/Cancel Action (Right) */}
                 <button 
                    onClick={(e) => { e.stopPropagation(); onArchive(); }}
                    className="absolute right-2 top-2 text-stone-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition opacity-0 group-hover:opacity-100"
                    title="העבר לארכיון / בטל"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                 </button>
            </div>
            
            <div className="flex justify-between items-center text-[10px] sm:text-xs text-stone-500 border-t border-stone-50 pt-2 px-1">
                <div className="flex flex-col items-center">
                     <span className="font-bold">{lead.guests > 0 ? lead.guests : '-'}</span>
                     <span className="text-[9px]">אורחים</span>
                </div>
                <div className="w-px h-6 bg-stone-100"></div>
                <div className="flex flex-col items-center">
                     <span className="font-bold">{lead.eventDate ? new Date(lead.eventDate).toLocaleDateString('he-IL', {day: 'numeric', month: 'numeric'}) : '-'}</span>
                     <span className="text-[9px]">תאריך</span>
                </div>
                {lead.location && (
                    <>
                    <div className="w-px h-6 bg-stone-100"></div>
                    <div className="flex flex-col items-center max-w-[50px] sm:max-w-[60px]">
                         <span className="font-bold truncate w-full text-center" title={lead.location}>{lead.location}</span>
                         <span className="text-[9px]">מיקום</span>
                    </div>
                    </>
                )}
            </div>
            
            {/* Follow Up Indicator with Interactive Popover */}
            {hasFollowUp && (
                <div className="relative mt-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onToggleFollowUpMenu(); }}
                        className={`w-full flex items-center justify-center gap-1 text-[10px] font-bold py-1 px-2 rounded-full border transition hover:shadow-sm
                            ${isFollowUpToday 
                                ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' 
                                : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>פולו-אפ: {followUpDateObj?.toLocaleDateString('he-IL', {day:'numeric', month:'numeric'})}</span>
                        {/* Tiny chevron to indicate interaction */}
                        <svg className="w-2 h-2 ml-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                    </button>

                    {/* Quick Action Popover */}
                    {activeFollowUpMenu && (
                        <div 
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-white rounded-xl shadow-xl border border-stone-200 z-50 overflow-hidden animate-fade-in-up"
                            onClick={(e) => e.stopPropagation()} // Prevent closing on click inside
                        >
                            {!showDateInput ? (
                                <div className="flex flex-col">
                                    <button 
                                        onClick={() => onFollowUpAction('done')}
                                        className="text-right px-4 py-3 text-xs font-bold text-emerald-700 hover:bg-emerald-50 border-b border-stone-100 flex items-center gap-2"
                                    >
                                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                                            <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        בוצע (נקה תאריך)
                                    </button>
                                    <button 
                                        onClick={() => setShowDateInput(true)}
                                        className="text-right px-4 py-3 text-xs font-bold text-indigo-700 hover:bg-indigo-50 flex items-center gap-2"
                                    >
                                        <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                                            <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                        דחה/עדכן מועד
                                    </button>
                                </div>
                            ) : (
                                <div className="p-3 bg-indigo-50">
                                    <label className="block text-[10px] font-bold text-indigo-700 mb-1">בחר תאריך חדש</label>
                                    <input 
                                        type="date" 
                                        className="w-full text-xs p-1.5 rounded border border-indigo-200 mb-2 focus:outline-none focus:border-indigo-400"
                                        value={rescheduleDate}
                                        onChange={(e) => setRescheduleDate(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => onFollowUpAction('update', rescheduleDate)}
                                            className="flex-1 bg-indigo-600 text-white text-xs py-1.5 rounded font-bold hover:bg-indigo-700"
                                        >
                                            שמור
                                        </button>
                                        <button 
                                            onClick={() => setShowDateInput(false)}
                                            className="px-2 py-1.5 text-xs text-stone-500 hover:text-stone-700"
                                        >
                                            ביטול
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
            
            {stageId === 'פנייה ראשונית' && (
                <div className="mt-1 space-y-2">
                    <div className="flex justify-center">
                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold text-[9px]">{lead.leadSource || 'מקור לא ידוע'}</span>
                    </div>
                    {/* Scheduling Status Logic */}
                    {!isScheduled ? (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onSchedule(); }}
                            className="w-full bg-orange-50 text-orange-700 border border-orange-100 text-[10px] py-1.5 rounded font-bold hover:bg-orange-100 flex items-center justify-center gap-1 transition animate-pulse"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            תיאום שיחת היכרות
                        </button>
                    ) : (
                         <div className="w-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] py-1.5 rounded font-bold flex items-center justify-center gap-1">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                             </svg>
                             נקבעה שיחה ל-{scheduledDate?.toLocaleDateString('he-IL', {day: 'numeric', month: 'numeric'})}
                         </div>
                    )}
                </div>
            )}
            
            {/* View Menu Button - Only if menu exists */}
            {stageId === 'אחרי שיחת היכרות' && hasMenuDraft && (
                <div className="mt-1">
                     <button 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            onViewMenu();
                        }}
                        className={`w-full text-[10px] py-1.5 rounded font-bold flex items-center justify-center gap-1 transition shadow-sm border 
                            ${lead.proposalStatus === 'draft' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                              lead.proposalStatus === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-purple-50 text-purple-700 border-purple-100'}`}
                    >
                        {lead.proposalStatus === 'draft' ? '⏳ ממתין לאישור הצעה' : (lead.proposalStatus === 'approved' ? '✅ הצעה מאושרת' : '📋 צפה בתפריט')}
                    </button>
                </div>
            )}
            
             {(stageId === 'אחרי שיחת היכרות' || stageId === 'קיבלו הצעת מחיר') && nextTask && (
                <div 
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleTask(nextTask.id);
                    }}
                    className="bg-amber-50 text-amber-700 px-2 py-1 rounded text-[10px] border border-amber-100 mt-1 truncate cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-100 transition group flex items-center gap-2 justify-center"
                    title="לחץ לסימון כהושלם"
                >
                    <div className="w-2.5 h-2.5 rounded-sm border border-amber-400 bg-white group-hover:border-emerald-400 group-hover:bg-emerald-400 transition"></div>
                    <span>משימה: {nextTask.title}</span>
                </div>
            )}
        </div>
    );
};

// --- Main CRM Tab Component ---

const CRMTab: React.FC<CRMTabProps> = ({ events, onAddEvent, onUpdateEvent }) => {
    
    // State
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLead, setSelectedLead] = useState<SavedEvent | null>(null);
    const [scheduleLead, setScheduleLead] = useState<SavedEvent | null>(null);
    const [leadToArchive, setLeadToArchive] = useState<SavedEvent | null>(null); // New state for archiving
    const [isGeneratingMenu, setIsGeneratingMenu] = useState<string | null>(null);
    const [activeFollowUpMenuId, setActiveFollowUpMenuId] = useState<string | null>(null);
    const [modalInitialTab, setModalInitialTab] = useState<'intro' | 'docs' | 'tasks' | 'menu'>('intro');

    // Drag and Drop state
    const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

    // Filter Logic
    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            const matchesSearch = event.customerName.includes(searchTerm) || (event.phone?.includes(searchTerm));
            const isRelevant = event.status !== 'לא רלוונטי' && event.status !== 'בוצע';
            return matchesSearch && isRelevant;
        });
    }, [events, searchTerm]);

    // Grouping
    const columns = useMemo(() => {
        const cols: Record<string, SavedEvent[]> = {};
        STAGES.forEach(s => cols[s.id] = []);
        filteredEvents.forEach(event => {
            if (cols[event.status]) {
                cols[event.status].push(event);
            }
        });
        return cols;
    }, [filteredEvents]);

    // Handlers
    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedLeadId(id);
        e.dataTransfer.setData('leadId', id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetStage: string) => {
        e.preventDefault();
        const leadId = e.dataTransfer.getData('leadId');
        if (!leadId) return;
        
        const lead = events.find(l => l.id === leadId);
        if (lead && lead.status !== targetStage) {
            // Update Status
            const activity: LeadActivity = {
                id: crypto.randomUUID(),
                type: 'status_change',
                content: `סטטוס שונה מ"${lead.status}" ל"${targetStage}"`,
                timestamp: new Date().toISOString(),
                author: 'משתמש'
            };
            
            onUpdateEvent({ 
                ...lead, 
                status: targetStage as any,
                activities: lead.activities ? [...lead.activities, activity] : [activity]
            });
        }
        setDraggedLeadId(null);
    };

    const handleWhatsApp = (phone: string, name: string) => {
        let cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
        if (!cleanPhone.startsWith('972')) cleanPhone = '972' + cleanPhone;
        const text = `היי ${name}, מדברים מוואדי.`;
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleToggleTask = (lead: SavedEvent, taskId: string) => {
        const updatedTasks = lead.tasks?.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t);
        onUpdateEvent({ ...lead, tasks: updatedTasks });
    };

    const handleFollowUpAction = (lead: SavedEvent, action: 'done' | 'update', date?: string) => {
        let updatedLead = { ...lead };
        let content = '';

        if (action === 'done') {
            updatedLead.followUpDate = '';
            content = 'בוצע פולו-אפ (תאריך נוקה)';
        } else if (action === 'update' && date) {
            updatedLead.followUpDate = new Date(date).toISOString();
            content = `נקבע פולו-אפ חדש ל-${new Date(date).toLocaleDateString()}`;
        }

        const activity: LeadActivity = {
            id: crypto.randomUUID(),
            type: 'system',
            content,
            timestamp: new Date().toISOString(),
            author: 'משתמש'
        };
        
        updatedLead.activities = [...(lead.activities || []), activity];
        onUpdateEvent(updatedLead);
        setActiveFollowUpMenuId(null);
    };

    const handleArchiveEvent = (reason: string) => {
        if (!leadToArchive) return;

        const activity: LeadActivity = {
            id: crypto.randomUUID(),
            type: 'status_change',
            content: `אירוע בוטל/הועבר לארכיון. סיבה: ${reason}`,
            timestamp: new Date().toISOString(),
            author: 'משתמש'
        };

        const updatedLead: SavedEvent = {
            ...leadToArchive,
            status: 'לא רלוונטי',
            lostReason: reason,
            activities: [...(leadToArchive.activities || []), activity]
        };

        onUpdateEvent(updatedLead);
        setLeadToArchive(null);
    };

    // --- Render ---
    return (
        <div className="h-full flex flex-col pb-20 md:pb-0" onClick={() => setActiveFollowUpMenuId(null)}>
            
            {/* Header / Search */}
            <div className="flex justify-between items-center mb-6 shrink-0">
                <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-bold text-stone-800">לוח בקרה</h2>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="חיפוש ליד..." 
                            className="pl-10 pr-4 py-2 rounded-full bg-white border border-stone-200 focus:ring-2 focus:ring-teal-100 outline-none text-sm w-64 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <svg className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>
                
                {/* Stats / Actions could go here */}
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                <div className="flex gap-4 h-full min-w-[1000px]">
                    {STAGES.map(stage => (
                        <div 
                            key={stage.id} 
                            className={`flex-1 min-w-[280px] max-w-[320px] flex flex-col rounded-xl bg-stone-50 border border-stone-200 h-full ${stage.color}`}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDrop(e, stage.id)}
                        >
                            {/* Column Header */}
                            <div className={`p-3 font-bold text-stone-700 flex justify-between items-center border-b border-stone-100 ${stage.bg}`}>
                                <span>{stage.label}</span>
                                <span className="bg-white px-2 py-0.5 rounded-full text-xs shadow-sm text-stone-500">
                                    {columns[stage.id]?.length || 0}
                                </span>
                            </div>

                            {/* Cards Container */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                                {columns[stage.id]?.map(lead => (
                                    <LeadCard 
                                        key={lead.id}
                                        lead={lead}
                                        stageId={stage.id}
                                        activeFollowUpMenu={activeFollowUpMenuId === lead.id}
                                        isGenerating={isGeneratingMenu === lead.id}
                                        onClick={() => { setSelectedLead(lead); setModalInitialTab('intro'); }}
                                        onDragStart={handleDragStart}
                                        onSchedule={() => setScheduleLead(lead)}
                                        onWhatsApp={handleWhatsApp}
                                        onGenerateMenu={async () => {
                                            // Trigger generation logic here if needed or pass to modal
                                        }}
                                        onViewMenu={() => { setSelectedLead(lead); setModalInitialTab('menu'); }}
                                        onToggleTask={(tid) => handleToggleTask(lead, tid)}
                                        onToggleFollowUpMenu={() => setActiveFollowUpMenuId(prev => prev === lead.id ? null : lead.id)}
                                        onFollowUpAction={(a, d) => handleFollowUpAction(lead, a, d)}
                                        onArchive={() => setLeadToArchive(lead)}
                                    />
                                ))}
                                {columns[stage.id]?.length === 0 && (
                                    <div className="text-center text-stone-300 py-10 text-sm italic">
                                        אין לידים בשלב זה
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Archive Confirmation Modal */}
            {leadToArchive && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={() => setLeadToArchive(null)}></div>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm z-10 p-6 animate-fade-in-up">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-stone-800">ביטול והעברה לארכיון</h3>
                            <button onClick={() => setLeadToArchive(null)} className="text-stone-400 hover:text-stone-600">✕</button>
                        </div>
                        <p className="text-sm text-stone-600 mb-4">
                            אנא בחר את סיבת הביטול עבור <strong>{leadToArchive.customerName}</strong>. 
                            האירוע יוסר מהלוח ויועבר לסטטוס "לא רלוונטי".
                        </p>
                        <div className="space-y-2">
                            {LOST_REASONS.map(reason => (
                                <button
                                    key={reason}
                                    onClick={() => handleArchiveEvent(reason)}
                                    className="w-full text-right px-4 py-2 rounded-lg border border-stone-200 hover:border-red-300 hover:bg-red-50 text-stone-700 hover:text-red-700 transition text-sm font-medium"
                                >
                                    {reason}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            {selectedLead && (
                <LeadManagementModal 
                    lead={selectedLead}
                    initialTab={modalInitialTab}
                    onClose={() => setSelectedLead(null)}
                    onUpdate={(updated) => {
                        onUpdateEvent(updated);
                        // Update local selected lead to reflect changes immediately in modal
                        setSelectedLead(updated);
                    }}
                    onSchedule={(l) => { setSelectedLead(null); setScheduleLead(l); }}
                    onWhatsApp={handleWhatsApp}
                    onGenerateMenu={async (l) => {
                       // Logic handled inside modal usually or external service
                    }}
                />
            )}

            {scheduleLead && (
                <ScheduleMeetingModal 
                    lead={scheduleLead}
                    onClose={() => setScheduleLead(null)}
                    onSuccess={(updated) => {
                        onUpdateEvent(updated);
                        setScheduleLead(null);
                    }}
                />
            )}
        </div>
    );
};

export default CRMTab;
