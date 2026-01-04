
import { createClient } from '@supabase/supabase-js';
import { SavedEvent } from '../types';

// Project Credentials
const PROJECT_ID = 'gycthenbrcjaynhafpmj';
const SUPABASE_URL = `https://${PROJECT_ID}.supabase.co`;
const SUPABASE_ANON_KEY = 'sb_publishable_CxARiCftnubddeUAPw7vcw_mwxpmdhw'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper to check connection
export const checkSupabaseConnection = async () => {
    try {
        const { count, error } = await supabase.from('events').select('*', { count: 'exact', head: true });
        if (error) throw error;
        console.log('Supabase Connected!', count);
        return true;
    } catch (err) {
        console.error('Supabase Connection Failed:', err);
        return false;
    }
};

// --- CRUD Operations ---

export const fetchEvents = async (): Promise<SavedEvent[]> => {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('createdAt', { ascending: false });
        
    if (error) {
        console.error('Error fetching events:', error);
        return [];
    }
    return data as SavedEvent[];
};

export const createEvent = async (event: SavedEvent): Promise<SavedEvent | null> => {
    // We send the ID if it was generated on client, or let DB generate it.
    // Since CRMTab generates UUIDs, we include it.
    const { data, error } = await supabase
        .from('events')
        .insert([event])
        .select()
        .single();

    if (error) {
        console.error('Error creating event:', error);
        return null;
    }
    return data as SavedEvent;
};

export const updateEvent = async (event: SavedEvent): Promise<SavedEvent | null> => {
    const { data, error } = await supabase
        .from('events')
        .update(event)
        .eq('id', event.id)
        .select()
        .single();

    if (error) {
        console.error('Error updating event:', error);
        return null;
    }
    return data as SavedEvent;
};
