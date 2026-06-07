// ========================================
// SUPABASE CONFIGURATION
// ========================================

// GANTI DENGAN CREDENTIAL SUPABASE ANDA!
const SUPABASE_URL = 'https://aummxgxudbjeqjnzlxrq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1bW14Z3h1ZGJqZXFqbnpseHJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjY5MzIsImV4cCI6MjA5NjQwMjkzMn0.pQqh7CeXACaarP-7qnMNWZWD4bXqJ1YFsl9jlMvo0YY';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for use in other files
window.supabaseClient = supabase;
window.SUPABASE_URL = SUPABASE_URL;

// Check connection
async function checkSupabaseConnection() {
    try {
        const { data, error } = await supabase.from('settings').select('*').limit(1);
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Supabase connection error:', error);
        return false;
    }
}

window.checkSupabaseConnection = checkSupabaseConnection;