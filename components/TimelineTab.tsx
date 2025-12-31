
import React, { useState, useMemo } from 'react';
import { SavedEvent } from '../types';
import { LeadManagementModal } from './LeadManagementModal';

interface TimelineTabProps {
  events: SavedEvent[];
  onUpdateEvent?: (event: SavedEvent) => void;
}

const TimelineTab: React.FC<TimelineTabProps> = ({ events, onUpdateEvent }) => {
  const [selectedEvent, setSelectedEvent] = useState<SavedEvent | null>(null);
  
  // Annual Goal Config
  const ANNUAL_GOAL = 25;
  
  // Calculate Closed Events (Status 'סגור' or 'בוצע' or isClosed flag)
  const closedEventsCount = useMemo(() => {
      return events.filter(e => e.status === 'סגור' || e.status === 'בוצע' || e.isClosed).length;
  }, [events]);

  const progressPercentage = Math.min(100, (closedEventsCount / ANNUAL_GOAL) * 100);

  // --- Date & Season Logic ---

  // Sort events chronologically
  const sortedEvents = useMemo(() => {
      return [...events].sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  }, [events]);
  
  // Define timeframe: Now to +1.5 Years for the timeline
  const startDate = new Date();
  startDate.setDate(1); 
  startDate.setMonth(startDate.getMonth() - 1); // Start 1 month back for context
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 18); // 1.5 Years forward

  const totalDuration = endDate.getTime() - startDate.getTime();

  // Helper: Get Season Key for Grouping
  // Logic: Spring = March(2) to August(7), Autumn = September(8) to February(1)
  const getSeasonInfo = (dateStr: string) => {
      const date = new Date(dateStr);
      const month = date.getMonth(); // 0-11
      const year = date.getFullYear();
      
      // Spring: March (2) -> August (7)
      if (month >= 2 && month <= 7) {
          return {
              key: `spring_${year}`,
              label: `עונת אביב ${year}`,
              type: 'spring',
              sortOrder: year * 10 + 1 // Ensure correct sorting
          };
      } else {
          // Autumn: Sept (8) -> Feb (1 next year)
          // If month is Jan(0) or Feb(1), it belongs to "Autumn of previous year" logically, 
          // or we just call it "Autumn [Year the season started]"
          
          let seasonYear = year;
          if (month <= 1) {
              seasonYear = year - 1; 
          }
          
          return {
              key: `autumn_${seasonYear}`,
              label: `עונת סתיו ${seasonYear}`,
              type: 'autumn',
              sortOrder: seasonYear * 10 + 2
          };
      }
  };

  // Group Events by Season
  const groupedEvents = useMemo(() => {
      const groups: Record<string, { info: any, events: SavedEvent[] }> = {};
      
      sortedEvents.forEach(event => {
          const { key, label, type, sortOrder } = getSeasonInfo(event.eventDate);
          if (!groups[key]) {
              groups[key] = {
                  info: { key, label, type, sortOrder },
                  events: []
              };
          }
          groups[key].events.push(event);
      });

      // Convert to array and sort
      return Object.values(groups).sort((a, b) => a.info.sortOrder - b.info.sortOrder);
  }, [sortedEvents]);

  // Manage Expanded Sections (Default all expanded)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
      const initial: Record<string, boolean> = {};
      groupedEvents.forEach(g => initial[g.info.key] = true);
      return initial;
  });

  const toggleSection = (key: string) => {
      setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // --- Visual Helpers ---

  const getPosition = (dateStr: string) => {
    const date = new Date(dateStr);
    const diff = date.getTime() - startDate.getTime();
    const percent = (diff / totalDuration) * 100;
    return Math.max(0, Math.min(100, percent));
  };

  const getEventStyle = (event: SavedEvent) => {
    if (event.lostReason) {
         return { 
             dot: 'bg-stone-300 border-stone-100', 
             strip: 'bg-stone-300',
         };
    }
    if (event.isClosed || event.status === 'סגור' || event.status === 'בוצע') {
        return { 
            dot: 'bg-emerald-500 border-emerald-100', 
            strip: 'bg-emerald-500',
        };
    }
    return { 
        dot: 'bg-amber-400 border-amber-100', 
        strip: 'bg-amber-400',
    };
  };

  const handleWhatsApp = (phone: string, name: string) => {
      let cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
      if (!cleanPhone.startsWith('972')) cleanPhone = '972' + cleanPhone;
      const text = `היי ${name}, מדברים מוואדי.`;
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="animate-fade-in space-y-4 h-full flex flex-col pb-20 md:pb-6">
      
      {/* 1. Header & KPI */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-stone-200 pb-4 shrink-0 gap-4">
          <div>
            <h2 className="text-xl font-bold text-teal-900">לוח אירועים עונתי</h2>
            <p className="text-xs text-stone-500">תכנון שנתי בחלוקה לעונות פעילות</p>
          </div>
          
          {/* Annual Goal Widget */}
          <div className="bg-white border border-stone-200 rounded-xl px-4 py-2 shadow-sm w-full md:w-64">
              <div className="flex justify-between items-end mb-1">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">יעד שנתי</span>
                  <div className="text-right">
                      <span className="text-lg font-black text-teal-700">{closedEventsCount}</span>
                      <span className="text-xs text-stone-400 font-medium"> / {ANNUAL_GOAL}</span>
                  </div>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-1000 ease-out rounded-full" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
              </div>
              <div className="mt-1 text-[10px] text-stone-400 text-left">
                  {progressPercentage >= 100 ? '🎉 היעד הושג!' : `עוד ${ANNUAL_GOAL - closedEventsCount} אירועים ליעד`}
              </div>
          </div>
      </div>

      {/* 2. Horizontal Timeline Container (Original Style) */}
      <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-stone-200 w-full shrink-0 overflow-hidden">
        <div className="w-full relative h-16">
          
          {/* Main Axis Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-stone-200 rounded-full transform -translate-y-1/2 z-10"></div>

          {/* Events Markers */}
          {sortedEvents.map((event) => {
            const percent = getPosition(event.eventDate);
            if (new Date(event.eventDate) > endDate || new Date(event.eventDate) < startDate) return null;
            const styles = getEventStyle(event);

            return (
              <div 
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
                style={{ left: `${percent}%` }}
              >
                {/* Connector Line */}
                <div className={`absolute bottom-1/2 left-1/2 w-px h-0 bg-stone-300 -translate-x-1/2 group-hover:h-4 transition-all duration-300`}></div>
                
                {/* The Dot */}
                <div className={`w-2.5 h-2.5 rounded-full border border-white shadow-sm transition-all duration-300 ring-2 ring-transparent ${styles.dot} group-hover:ring-stone-200 group-hover:scale-125`}></div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 bg-stone-800 text-white text-[10px] py-1 px-2 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-30">
                  <span className="font-bold text-teal-300">{new Date(event.eventDate).getDate()}/{new Date(event.eventDate).getMonth()+1}</span> {event.customerName}
                </div>
              </div>
            );
          })}
          
          {/* Labels on Timeline */}
          <div className="absolute bottom-0 w-full flex text-[9px] font-bold text-stone-400 z-10 pointer-events-none uppercase tracking-widest opacity-60">
                <span className="absolute left-[5%]">עכשיו</span>
                <span className="absolute left-[50%] transform -translate-x-1/2">ציר זמן (שנה וחצי)</span>
                <span className="absolute right-[2%]">עתיד</span>
          </div>
        </div>
      </div>

      {/* 3. Grouped Event Lists (Spring / Autumn Boxes) */}
      <div className="flex-1 overflow-y-auto px-1 scrollbar-thin space-y-6 pb-6">
        
        {groupedEvents.map((group) => {
            const isExpanded = expandedSections[group.info.key];
            const isSpring = group.info.type === 'spring';
            
            return (
                <div key={group.info.key} className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden transition-all">
                    {/* Collapsible Header */}
                    <div 
                        onClick={() => toggleSection(group.info.key)}
                        className={`p-3 flex justify-between items-center cursor-pointer transition select-none
                            ${isSpring ? 'bg-lime-50/30 hover:bg-lime-100/50' : 'bg-orange-50/30 hover:bg-orange-100/50'}`}
                    >
                        <div className="flex items-center gap-3">
                            <h3 className={`font-bold text-base px-2 ${isSpring ? 'text-lime-900' : 'text-orange-900'}`}>
                                {group.info.label}
                            </h3>
                            <span className="bg-white/60 px-2 py-0.5 rounded text-xs font-medium text-stone-500">
                                {group.events.length} אירועים
                            </span>
                        </div>
                        
                        <div className="text-stone-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* Content Grid */}
                    {isExpanded && (
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-white animate-fade-in">
                            {group.events.map((event) => {
                                const date = new Date(event.eventDate);
                                const isPast = date < new Date();
                                const styles = getEventStyle(event);

                                return (
                                    <div 
                                        key={event.id} 
                                        onClick={() => setSelectedEvent(event)}
                                        className={`rounded-lg p-3 border transition-all hover:shadow-md flex items-center gap-3 relative overflow-hidden cursor-pointer h-20
                                        ${isPast ? 'border-stone-100 bg-stone-50/50 opacity-80 grayscale-[0.3]' : 'border-stone-200 bg-white shadow-sm'}`}
                                    >
                                        {/* Status Strip */}
                                        <div className={`absolute top-0 right-0 bottom-0 w-1 ${styles.strip}`}></div>

                                        {/* Date Box */}
                                        <div className="flex-shrink-0 w-12 text-center pl-2 border-l border-stone-100">
                                            <span className="block text-xl font-bold text-stone-800 leading-none">{date.getDate()}</span>
                                            <span className="block text-[10px] font-medium text-stone-500 uppercase">{date.toLocaleDateString('he-IL', { month: 'short' })}</span>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <h4 className="text-sm font-bold text-stone-900 truncate">{event.customerName}</h4>
                                            <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-500">
                                                <span className="truncate max-w-[100px]">{event.location || 'מיקום לא צוין'}</span>
                                                <span className="text-stone-300">|</span>
                                                <span className="text-teal-600 font-medium truncate">{event.eventType}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Status Badge (Mini) */}
                                        {event.isClosed && (
                                            <div className="absolute top-2 left-2 text-emerald-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        })}
        
        {groupedEvents.length === 0 && (
            <div className="text-center py-10 text-stone-400">
                לא נמצאו אירועים להצגה בטווח הזמן הזה.
            </div>
        )}
      </div>

      {/* LEAD MANAGEMENT MODAL */}
      {selectedEvent && (
          <LeadManagementModal 
            lead={selectedEvent} 
            onClose={() => setSelectedEvent(null)}
            onUpdate={(updated) => {
                if (onUpdateEvent) onUpdateEvent(updated);
            }}
            onSchedule={(l) => console.log('Schedule clicked', l)} // Placeholder
            onWhatsApp={handleWhatsApp}
            onGenerateMenu={async () => {}} // Placeholder or re-implement
          />
      )}
    </div>
  );
};

export default TimelineTab;
