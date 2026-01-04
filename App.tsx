
import React, { useState, useEffect, useCallback } from 'react';
import ProposalTab from './components/ProposalTab';
import CRMTab from './components/CRMTab';
import OperationsTab from './components/OperationsTab';
import TimelineTab from './components/TimelineTab';
import FinanceTab from './components/FinanceTab';
import LoginPage from './components/LoginPage';
import { SavedEvent, Tab, User } from './types';
import { checkSupabaseConnection, fetchEvents, createEvent, updateEvent } from './services/supabaseClient';

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Tabs logic dependent on Auth
  const [activeTab, setActiveTab] = useState<Tab>('proposal');
  
  // Events State
  const [events, setEvents] = useState<SavedEvent[]>([]);
  const [history, setHistory] = useState<SavedEvent[][]>([]); // Keeping history for session undo
  const [isSaving, setIsSaving] = useState(false);

  // Initial Data Load from Supabase
  useEffect(() => {
    const loadData = async () => {
        const connected = await checkSupabaseConnection();
        if (connected) {
            const data = await fetchEvents();
            setEvents(data);
        }
    };
    loadData();
  }, []);

  // Determine Default Tab on Login
  useEffect(() => {
      if (currentUser) {
          if (currentUser.role === 'operations') setActiveTab('operations');
          else if (currentUser.role === 'sales') setActiveTab('crm');
          else setActiveTab('proposal');
      }
  }, [currentUser]);

  // UI Helper for "Saved" indicator
  const triggerSaveIndicator = () => {
      setIsSaving(true);
      setTimeout(() => setIsSaving(false), 2000);
  };

  // Add Event (Persist to DB)
  const handleAddEvent = async (newEvent: SavedEvent) => {
    // 1. Optimistic Update
    const prevEvents = [...events];
    setEvents([newEvent, ...prevEvents]);
    setHistory(prev => [[...prevEvents], ...prev].slice(0, 10)); // Save history

    // 2. DB Update
    triggerSaveIndicator();
    const saved = await createEvent(newEvent);
    
    if (!saved) {
        alert('שגיאה בשמירת האירוע בשרת. הנתונים מוצגים מקומית בלבד.');
        // Optional: rollback logic could go here
    }
  };

  // Update Event (Persist to DB)
  const handleUpdateEvent = async (updatedEvent: SavedEvent) => {
    // 1. Optimistic Update
    const prevEvents = [...events];
    const newEvents = events.map(e => e.id === updatedEvent.id ? updatedEvent : e);
    setEvents(newEvents);
    setHistory(prev => [[...prevEvents], ...prev].slice(0, 10));

    // 2. DB Update
    triggerSaveIndicator();
    const saved = await updateEvent(updatedEvent);
    
    if (!saved) {
         console.error('Failed to update event in DB');
         // We might want to alert the user or show a red indicator
    }
  };

  // Undo (Local Session Only)
  const handleUndo = () => {
      if (history.length === 0) return;
      const previousState = history[0];
      setHistory(prev => prev.slice(1));
      setEvents(previousState);
      // Note: Reverting DB state for Undo is complex and risky, so we keep Undo local for UI mistakes 
      // within the session, acknowledging it might desync from DB until refresh. 
      // Ideally, we'd issue DB updates for the undo as well, but for this MVP simplicity:
      alert("פעולת ביטול משחזרת מצב מקומי בלבד. שינויים בשרת עשויים להישמר.");
  };

  // Nav Item Data - with Role Filtering
  const allNavItems = [
      { id: 'proposal' as Tab, label: 'מחשבון', roles: ['admin', 'sales'], icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /> },
      { id: 'crm' as Tab, label: 'מכירות', roles: ['admin', 'sales'], icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /> },
      { id: 'operations' as Tab, label: 'ניהול אירועים', roles: ['admin', 'operations'], icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /> },
      { id: 'finance' as Tab, label: 'כספים', roles: ['admin'], icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
      { id: 'timeline' as Tab, label: 'יומן', roles: ['admin', 'sales', 'operations'], icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> }
  ];

  const visibleNavItems = allNavItems.filter(item => !currentUser || item.roles.includes(currentUser.role));

  // --- RENDER LOGIN IF NO USER ---
  if (!currentUser) {
      return <LoginPage onLogin={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-stone-900 flex flex-col md:flex-row overflow-hidden" dir="rtl">
      
      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex w-64 bg-white border-l border-stone-200 h-screen sticky top-0 flex-col shadow-xl z-20">
        <div className="p-4 flex flex-col items-center border-b border-stone-100 bg-gradient-to-b from-white to-stone-50 shrink-0">
           {/* Logo Area */}
          <div className="w-32 h-24 mb-2 relative flex items-center justify-center">
             <img src="https://static.wixstatic.com/media/e87984_d30b09d55a744b22b13a5720ba722b7f~mv2.png/v1/fill/w_766,h_504,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/%D7%9C%D7%95%D7%92%D7%95%20%D7%9E%D7%90%D7%A1%D7%98%D7%A7%D7%A1%D7%98%20%2B%20%D7%98%D7%A7%D7%A1%D7%98%20%D7%A9%D7%A7%D7%95%D7%A3%20.png" 
                  alt="Wadi Logo" 
                  className="w-full h-full object-contain drop-shadow-md"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.classList.add('bg-teal-100', 'rounded-full', 'border-4', 'border-white', 'shadow-lg');
                    const span = document.createElement('span');
                    span.innerText = 'W';
                    span.className = 'text-2xl font-bold text-teal-800';
                    e.currentTarget.parentElement?.appendChild(span);
                  }}
             />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-teal-950 text-center">
            ואדי
          </h1>
          <span className="text-stone-500 font-light text-xs tracking-widest uppercase mt-0.5 mb-2">אוכל מקומי</span>
          
          {/* User Info & Save */}
          <div className="w-full flex flex-col items-center mt-2 border-t border-stone-200/50 pt-2 gap-2">
                <div className="text-xs font-bold text-stone-700 bg-stone-100 px-3 py-1 rounded-full">
                    שלום, {currentUser.name}
                </div>
                
                <div className="flex justify-between w-full px-2">
                    <button 
                        onClick={handleUndo}
                        disabled={history.length === 0}
                        className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition
                            ${history.length > 0 ? 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 cursor-pointer' : 'text-stone-300 cursor-not-allowed'}`}
                        title="בטל פעולה אחרונה"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                        ביטול
                    </button>
                    
                    <div className={`flex items-center gap-1 text-[10px] font-bold text-teal-600 transition-opacity duration-500 ${isSaving ? 'opacity-100' : 'opacity-0'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        נשמר
                    </div>
                </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {visibleNavItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-300 rounded-lg mb-1
                    ${activeTab === item.id 
                    ? 'bg-teal-50 text-teal-800 shadow-sm border border-teal-100 font-bold' 
                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700 font-medium'
                    }`}
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {item.icon}
                </svg>
                <span className="text-base">{item.label}</span>
                {activeTab === item.id && <div className="mr-auto w-1.5 h-1.5 rounded-full bg-teal-500"></div>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-stone-200 bg-stone-50 shrink-0 flex justify-between items-center">
          <p className="text-[10px] text-stone-400">© 2025 ואדי</p>
          <button 
            onClick={() => setCurrentUser(null)} 
            className="text-xs font-bold text-red-400 hover:text-red-600 flex items-center gap-1"
            title="התנתק"
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              יציאה
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto bg-[#f8fafc] p-2 md:p-8 relative pb-20 md:pb-8">
        <div className="max-w-[1600px] mx-auto h-full">
          {activeTab === 'proposal' && (
            <ProposalTab 
                onProposalCreated={handleAddEvent} 
                events={events}
                onUpdateEvent={handleUpdateEvent}
            />
          )}
          
          {activeTab === 'crm' && (
            <CRMTab events={events} onAddEvent={handleAddEvent} onUpdateEvent={handleUpdateEvent} />
          )}

          {activeTab === 'operations' && (
            <OperationsTab events={events} onUpdateEvent={handleUpdateEvent} />
          )}

          {activeTab === 'finance' && (
            <FinanceTab events={events} onUpdateEvent={handleUpdateEvent} />
          )}

          {activeTab === 'timeline' && (
            <TimelineTab events={events} onUpdateEvent={handleUpdateEvent} />
          )}
        </div>
      </main>

      {/* Bottom Navigation Bar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-50 flex justify-around items-center px-2 py-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] safe-area-pb">
          {visibleNavItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all min-w-[60px]
                    ${activeTab === item.id ? 'text-teal-700 bg-teal-50' : 'text-stone-400'}`}
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {item.icon}
                  </svg>
                  <span className="text-[10px] font-bold leading-none">{item.label}</span>
              </button>
          ))}
          <button 
            onClick={() => setCurrentUser(null)}
            className="flex flex-col items-center gap-1 p-2 rounded-lg text-red-400 min-w-[60px]"
          >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
               <span className="text-[10px] font-bold leading-none">יציאה</span>
          </button>
      </nav>

    </div>
  );
};

export default App;
