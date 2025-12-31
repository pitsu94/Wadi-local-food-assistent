
import React, { useState } from 'react';
import { SavedEvent, CostBreakdown } from '../types';

interface FinanceTabProps {
  events: SavedEvent[];
  onUpdateEvent?: (event: SavedEvent) => void;
}

const FinanceTab: React.FC<FinanceTabProps> = ({ events, onUpdateEvent }) => {
  const [expandedFinanceRow, setExpandedFinanceRow] = useState<string | null>(null);
  
  // State for editing "Actuals"
  const [editActuals, setEditActuals] = useState<CostBreakdown | null>(null);
  const [editNotes, setEditNotes] = useState("");

  const activeEvents = events.filter(e => e.status !== 'לא רלוונטי');

  // Helpers
  const calculateFinancials = (event: SavedEvent) => {
    const revenue = event.totalPrice || 0;
    
    // Estimated Breakdown
    const estBreakdown = event.costBreakdown || {
        food: event.estimatedCost ? event.estimatedCost * 0.40 : 0,
        labor: event.estimatedCost ? event.estimatedCost * 0.30 : 0,
        equipment: event.estimatedCost ? event.estimatedCost * 0.20 : 0,
        logistics: event.estimatedCost ? event.estimatedCost * 0.10 : 0,
    };
    
    // Use Actuals if they exist for "Real" calculations, otherwise use Estimated
    const breakdown = event.actualCostBreakdown || estBreakdown;
    
    const cogs = breakdown.food + breakdown.labor + breakdown.equipment + breakdown.logistics;
    const profit = revenue - cogs;
    const margin = revenue > 0 ? ((profit / revenue) * 100) : 0;
    
    return { revenue, cogs, profit, margin, breakdown, estBreakdown };
  };

  // Aggregates
  const totals = activeEvents.reduce((acc, curr) => {
    const { revenue, profit, breakdown } = calculateFinancials(curr);
    
    // Revenue & Profit (Real - Closed deals)
    if (curr.status === 'בוצע' || curr.status === 'סגור') {
        acc.realRevenue += revenue;
        acc.realProfit += profit;
        
        // Add to expense breakdown only for real events
        acc.expenses.food += breakdown.food;
        acc.expenses.labor += breakdown.labor;
        acc.expenses.equipment += breakdown.equipment;
        acc.expenses.logistics += breakdown.logistics;
        acc.totalExpenses += (breakdown.food + breakdown.labor + breakdown.equipment + breakdown.logistics);
    }
    
    // Forecast includes Negotiation
    acc.forecastRevenue += revenue;
    
    // Debt Collection
    if ((curr.status === 'בוצע' || curr.status === 'סגור') && curr.paymentStatus !== 'שולם מלא') {
         acc.debt += revenue; 
         acc.collected += 0;
    } else if (curr.paymentStatus === 'שולם מלא') {
         acc.collected += revenue;
    }
    
    return acc;
  }, { 
      realRevenue: 0, 
      realProfit: 0, 
      forecastRevenue: 0, 
      debt: 0, 
      collected: 0,
      expenses: { food: 0, labor: 0, equipment: 0, logistics: 0 },
      totalExpenses: 0
  });

  const collectionPercentage = totals.realRevenue > 0 ? (totals.collected / totals.realRevenue) * 100 : 0;

  // Toggle Row Logic
  const toggleRow = (event: SavedEvent) => {
    if (expandedFinanceRow === event.id) {
        setExpandedFinanceRow(null);
        setEditActuals(null);
        setEditNotes("");
    } else {
        setExpandedFinanceRow(event.id);
        // Initialize edit state with existing actuals or empty structure
        setEditActuals(event.actualCostBreakdown || { food: 0, labor: 0, equipment: 0, logistics: 0 });
        setEditNotes(event.debriefNotes || "");
    }
  };

  const handleActualChange = (field: keyof CostBreakdown, value: string) => {
      if (editActuals) {
          setEditActuals({ ...editActuals, [field]: parseFloat(value) || 0 });
      }
  };

  const saveDebrief = (event: SavedEvent) => {
      if (onUpdateEvent && editActuals) {
          onUpdateEvent({
              ...event,
              actualCostBreakdown: editActuals,
              debriefNotes: editNotes
          });
          setExpandedFinanceRow(null); // Close after save
      }
  };

  return (
    <div className="animate-fade-in max-w-full mx-auto h-full flex flex-col pb-4">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-teal-900">כספים ורווחיות</h2>
          <p className="text-stone-500 mt-1">דוחות רווח והפסד, מעקב תשלומים וניתוח התייעלות</p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
         {/* Card 1: Revenue & Profit */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex flex-col justify-between relative overflow-hidden">
             <div className="absolute top-0 right-0 w-1.5 h-full bg-emerald-500"></div>
             <div>
                 <span className="text-sm font-bold text-stone-400 uppercase tracking-wider">הכנסות (בפועל)</span>
                 <div className="text-3xl font-bold text-stone-800 mt-1">₪{totals.realRevenue.toLocaleString()}</div>
             </div>
             <div className="mt-4 pt-4 border-t border-stone-100 flex justify-between items-end">
                 <div>
                    <span className="text-xs font-bold text-stone-400 uppercase">רווח נקי</span>
                    <div className="text-xl font-bold text-emerald-600">₪{totals.realProfit.toLocaleString()}</div>
                 </div>
                 <div className="text-right">
                    <span className="text-xs text-stone-400">אחוז רווח</span>
                    <div className="text-lg font-bold text-emerald-700">
                        {totals.realRevenue > 0 ? ((totals.realProfit / totals.realRevenue) * 100).toFixed(1) : 0}%
                    </div>
                 </div>
             </div>
         </div>

         {/* Card 2: Debt Collection Gap */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-blue-500"></div>
             <div>
                 <span className="text-sm font-bold text-stone-400 uppercase tracking-wider">סטטוס גבייה</span>
                 <div className="flex items-baseline gap-2 mt-1">
                    <div className="text-3xl font-bold text-stone-800">₪{totals.collected.toLocaleString()}</div>
                    <span className="text-sm text-stone-400">נכנס לבנק</span>
                 </div>
             </div>
             <div className="mt-4">
                 <div className="flex justify-between text-xs font-bold mb-1">
                     <span className="text-blue-600">{collectionPercentage.toFixed(0)}% נגבה</span>
                     <span className="text-red-500">פער: ₪{totals.debt.toLocaleString()}</span>
                 </div>
                 <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden flex">
                     <div className="bg-blue-500 h-full" style={{ width: `${collectionPercentage}%` }}></div>
                     <div className="bg-red-400 h-full" style={{ width: `${100 - collectionPercentage}%` }}></div>
                 </div>
             </div>
         </div>

         {/* Card 3: Operational Efficiency (Expenses Breakdown) */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-purple-500"></div>
             <span className="text-sm font-bold text-stone-400 uppercase tracking-wider">התייעלות (פילוח הוצאות)</span>
             
             <div className="mt-4 space-y-3">
                 {[
                     { label: 'חומרי גלם', value: totals.expenses.food, color: 'bg-emerald-400', width: (totals.expenses.food / totals.totalExpenses) * 100 },
                     { label: 'כוח אדם', value: totals.expenses.labor, color: 'bg-blue-400', width: (totals.expenses.labor / totals.totalExpenses) * 100 },
                     { label: 'השכרה', value: totals.expenses.equipment, color: 'bg-purple-400', width: (totals.expenses.equipment / totals.totalExpenses) * 100 },
                     { label: 'לוגיסטיקה', value: totals.expenses.logistics, color: 'bg-amber-400', width: (totals.expenses.logistics / totals.totalExpenses) * 100 },
                 ].map((item, idx) => (
                     <div key={idx} className="flex items-center text-xs">
                         <span className="w-20 text-stone-500 font-medium">{item.label}</span>
                         <div className="flex-1 h-2 bg-stone-100 rounded-full mx-2 overflow-hidden">
                             <div className={`h-full ${item.color}`} style={{ width: `${item.width || 0}%` }}></div>
                         </div>
                         <span className="w-16 text-right font-mono text-stone-700">₪{item.value.toLocaleString()}</span>
                     </div>
                 ))}
             </div>
         </div>
      </div>

      {/* Financial Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="p-6 border-b border-stone-200 bg-stone-50 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-stone-700">פירוט עסקאות</h3>
              <span className="text-xs font-medium text-stone-400">לחץ על שורה לתחקור אירוע ועדכון עלויות בפועל</span>
          </div>
          
          <div className="overflow-y-auto flex-1 custom-scrollbar">
               <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                  width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: #f1f1f4; 
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: #d6d3d1; 
                  border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: #a8a29e; 
                }
            `}</style>
            <table className="w-full text-right border-collapse relative">
                <thead className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider sticky top-0 shadow-sm z-10">
                <tr>
                    <th className="px-6 py-4 font-semibold w-24">תאריך</th>
                    <th className="px-6 py-4 font-semibold">לקוח</th>
                    <th className="px-6 py-4 font-semibold text-emerald-700">הכנסה</th>
                    <th className="px-6 py-4 font-semibold text-stone-500">עלות (תכנון/בפועל)</th>
                    <th className="px-6 py-4 font-semibold text-stone-800">רווח</th>
                    <th className="px-6 py-4 font-semibold">אחוז רווח</th>
                    <th className="px-6 py-4 font-semibold">סטטוס תשלום</th>
                    <th className="px-6 py-4 font-semibold w-10"></th>
                </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm">
                {activeEvents.map((event) => {
                    const { revenue, cogs, profit, margin, breakdown } = calculateFinancials(event);
                    const isExpanded = expandedFinanceRow === event.id;
                    const hasActuals = !!event.actualCostBreakdown;
                    
                    return (
                        <React.Fragment key={event.id}>
                        <tr onClick={() => toggleRow(event)} className={`cursor-pointer transition hover:bg-teal-50/30 ${isExpanded ? 'bg-teal-50/50' : ''}`}>
                            <td className="px-6 py-4 font-mono text-stone-500">{new Date(event.eventDate).toLocaleDateString('he-IL')}</td>
                            <td className="px-6 py-4 font-bold text-stone-800">{event.customerName}</td>
                            <td className="px-6 py-4 font-bold text-emerald-700">₪{revenue.toLocaleString()}</td>
                            <td className="px-6 py-4 text-stone-500">
                                ₪{cogs.toLocaleString()} 
                                {hasActuals && <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 rounded mr-2 font-bold">בפועל</span>}
                            </td>
                            <td className="px-6 py-4 font-bold text-stone-800">₪{profit.toLocaleString()}</td>
                            <td className="px-6 py-4">
                                <span className={`font-bold ${margin < 15 ? 'text-red-500' : (margin > 30 ? 'text-emerald-500' : 'text-amber-500')}`}>
                                    {margin.toFixed(1)}%
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold 
                                    ${event.paymentStatus === 'חוב' ? 'bg-red-100 text-red-800' : 
                                      event.paymentStatus === 'שולם מלא' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'}`}>
                                    {event.paymentStatus || 'טרם שולם'}
                                </span>
                            </td>
                             <td className="px-6 py-4 text-stone-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </td>
                        </tr>

                        {/* EXPANDED ROW FOR DEBRIEF */}
                        {isExpanded && (
                            <tr className="bg-stone-50 shadow-inner">
                                <td colSpan={8} className="p-0 cursor-default">
                                    <div className="p-6 border-b-2 border-teal-100 animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-8">
                                        
                                        {/* Left: Financial Comparison */}
                                        <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm">
                                            <h4 className="font-bold text-teal-800 mb-4 flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                                תחקור עלויות (תכנון מול ביצוע)
                                            </h4>
                                            
                                            <div className="grid grid-cols-3 gap-4 mb-2 text-xs font-bold text-stone-400 uppercase border-b border-stone-100 pb-2">
                                                <span>קטגוריה</span>
                                                <span className="text-center">תכנון (₪)</span>
                                                <span className="text-center text-purple-600">בפועל (₪)</span>
                                            </div>

                                            {/* Rows */}
                                            {[
                                                { label: 'חומרי גלם (מזון)', key: 'food' as keyof CostBreakdown, plan: calculateFinancials(event).estBreakdown.food },
                                                { label: 'כוח אדם', key: 'labor' as keyof CostBreakdown, plan: calculateFinancials(event).estBreakdown.labor },
                                                { label: 'השכרה', key: 'equipment' as keyof CostBreakdown, plan: calculateFinancials(event).estBreakdown.equipment },
                                                { label: 'לוגיסטיקה ושונות', key: 'logistics' as keyof CostBreakdown, plan: calculateFinancials(event).estBreakdown.logistics },
                                            ].map((row) => (
                                                <div key={row.key} className="grid grid-cols-3 gap-4 items-center mb-3">
                                                    <span className="text-stone-700 font-medium text-sm">{row.label}</span>
                                                    <span className="text-center text-stone-500 font-mono text-sm bg-stone-50 py-1 rounded">
                                                        {Math.round(row.plan).toLocaleString()}
                                                    </span>
                                                    <input 
                                                        type="number"
                                                        value={editActuals ? editActuals[row.key] : 0}
                                                        onChange={(e) => handleActualChange(row.key, e.target.value)}
                                                        className="w-full text-center font-bold text-purple-700 border border-stone-300 rounded px-2 py-1 text-sm bg-white focus:ring-2 focus:ring-purple-200 outline-none"
                                                    />
                                                </div>
                                            ))}

                                            <div className="mt-4 pt-4 border-t border-stone-100 flex justify-between items-center bg-stone-50 p-3 rounded-lg">
                                                <div>
                                                    <span className="block text-xs font-bold text-stone-400">רווח סופי (מחושב)</span>
                                                    <span className={`text-xl font-bold ${calculateFinancials({...event, actualCostBreakdown: editActuals!}).margin < 15 ? 'text-red-500' : 'text-emerald-600'}`}>
                                                        {calculateFinancials({...event, actualCostBreakdown: editActuals!}).margin.toFixed(1)}%
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                     <span className="block text-xs font-bold text-stone-400">סה"כ רווח</span>
                                                     <span className="text-xl font-bold text-stone-800">₪{calculateFinancials({...event, actualCostBreakdown: editActuals!}).profit.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Notes & Save */}
                                        <div className="flex flex-col h-full">
                                            <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm flex-1 flex flex-col mb-4">
                                                <h4 className="font-bold text-teal-800 mb-4 flex items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    לקחים ודגשים (Free Text)
                                                </h4>
                                                <textarea 
                                                    value={editNotes}
                                                    onChange={(e) => setEditNotes(e.target.value)}
                                                    className="w-full flex-1 p-3 border border-stone-300 rounded-lg resize-none text-sm text-stone-700 outline-none focus:border-teal-500 bg-white"
                                                    placeholder="רשום כאן לקחים מהאירוע, דברים לשימור ולשיפור, הערות על תפעול וכו'..."
                                                />
                                            </div>
                                            
                                            <div className="flex justify-end gap-3">
                                                 <button 
                                                    onClick={() => toggleRow(event)}
                                                    className="px-6 py-2 rounded-lg text-stone-500 font-bold hover:bg-stone-200 transition"
                                                >
                                                    ביטול
                                                </button>
                                                <button 
                                                    onClick={() => saveDebrief(event)}
                                                    className="px-6 py-2 rounded-lg bg-teal-700 text-white font-bold shadow-md hover:bg-teal-800 transition"
                                                >
                                                    שמור נתונים
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                </td>
                            </tr>
                        )}
                        </React.Fragment>
                    );
                })}
                </tbody>
            </table>
          </div>
      </div>
    </div>
  );
};

export default FinanceTab;
