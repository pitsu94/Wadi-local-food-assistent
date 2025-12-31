
import React, { useState } from 'react';
import EventForm from './EventForm';
import ProposalView from './ProposalView';
import { EventFormData, ProposalResponse, SavedEvent } from '../types';
import { generateProposal } from '../services/geminiService';

interface ProposalTabProps {
  onProposalCreated: (event: SavedEvent) => void;
  events: SavedEvent[]; // Add events list prop
  onUpdateEvent: (event: SavedEvent) => void; // Add update handler
}

const ProposalTab: React.FC<ProposalTabProps> = ({ onProposalCreated, events, onUpdateEvent }) => {
  const [proposal, setProposal] = useState<ProposalResponse | null>(null);
  const [lastFormData, setLastFormData] = useState<EventFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (data: EventFormData) => {
    setLoading(true);
    setError(null);
    setLastFormData(data);
    try {
      const result = await generateProposal(data);
      setProposal(result);
      // NOTE: We no longer auto-create the event here immediately if we want to allow assignment.
      // However, to keep legacy behavior, we can still create it, 
      // but ProposalView now handles "Assign" which is the new preferred flow.
      
    } catch (err) {
      console.error(err);
      setError("אירעה שגיאה בבניית ההצעה. אנא נסה שנית.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setProposal(null);
    setLastFormData(null);
    setError(null);
  };

  if (proposal && lastFormData) {
    return (
        <ProposalView 
            proposal={proposal} 
            formData={lastFormData} 
            onReset={handleReset} 
            events={events}
            onUpdateEvent={onUpdateEvent}
        />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in">
      <EventForm onSubmit={handleFormSubmit} isLoading={loading} />
      
      {error && (
        <div className="w-full max-w-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg relative shadow-sm mt-4 text-sm" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
    </div>
  );
};

export default ProposalTab;
