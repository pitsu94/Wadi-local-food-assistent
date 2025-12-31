
import { createClient } from '@supabase/supabase-js';

// Project Credentials
const PROJECT_ID = 'gycthenbrcjaynhafpmj';
const SUPABASE_URL = `https://${PROJECT_ID}.supabase.co`;
const SUPABASE_ANON_KEY = 'sb_publishable_CxARiCftnubddeUAPw7vcw_mwxpmdhw'; // Note: Ensure this is the correct Anon Key from API settings

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper to check connection
export const checkSupabaseConnection = async () => {
    try {
        const { data, error } = await supabase.from('events').select('count', { count: 'exact', head: true });
        if (error) throw error;
        console.log('Supabase Connected!');
        return true;
    } catch (err) {
        console.error('Supabase Connection Failed:', err);
        return false;
    }
};
