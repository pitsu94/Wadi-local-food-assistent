
import React, { useState, useMemo, useEffect } from 'react';
import { SavedEvent, Worker, LeadTask, StaffingDetails, AuditItem } from '../types';
import { calculateQuoteDetails } from '../services/pricingCalculator';
import { LeadManagementModal } from './LeadManagementModal';

interface OperationsTabProps {
  events: SavedEvent[];
  onUpdateEvent: (event: SavedEvent) => void;
}

// Configuration for the 3 distinct responsibility areas - Blue Palette
const TASK_OWNERS = [
    { id: 'noam', name: 'נעם', role: 'מטבח ורכש', color: 'slate', defaultTask: 'הזמנת חומרי גלם' },
    { id: 'shlomit', name: 'שלומית', role: 'לוגיסטיקה', color: 'sky', defaultTask: 'הזמנת ציוד השכרה' },
    { id: 'yael', name: 'יעל', role: 'ניהול וספקים', color: 'indigo', defaultTask: 'פגישת ספקים' }
];

// Common Style for Inputs (Light Theme)
const INPUT_STYLE = "w-full p-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition shadow-sm placeholder-slate-400";

const OperationsTab: React.FC<OperationsTabProps> = ({ events, onUpdateEvent }) => {
  // Only show events that are "Closed" (Signed + Down Payment, or explicitly set to closed status)
  const operationEvents = events.filter(e => e.status === 'סגור' || e.status === 'בוצע').sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

  const [activeModal, setActiveModal] = useState<{ type: 'staff' | 'equipment' | 'menu' | 'manage' | 'wages', eventId: string } | null>(null);
  const [selectedEventForFile, setSelectedEventForFile] = useState<SavedEvent | null>(null);

  // Helper to ensure data structures exist and populate default tasks
  const getEventWithOpsData = (event: SavedEvent): SavedEvent => {
      const updated = { ...event };
      
      // Init Staffing
      if (!updated.staffing) {
          updated.staffing = {
              kitchenWorkers: [],
              floorWorkers: [],
              kitchenManager: 'נעם',
              floorManager: '',
              eventManager: 'יעל'
          };
      }
      
      // Init Operational Status if missing
      if (!updated.operationalStatus) {
        updated.operationalStatus = {
            menuFinalized: false,
            staffArranged: false,
            equipmentOrdered: false,
            vehiclesArranged: false,
            foodOrdered: false
        };
      }
      
      // Init Ops Tasks - Enforce the 3 mandatory tasks if missing
      const currentTasks = updated.opsTasks || [];
      const newTasks = [...currentTasks];
      
      TASK_OWNERS.forEach(owner => {
          // Check if this owner already has their default task
          const hasDefault = currentTasks.some(t => t.assignedTo === owner.name && t.title === owner.defaultTask);
          if (!hasDefault) {
              newTasks.push({
                  id: crypto.randomUUID(),
                  title: owner.defaultTask,
                  assignedTo: owner.name,
                  isCompleted: false,
                  dueDate: '' // Empty initially
              });
          }
      });

      updated.opsTasks = newTasks;

      // Init Management Details
      if (!updated.managementDetails) {
          updated.managementDetails = {
              schedule: '',
              producerName: '',
              producerPhone: '',
              notes: ''
          };
      }

      return updated;
  };

  const handleUpdate = (updatedEvent: SavedEvent) => {
      onUpdateEvent(updatedEvent);
  };

  const closeModal = () => setActiveModal(null);

  const selectedEvent = activeModal ? getEventWithOpsData(operationEvents.find(e => e.id === activeModal.eventId)!) : null;

  // --- Color Logic Helpers ---
  
  // 1. Staff Status (Green if required count met, Orange if missing)
  const getStaffStatusColor = (event: SavedEvent) => {
      const quote = calculateQuoteDetails(event);
      const reqKitchen = quote.auditDetails.find(i => i.name.includes('עובדי מטבח'))?.quantity || 0;
      const reqFloor = quote.auditDetails.find(i => i.name.includes('מלצרים'))?.quantity || 0;
      
      const currentKitchen = event.staffing?.kitchenWorkers.length || 0;
      const currentFloor = event.staffing?.floorWorkers.length || 0;

      const isReady = currentKitchen >= reqKitchen && currentFloor >= reqFloor;
      
      return isReady 
        ? "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200" 
        : "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200 animate-pulse-slow";
  };

  // 2. Equipment Status (Green if ordered, Orange if not)
  const getEquipmentStatusColor = (event: SavedEvent) => {
      const isOrdered = event.operationalStatus?.equipmentOrdered;
      return isOrdered
        ? "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200"
        : "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200";
  };

  // 3. Menu Status (Green if file uploaded, Orange if not)
  const getMenuStatusColor = (event: SavedEvent) => {
      const hasFile = !!event.menuFile;
      return hasFile
        ? "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200"
        : "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200";
  };

  // Shared WhatsApp Handler
  const handleWhatsApp = (phone: string, name: string) => {
      let cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
      if (!cleanPhone.startsWith('972')) cleanPhone = '972' + cleanPhone;
      const text = `היי ${name}, מדברים מוואדי.`;
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden animate-fade-in relative pb-20 md:pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
           <h2 className="text-3xl font-bold text-slate-800">ניהול אירועים</h2>
           <p className="text-slate-500 mt-1 text-sm">שיבוץ צוותים, הזמנות ציוד וניהול שוטף</p>
        </div>
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          {operationEvents.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                  <div className="text-slate-300 text-6xl mb-4">🗓️</div>
                  <h3 className="text-xl font-bold text-slate-600">אין אירועים סגורים כרגע</h3>
                  <p className="text-slate-400 text-sm mt-2">אירועים יופיעו כאן אוטומטית לאחר חתימת חוזה ותשלום מקדמה.</p>
              </div>
          ) : (
              <div className="space-y-8">
                  {operationEvents.map(rawEvent => {
                      const event = getEventWithOpsData(rawEvent); // Ensure defaults for display
                      const daysLeft = Math.ceil((new Date(event.eventDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                      const isUrgent = daysLeft >= 0 && daysLeft <= 7;
                      
                      return (
                          <div key={event.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm transition hover:shadow-md overflow-hidden flex flex-col">
                              {/* Card Header */}
                              <div className="bg-slate-50 p-5 border-b border-slate-200 flex flex-wrap justify-between items-center gap-4">
                                  <div className="flex items-center gap-5">
                                      <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center text-white font-bold shadow-sm shrink-0 ${isUrgent ? 'bg-orange-500' : 'bg-slate-700'}`}>
                                          <span className="text-2xl leading-none">{new Date(event.eventDate).getDate()}</span>
                                          <span className="text-xs uppercase">{new Date(event.eventDate).toLocaleDateString('he-IL', { month: 'short' })}</span>
                                      </div>
                                      <div>
                                          <div className="flex items-center gap-3">
                                              <h3 className="text-xl font-bold text-slate-800">{event.customerName}</h3>
                                              <button 
                                                onClick={() => setSelectedEventForFile(event)}
                                                className="text-xs bg-white border border-slate-300 text-slate-600 px-2 py-1 rounded-md font-bold hover:bg-slate-100 flex items-center gap-1 shadow-sm"
                                                title="פתח תיק אירוע מלא"
                                              >
                                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>
                                                  תיק אירוע מלא
                                              </button>
                                          </div>
                                          <div className="flex flex-wrap gap-2 mt-1">
                                              <span className="bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded text-xs font-medium">{event.guests} אורחים</span>
                                              <span className="bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded text-xs font-medium">{event.location || 'מיקום לא צוין'}</span>
                                              <span className="bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded text-xs font-medium">{event.eventType}</span>
                                          </div>
                                      </div>
                                  </div>
                                  
                                  {/* Action Buttons - Status Colored */}
                                  <div className="flex gap-2 flex-wrap">
                                      <ActionButton 
                                        label="ניהול צוות" 
                                        onClick={() => setActiveModal({ type: 'staff', eventId: event.id })} 
                                        color={getStaffStatusColor(event)}
                                      />
                                      <ActionButton 
                                        label="הזמנת ציוד" 
                                        onClick={() => setActiveModal({ type: 'equipment', eventId: event.id })} 
                                        color={getEquipmentStatusColor(event)}
                                      />
                                      <ActionButton 
                                        label="תפריט לאירוע" 
                                        onClick={() => setActiveModal({ type: 'menu', eventId: event.id })} 
                                        color={getMenuStatusColor(event)}
                                      />
                                      <ActionButton 
                                        label="ניהול אירוע" 
                                        onClick={() => setActiveModal({ type: 'manage', eventId: event.id })} 
                                        color="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
                                      />
                                  </div>
                              </div>

                              {/* Task List Columns */}
                              <div className="p-5 bg-white">
                                  <OpsTaskColumns event={event} onUpdate={handleUpdate} />
                              </div>
                          </div>
                      );
                  })}
              </div>
          )}
      </div>

      {/* --- MODALS --- */}
      
      {activeModal?.type === 'staff' && selectedEvent && (
          <StaffModal 
            event={selectedEvent} 
            onClose={closeModal} 
            onUpdate={handleUpdate} 
            onOpenWages={() => setActiveModal({ type: 'wages', eventId: selectedEvent.id })}
          />
      )}

      {activeModal?.type === 'wages' && selectedEvent && (
          <WagesModal 
            event={selectedEvent} 
            onClose={() => setActiveModal({ type: 'staff', eventId: selectedEvent.id })} // Return to staff
            onUpdate={handleUpdate} 
          />
      )}

      {activeModal?.type === 'equipment' && selectedEvent && (
          <EquipmentModal event={selectedEvent} onClose={closeModal} onUpdate={handleUpdate} />
      )}

      {activeModal?.type === 'menu' && selectedEvent && (
          <MenuModal event={selectedEvent} onClose={closeModal} onUpdate={handleUpdate} />
      )}

      {activeModal?.type === 'manage' && selectedEvent && (
          <ManagementModal event={selectedEvent} onClose={closeModal} onUpdate={handleUpdate} />
      )}

      {/* Full Event File Modal */}
      {selectedEventForFile && (
          <LeadManagementModal 
            lead={selectedEventForFile} 
            onClose={() => setSelectedEventForFile(null)}
            onUpdate={(updated) => {
                handleUpdate(updated);
                setSelectedEventForFile(updated); // Update the modal view as well
            }}
            onSchedule={() => {}} // Not really needed in operations
            onWhatsApp={handleWhatsApp}
            onGenerateMenu={async () => {}} 
          />
      )}

    </div>
  );
};

// --- Sub-Components ---

const ActionButton = ({ label, onClick, color }: { label: string, onClick: () => void, color: string }) => (
    <button 
        onClick={onClick}
        className={`px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm border ${color}`}
    >
        {label}
    </button>
);

const OpsTaskColumns = ({ event, onUpdate }: { event: SavedEvent, onUpdate: (e: SavedEvent) => void }) => {
    // State to track which task is currently expanded to show details/date
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

    const updateTask = (taskId: string, field: keyof LeadTask, value: any) => {
        const updatedTasks = event.opsTasks?.map(t => t.id === taskId ? { ...t, [field]: value } : t);
        onUpdate({ ...event, opsTasks: updatedTasks });
    };
    
    const addTask = (ownerName: string) => {
        const newTask: LeadTask = {
            id: crypto.randomUUID(),
            title: 'משימה חדשה',
            assignedTo: ownerName,
            isCompleted: false
        };
        onUpdate({ ...event, opsTasks: [...(event.opsTasks || []), newTask] });
    };

    const toggleExpand = (taskId: string) => {
        setExpandedTaskId(prev => prev === taskId ? null : taskId);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TASK_OWNERS.map(owner => {
                // Filter tasks for this owner
                const tasks = event.opsTasks?.filter(t => t.assignedTo === owner.name) || [];
                
                // Blue Palette Mapping
                const bgHeader = {
                    slate: 'bg-slate-100 text-slate-800 border-slate-200',
                    sky: 'bg-sky-50 text-sky-900 border-sky-100',
                    indigo: 'bg-indigo-50 text-indigo-900 border-indigo-100'
                }[owner.color] || 'bg-slate-100';

                const bgBody = {
                    slate: 'bg-slate-50/30 border-slate-100',
                    sky: 'bg-sky-50/30 border-sky-100',
                    indigo: 'bg-indigo-50/30 border-indigo-100'
                }[owner.color] || 'bg-white';

                return (
                    <div key={owner.id} className={`rounded-xl border overflow-hidden flex flex-col ${bgBody}`}>
                        {/* Column Header */}
                        <div className={`p-3 border-b flex justify-between items-center ${bgHeader}`}>
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-base">{owner.name}</h4>
                                <button 
                                    onClick={() => addTask(owner.name)}
                                    className="w-5 h-5 flex items-center justify-center bg-white/50 hover:bg-white rounded-full text-stone-600 hover:text-blue-600 transition"
                                    title="הוסף משימה"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                </button>
                            </div>
                            <div className="bg-white px-2 py-0.5 rounded text-xs font-bold shadow-sm border border-black/5">
                                {tasks.filter(t => t.isCompleted).length}/{tasks.length}
                            </div>
                        </div>

                        {/* Task List */}
                        <div className="p-3 space-y-3 flex-1">
                            {tasks.map(task => {
                                const isExpanded = expandedTaskId === task.id;
                                return (
                                <div 
                                    key={task.id} 
                                    onClick={() => toggleExpand(task.id)}
                                    className={`bg-white p-3 rounded-lg shadow-sm border group transition cursor-pointer
                                        ${isExpanded ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-100 hover:border-slate-300'}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <input 
                                            type="checkbox" 
                                            checked={task.isCompleted} 
                                            onClick={(e) => e.stopPropagation()} // Prevent expand on checkbox click
                                            onChange={() => updateTask(task.id, 'isCompleted', !task.isCompleted)}
                                            className="w-5 h-5 rounded cursor-pointer mt-0.5 text-blue-300 focus:ring-blue-200 border-slate-300 bg-white"
                                        />
                                        <div className="flex-1">
                                            {isExpanded ? (
                                                <input 
                                                    value={task.title}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) => updateTask(task.id, 'title', e.target.value)}
                                                    className="text-sm font-medium w-full border-b border-blue-200 outline-none pb-0.5"
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className={`text-sm font-medium transition block ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                                    {task.title}
                                                </span>
                                            )}
                                            
                                            {/* Show Due Date Preview if exists and not expanded */}
                                            {task.dueDate && !isExpanded && (
                                                <span className="text-[10px] text-slate-400 block mt-1">
                                                    עד: {new Date(task.dueDate).toLocaleDateString('he-IL')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Date Input - Only when Expanded */}
                                    {isExpanded && (
                                        <div className="mt-3 pt-2 border-t border-slate-50 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center gap-2">
                                                <label className="text-[10px] font-bold text-slate-400">תאריך יעד:</label>
                                                <input 
                                                    type="date" 
                                                    value={task.dueDate || ''}
                                                    onChange={(e) => updateTask(task.id, 'dueDate', e.target.value)}
                                                    className={`text-xs p-1.5 rounded border border-slate-200 bg-white focus:border-blue-400 outline-none w-full text-slate-700`}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )})}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// --- STAFF MODAL ---
const StaffModal = ({ event, onClose, onUpdate, onOpenWages }: { event: SavedEvent, onClose: () => void, onUpdate: (e: SavedEvent) => void, onOpenWages: () => void }) => {
    // Determine requirements from calculator
    const quote = useMemo(() => calculateQuoteDetails(event), [event]);
    const requiredKitchen = quote.auditDetails.find(i => i.name.includes('עובדי מטבח'))?.quantity || 0;
    const requiredFloor = quote.auditDetails.find(i => i.name.includes('מלצרים'))?.quantity || 0;

    // Add Worker Helper
    const addWorker = (role: 'kitchen' | 'floor', name: string, origin: string, phone: string, hourlyWage: number, startTime?: string) => {
        const worker: Worker = { id: crypto.randomUUID(), name, origin, phone, hourlyWage, isPaid: false, startTime };
        
        const currentStaff = event.staffing || { kitchenWorkers: [], floorWorkers: [], kitchenManager: 'נעם', floorManager: '', eventManager: 'יעל' };
        
        const updatedStaff = { ...currentStaff };
        if (role === 'kitchen') updatedStaff.kitchenWorkers = [...updatedStaff.kitchenWorkers, worker];
        else updatedStaff.floorWorkers = [...updatedStaff.floorWorkers, worker];

        onUpdate({ ...event, staffing: updatedStaff });
    };

    const removeWorker = (role: 'kitchen' | 'floor', id: string) => {
        const currentStaff = event.staffing!;
        const updatedStaff = { ...currentStaff };
        if (role === 'kitchen') updatedStaff.kitchenWorkers = updatedStaff.kitchenWorkers.filter(w => w.id !== id);
        else updatedStaff.floorWorkers = updatedStaff.floorWorkers.filter(w => w.id !== id);
        onUpdate({ ...event, staffing: updatedStaff });
    };

    const updateManager = (role: keyof StaffingDetails, value: string) => {
        const updatedStaff = { ...event.staffing!, [role]: value };
        onUpdate({ ...event, staffing: updatedStaff });
    };

    // Generic worker update for things like startTime
    const updateWorkerField = (role: 'kitchen' | 'floor', id: string, field: keyof Worker, value: any) => {
        const currentStaff = event.staffing!;
        const updatedStaff = { ...currentStaff };
        
        const updateList = (list: Worker[]) => list.map(w => w.id === id ? { ...w, [field]: value } : w);

        if (role === 'kitchen') updatedStaff.kitchenWorkers = updateList(updatedStaff.kitchenWorkers);
        else updatedStaff.floorWorkers = updateList(updatedStaff.floorWorkers);

        onUpdate({ ...event, staffing: updatedStaff });
    };

    // Bulk update for all workers in a category
    const bulkUpdateWorkers = (role: 'kitchen' | 'floor', field: keyof Worker, value: any) => {
        const currentStaff = event.staffing!;
        const updatedStaff = { ...currentStaff };
        
        const updateList = (list: Worker[]) => list.map(w => ({ ...w, [field]: value }));

        if (role === 'kitchen') updatedStaff.kitchenWorkers = updateList(updatedStaff.kitchenWorkers);
        else updatedStaff.floorWorkers = updateList(updatedStaff.floorWorkers);

        onUpdate({ ...event, staffing: updatedStaff });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white w-full h-full md:h-auto md:max-w-6xl md:rounded-2xl shadow-2xl z-10 flex flex-col md:max-h-[90vh] animate-fade-in-up">
                <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50 md:rounded-t-2xl shrink-0">
                    <h3 className="text-xl font-bold text-slate-800">ניהול צוות: {event.customerName}</h3>
                    <div className="flex gap-2">
                        <button 
                            onClick={onOpenWages}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-lg font-bold shadow-sm flex items-center gap-2 text-sm transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            שכר עובדים
                        </button>
                        <button onClick={onClose} className="text-slate-400 hover:text-red-500 font-bold text-2xl px-2">×</button>
                    </div>
                </div>
                
                <div className="p-6 overflow-y-auto bg-slate-50/50 flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Kitchen Staff */}
                        <StaffBox 
                            title="צוות מטבח"
                            role="kitchen"
                            workers={event.staffing?.kitchenWorkers || []}
                            required={requiredKitchen}
                            onAdd={(name, origin, phone, wage, time) => addWorker('kitchen', name, origin, phone, wage, time)}
                            onRemove={(id) => removeWorker('kitchen', id)}
                            onUpdateWorker={(id, field, val) => updateWorkerField('kitchen', id, field, val)}
                            onBulkUpdate={(field, val) => bulkUpdateWorkers('kitchen', field, val)}
                        />

                        {/* Floor Staff */}
                        <StaffBox 
                            title="צוות פלור (מלצרים)"
                            role="floor"
                            workers={event.staffing?.floorWorkers || []}
                            required={requiredFloor}
                            onAdd={(name, origin, phone, wage, time) => addWorker('floor', name, origin, phone, wage, time)}
                            onRemove={(id) => removeWorker('floor', id)}
                            onUpdateWorker={(id, field, val) => updateWorkerField('floor', id, field, val)}
                            onBulkUpdate={(field, val) => bulkUpdateWorkers('floor', field, val)}
                        />

                        {/* Management */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-4 shadow-sm h-full">
                            <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-2">צוות ניהול</h4>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">מנהל/ת מטבח</label>
                                <input 
                                    className={INPUT_STYLE}
                                    value={event.staffing?.kitchenManager}
                                    onChange={(e) => updateManager('kitchenManager', e.target.value)}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">מנהל/ת אירוע</label>
                                <input 
                                    className={INPUT_STYLE}
                                    value={event.staffing?.eventManager}
                                    onChange={(e) => updateManager('eventManager', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">מנהל/ת פלור</label>
                                <input 
                                    className={INPUT_STYLE}
                                    value={event.staffing?.floorManager}
                                    placeholder="שם מנהל/ת פלור"
                                    onChange={(e) => updateManager('floorManager', e.target.value)}
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

// Updated StaffBox to include Wage and Arrival Time
const StaffBox = ({ title, role, workers, required, onAdd, onRemove, onUpdateWorker, onBulkUpdate }: { 
    title: string, 
    role: string,
    workers: Worker[], 
    required: number, 
    onAdd: (n: string, o: string, p: string, w: number, t?: string) => void, 
    onRemove: (id: string) => void,
    onUpdateWorker: (id: string, field: keyof Worker, val: any) => void,
    onBulkUpdate: (field: keyof Worker, val: any) => void
}) => {
    const [name, setName] = useState("");
    const [origin, setOrigin] = useState("");
    const [phone, setPhone] = useState("");
    const [wage, setWage] = useState(60);
    const [groupStartTime, setGroupStartTime] = useState("");

    // Effect to check if all workers have same start time to sync the group input
    useEffect(() => {
        if (workers.length > 0) {
            const firstTime = workers[0].startTime;
            const allSame = workers.every(w => w.startTime === firstTime);
            if (allSame && firstTime) {
                setGroupStartTime(firstTime);
            } else if (workers.length > 0 && !allSame) {
                // If mixed, keep it empty or last valid input
                // Or clear it to indicate mixed state? 
                // Let's keep the last input to allow overwrite
            }
        }
    }, [workers]);

    const handleAdd = () => {
        if (!name) return;
        // Use group start time as default for new worker
        onAdd(name, origin, phone, wage, groupStartTime);
        setName("");
        setOrigin("");
        setPhone("");
        setWage(60);
    };

    const handleGroupTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setGroupStartTime(newVal);
        onBulkUpdate('startTime', newVal);
    };

    const handleWhatsAppGroup = () => {
        if (workers.length === 0) {
            alert("אין עובדים ברשימה");
            return;
        }
        
        // Extract numbers
        const numbers = workers
            .filter(w => w.phone)
            .map(w => w.phone)
            .join(',');

        if (!numbers) {
            alert("לא הוזנו מספרי טלפון לעובדים");
            return;
        }

        // Copy to clipboard
        navigator.clipboard.writeText(numbers).then(() => {
            alert(`המספרים הועתקו ללוח:\n${numbers}\n\nכעת תיפתח אפליקציית וואטסאפ, שם תוכל ליצור קבוצה חדשה ולהדביק את המספרים.`);
            window.open('https://chat.whatsapp.com/', '_blank');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            alert("שגיאה בהעתקת המספרים");
        });
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col h-full shadow-sm">
            <div className="flex justify-between items-center mb-2 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-700">{title}</h4>
                    <button 
                        onClick={handleWhatsAppGroup}
                        title="העתק מספרים ופתח וואטסאפ"
                        className="bg-emerald-50 text-emerald-600 p-1.5 rounded-full hover:bg-emerald-100 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                    </button>
                </div>
                <div className={`text-xs px-2 py-1 rounded font-bold ${workers.length >= required ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {workers.length} / {required}
                </div>
            </div>

            {/* Global Start Time Input */}
            <div className="flex items-center gap-2 mb-3 bg-purple-50 p-2 rounded-lg border border-purple-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <label className="text-xs font-bold text-purple-900 whitespace-nowrap">שעת הגעה לכולם:</label>
                <input 
                    type="time" 
                    className="flex-1 bg-white border border-purple-200 rounded px-2 py-1 text-sm text-purple-900 font-bold focus:outline-none focus:border-purple-500"
                    value={groupStartTime}
                    onChange={handleGroupTimeChange}
                />
            </div>
            
            <div className="flex-1 space-y-2 overflow-y-auto max-h-[300px] mb-4 custom-scrollbar">
                {workers.map((w: Worker) => (
                    <div key={w.id} className="flex justify-between items-start bg-slate-50 p-2.5 rounded border border-slate-100 group">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 text-sm truncate">{w.name}</span>
                                {w.phone && (
                                    <a href={`tel:${w.phone}`} className="text-slate-400 hover:text-blue-600 text-xs">
                                        📞
                                    </a>
                                )}
                            </div>
                            <div className="flex gap-2 text-[10px] text-slate-500">
                                {w.origin && <span>{w.origin}</span>}
                                {w.phone && <span className="font-mono">{w.phone}</span>}
                            </div>
                            {/* Start Time Input in List */}
                            <div className="mt-1 flex items-center gap-1">
                                <label className="text-[10px] text-slate-400">הגעה:</label>
                                <input 
                                    type="time" 
                                    value={w.startTime || ''} 
                                    onChange={(e) => onUpdateWorker(w.id, 'startTime', e.target.value)}
                                    className="text-xs bg-white border border-slate-200 rounded px-1 py-0.5 w-16 outline-none focus:border-blue-400 font-medium text-slate-700"
                                />
                            </div>
                        </div>
                        <button onClick={() => onRemove(w.id)} className="text-slate-300 hover:text-red-500 px-2 font-bold transition">×</button>
                    </div>
                ))}
                {workers.length === 0 && <div className="text-center text-xs text-slate-300 py-8">טרם שובצו עובדים</div>}
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="space-y-2 mb-2">
                    <div className="flex gap-2">
                        <input 
                            placeholder="שם העובד/ת" 
                            className={`${INPUT_STYLE} flex-[2]`}
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                         <input 
                            type="number"
                            placeholder="שכר/שעה" 
                            className={`${INPUT_STYLE} flex-1`}
                            value={wage}
                            onChange={e => setWage(parseFloat(e.target.value))}
                            title="שכר שעתי"
                        />
                    </div>
                    <div className="flex gap-2">
                        <input 
                            placeholder="טלפון" 
                            className={INPUT_STYLE}
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                        />
                        <input 
                            placeholder="מקום" 
                            className={INPUT_STYLE}
                            value={origin}
                            onChange={e => setOrigin(e.target.value)}
                        />
                    </div>
                </div>
                <button 
                    onClick={handleAdd} 
                    className="w-full bg-blue-600 text-white text-xs py-2 rounded-lg font-bold hover:bg-blue-700 shadow-sm transition"
                >
                    + הוסף לרשימה
                </button>
            </div>
        </div>
    );
}

// --- WAGES MODAL (NEW) ---
const WagesModal = ({ event, onClose, onUpdate }: { event: SavedEvent, onClose: () => void, onUpdate: (e: SavedEvent) => void }) => {
    
    // Flatten workers list
    const allWorkers = useMemo(() => [
        ...(event.staffing?.kitchenWorkers || []).map(w => ({ ...w, roleLabel: 'מטבח' })),
        ...(event.staffing?.floorWorkers || []).map(w => ({ ...w, roleLabel: 'פלור' }))
    ], [event.staffing]);

    const updateEventField = (field: keyof StaffingDetails, value: any) => {
         onUpdate({ ...event, staffing: { ...event.staffing!, [field]: value } });
    };

    const updateWorker = (id: string, field: keyof Worker, value: any) => {
        const staff = event.staffing!;
        const updateList = (list: Worker[]) => list.map(w => w.id === id ? { ...w, [field]: value } : w);
        
        onUpdate({ 
            ...event, 
            staffing: { 
                ...staff, 
                kitchenWorkers: updateList(staff.kitchenWorkers),
                floorWorkers: updateList(staff.floorWorkers)
            } 
        });
    };

    // Calculate Hours
    const calculateHours = (start?: string, end?: string) => {
        if (!start || !end) return 0;
        const [h1, m1] = start.split(':').map(Number);
        const [h2, m2] = end.split(':').map(Number);
        
        let diff = (h2 + m2/60) - (h1 + m1/60);
        if (diff < 0) diff += 24; // Crossing midnight
        return parseFloat(diff.toFixed(2));
    };

    const endTime = event.staffing?.eventEndTime || '';

    // Calculate Totals
    const totalWageSum = allWorkers.reduce((acc, w) => {
        const hours = calculateHours(w.startTime, endTime);
        const wage = hours * (w.hourlyWage || 60);
        const travel = (w.travelDistance || 0) * 1; // 1 NIS per km
        return acc + wage + travel;
    }, 0);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-4">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
             <div className="bg-white w-full h-full md:h-auto md:max-w-6xl md:rounded-2xl shadow-2xl z-10 flex flex-col md:max-h-[95vh] animate-fade-in-up">
                
                {/* Header */}
                <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50 md:rounded-t-2xl shrink-0">
                    <div className="flex items-center gap-4">
                         <h3 className="text-xl font-bold text-slate-800">ניהול שכר עובדים</h3>
                         <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
                             סה"כ לתשלום: ₪{Math.round(totalWageSum).toLocaleString()}
                         </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-white border border-slate-200 px-3 py-1 rounded-lg">חזרה לצוות</button>
                </div>

                {/* Global Controls */}
                <div className="p-4 bg-purple-50 border-b border-purple-100 flex gap-4 items-center">
                    <label className="text-sm font-bold text-purple-900">שעת סיום אירוע (גלובלי):</label>
                    <input 
                        type="time" 
                        value={endTime}
                        onChange={(e) => updateEventField('eventEndTime', e.target.value)}
                        className="p-2 border border-purple-200 rounded-lg text-lg font-bold text-purple-900 focus:outline-none focus:border-purple-500 bg-white shadow-sm"
                    />
                    <span className="text-xs text-purple-600 mr-2">* שעת הסיום משמשת לחישוב השעות של כל העובדים</span>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto bg-slate-50/50 p-4">
                     <table className="w-full text-right bg-white rounded-lg shadow-sm border border-slate-200 text-sm overflow-hidden">
                        <thead className="bg-slate-100 text-slate-600 text-xs uppercase font-bold sticky top-0">
                            <tr>
                                <th className="p-3 border-b">שם</th>
                                <th className="p-3 border-b">תפקיד</th>
                                <th className="p-3 border-b">שעת התחלה</th>
                                <th className="p-3 border-b">שעות</th>
                                <th className="p-3 border-b">תעריף שעתי</th>
                                <th className="p-3 border-b w-32">נסיעות (ק"מ)</th>
                                <th className="p-3 border-b text-emerald-700 font-black">סה"כ שכר</th>
                                <th className="p-3 border-b text-center">שולם?</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {allWorkers.map(w => {
                                const hours = calculateHours(w.startTime, endTime);
                                const baseWage = Math.round(hours * (w.hourlyWage || 60));
                                const travelPay = (w.travelDistance || 0) * 1;
                                const total = baseWage + travelPay;

                                return (
                                    <tr key={w.id} className="hover:bg-slate-50 transition">
                                        <td className="p-3 font-bold text-slate-800">{w.name}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] ${w.roleLabel === 'מטבח' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {w.roleLabel}
                                            </span>
                                        </td>
                                        <td className="p-3 font-mono text-slate-600">{w.startTime || '-'}</td>
                                        <td className="p-3 font-bold">{hours > 0 ? hours : '-'}</td>
                                        <td className="p-3 text-slate-500">
                                            <input 
                                                type="number" 
                                                className="w-16 border-b border-dashed bg-transparent text-center focus:border-purple-500 outline-none"
                                                value={w.hourlyWage || 60}
                                                onChange={(e) => updateWorker(w.id, 'hourlyWage', parseFloat(e.target.value))}
                                            /> ₪
                                        </td>
                                        <td className="p-3">
                                             <div className="flex items-center gap-1">
                                                 <input 
                                                    type="number" 
                                                    className="w-16 p-1 border rounded text-center text-sm focus:border-purple-500 outline-none"
                                                    placeholder="ק''מ"
                                                    value={w.travelDistance || ''}
                                                    onChange={(e) => updateWorker(w.id, 'travelDistance', parseFloat(e.target.value))}
                                                 />
                                                 <span className="text-[10px] text-slate-400">₪1/ק"מ</span>
                                             </div>
                                        </td>
                                        <td className="p-3 font-black text-emerald-700 text-lg">
                                            ₪{total.toLocaleString()}
                                        </td>
                                        <td className="p-3 text-center">
                                            <input 
                                                type="checkbox" 
                                                className="w-5 h-5 accent-emerald-500 cursor-pointer"
                                                checked={w.isPaid || false}
                                                onChange={(e) => updateWorker(w.id, 'isPaid', e.target.checked)}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                             {allWorkers.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-slate-400">לא שובצו עובדים לאירוע זה</td>
                                </tr>
                            )}
                        </tbody>
                     </table>
                </div>
             </div>
        </div>
    );
};

// --- EQUIPMENT MODAL ---
const EquipmentModal = ({ event, onClose, onUpdate }: { event: SavedEvent, onClose: () => void, onUpdate?: (e: SavedEvent) => void }) => {
    // Initialize items state for local editing
    const [items, setItems] = useState<AuditItem[]>([]);

    useEffect(() => {
        const quote = calculateQuoteDetails(event);
        // Deep copy rentals to allow editing without affecting the original calculation logic immediately
        const rentals = quote.auditDetails.filter(item => item.category === 'השכרה');
        setItems(rentals);
    }, [event]);

    const handleQuantityChange = (index: number, val: string) => {
        const numVal = parseInt(val) || 0;
        setItems(prev => {
            const updated = [...prev];
            updated[index].quantity = numVal;
            // Update total as well if needed for display, though currently not showing total price in this view
            updated[index].total = numVal * updated[index].unitPrice;
            return updated;
        });
    };

    const handleEmailList = () => {
        const subject = `רשימת ציוד לאירוע: ${event.customerName}`;
        const body = items.map(i => `${i.name}: ${i.quantity}`).join('%0D%0A');
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    };

    const toggleEquipmentOrdered = () => {
        if (onUpdate) {
            const currentStatus = event.operationalStatus?.equipmentOrdered || false;
            onUpdate({
                ...event,
                operationalStatus: {
                    ...event.operationalStatus!,
                    equipmentOrdered: !currentStatus
                }
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white w-full h-full md:h-auto md:max-w-3xl md:rounded-2xl shadow-2xl z-10 flex flex-col md:max-h-[80vh] animate-fade-in-up">
                <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50 md:rounded-t-2xl shrink-0">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        רשימת ציוד להזמנה
                    </h3>
                    <div className="flex items-center gap-4">
                        {/* Order Confirmation Toggle */}
                        <div 
                            onClick={toggleEquipmentOrdered}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition select-none
                                ${event.operationalStatus?.equipmentOrdered 
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                    : 'bg-white border border-slate-300 text-slate-500 hover:bg-slate-50'}`}
                        >
                            <div className={`w-5 h-5 rounded flex items-center justify-center border transition
                                ${event.operationalStatus?.equipmentOrdered ? 'bg-emerald-300 border-emerald-400' : 'bg-white border-slate-300'}`}>
                                {event.operationalStatus?.equipmentOrdered && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <span className="text-xs font-bold hidden sm:inline">ההזמנה יצאה לספק</span>
                            <span className="text-xs font-bold sm:hidden">יצא</span>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-red-500 font-bold text-2xl">×</button>
                    </div>
                </div>
                <div className="p-0 overflow-y-auto flex-1">
                    <table className="w-full text-right text-sm">
                        <thead className="bg-slate-50 text-slate-500 sticky top-0">
                            <tr>
                                <th className="p-4 font-bold border-b border-slate-200 w-2/3">פריט</th>
                                <th className="p-4 font-bold border-b border-slate-200 text-center w-1/3">כמות מומלצת</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50">
                                    <td className="p-4 font-bold text-slate-800">{item.name}</td>
                                    <td className="p-4 text-center">
                                        <input 
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => handleQuantityChange(idx, e.target.value)}
                                            className="w-20 text-center font-mono text-lg font-bold text-slate-700 border-b border-slate-300 focus:border-blue-500 outline-none bg-transparent"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-center gap-4 shrink-0">
                    <button onClick={handleEmailList} className="text-blue-600 font-bold hover:underline text-sm flex items-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        שלח במייל
                    </button>
                    <span className="text-slate-300">|</span>
                    <button onClick={() => window.print()} className="text-blue-600 font-bold hover:underline text-sm flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        הדפס רשימה
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- MENU MODAL ---
const MenuModal = ({ event, onClose, onUpdate }: { event: SavedEvent, onClose: () => void, onUpdate?: (e: SavedEvent) => void }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0 && onUpdate) {
            // Mock Upload
            const fileName = files[0].name;
            onUpdate({ ...event, menuFile: fileName });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white w-full h-full md:h-[80vh] md:max-w-4xl md:rounded-2xl shadow-2xl z-10 flex flex-col animate-fade-in-up">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 md:rounded-t-2xl shrink-0">
                    <h3 className="text-xl font-bold text-slate-800">תפריט לאירוע: {event.customerName}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-red-500 font-bold text-2xl">×</button>
                </div>
                <div className="flex-1 bg-slate-100 p-8 flex flex-col items-center justify-center gap-6 overflow-y-auto">
                    
                    {/* Placeholder for PDF Viewer */}
                    <div className="bg-white w-full max-w-2xl flex-1 shadow-lg border border-slate-200 flex flex-col items-center justify-center text-slate-300 relative overflow-hidden min-h-[300px] rounded-xl">
                        {event.menuFile ? (
                            <div className="text-center animate-fade-in">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-emerald-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="font-bold text-lg text-slate-800">{event.menuFile}</p>
                                <p className="text-sm text-emerald-600 font-bold mt-1">✓ הקובץ הועלה בהצלחה</p>
                            </div>
                        ) : (
                             <div className="text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="font-bold text-lg">אין קובץ תפריט</p>
                            </div>
                        )}
                    </div>

                    {/* Drag and Drop Zone - Small Area */}
                    <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`w-full max-w-md h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition shrink-0
                            ${isDragging 
                                ? 'border-blue-500 bg-blue-50 text-blue-600 scale-105' 
                                : 'border-slate-300 bg-white text-slate-500 hover:border-blue-400 hover:text-blue-500'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm font-bold">גרור קובץ לכאן להעלאה</p>
                        <p className="text-xs opacity-70 mt-1">PDF, DOCX, JPG</p>
                    </div>

                    {event.menuFile && (
                         <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow hover:bg-blue-700 shrink-0">
                            הורד PDF
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- MANAGEMENT MODAL ---
const ManagementModal = ({ event, onClose, onUpdate }: { event: SavedEvent, onClose: () => void, onUpdate: (e: SavedEvent) => void }) => {
    const details = event.managementDetails || { schedule: '', producerName: '', producerPhone: '', notes: '' };

    const handleChange = (field: keyof typeof details, value: string) => {
        onUpdate({
            ...event,
            managementDetails: { ...details, [field]: value }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white w-full h-full md:h-auto md:max-w-2xl md:rounded-2xl shadow-2xl z-10 flex flex-col md:max-h-[90vh] animate-fade-in-up overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
                    <h3 className="text-xl font-bold text-slate-900">ניהול אירוע (מפיק ולו"ז)</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-red-600 font-bold text-2xl">×</button>
                </div>
                
                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    
                    {/* Producer Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">שם המפיק/ה</label>
                            <input 
                                className={INPUT_STYLE}
                                value={details.producerName}
                                onChange={e => handleChange('producerName', e.target.value)}
                                placeholder="למשל: דניאל כהן"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">טלפון מפיק/ה</label>
                            <input 
                                className={INPUT_STYLE}
                                value={details.producerPhone}
                                onChange={e => handleChange('producerPhone', e.target.value)}
                                placeholder="050-..."
                            />
                        </div>
                    </div>

                    {/* Schedule */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">לו"ז אירוע (טקסט חופשי)</label>
                        <textarea 
                            className={`${INPUT_STYLE} h-32 resize-none`}
                            value={details.schedule}
                            onChange={e => handleChange('schedule', e.target.value)}
                            placeholder={`16:00 - הגעת צוות\n18:30 - קבלת פנים\n20:00 - עיקריות...`}
                        />
                    </div>

                    {/* Sketch Placeholder */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">סקיצה של המתחם</label>
                        <div className="w-full h-40 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-slate-50 hover:bg-slate-100 transition cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>לחץ להעלאת תמונה / סקיצה</span>
                        </div>
                    </div>

                    {/* General Notes */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">הערות כלליות לניהול</label>
                        <textarea 
                            className={`${INPUT_STYLE} h-24 resize-none`}
                            value={details.notes}
                            onChange={e => handleChange('notes', e.target.value)}
                            placeholder="דגשים מיוחדים, גישה למקום, נקודות חשמל..."
                        />
                    </div>

                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-200 text-right shrink-0">
                    <button onClick={onClose} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700">שמור וסגור</button>
                </div>
            </div>
        </div>
    );
};

export default OperationsTab;
