// ========================================
// SUPABASE CONFIGURATION
// ========================================

const SUPABASE_URL = 'https://aummxgxudbjeqjnzlxrq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1bW14Z3h1ZGJqZXFqbnpseHJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjY5MzIsImV4cCI6MjA5NjQwMjkzMn0.pQqh7CeXACaarP-7qnMNWZWD4bXqJ1YFsl9jlMvo0YY';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for use in other files
window.supabaseClient = supabase;
window.SUPABASE_URL = SUPABASE_URL;

// Check connection dengan error handling yang lebih baik
async function checkSupabaseConnection() {
    try {
        console.log('Checking Supabase connection...');
        const { data, error } = await supabase.from('settings').select('*').limit(1);
        
        if (error) {
            console.error('Supabase query error:', error);
            if (error.code === '42P01') {
                console.error('❌ Table "settings" does not exist! Please run the SQL script first.');
                document.getElementById('supabase-connection-status').innerHTML = '<span style="color:#ef4444;">● Missing tables - Run SQL script</span>';
            } else {
                document.getElementById('supabase-connection-status').innerHTML = `<span style="color:#ef4444;">● Error: ${error.message}</span>`;
            }
            return false;
        }
        
        console.log('✅ Supabase connected successfully!');
        document.getElementById('supabase-connection-status').innerHTML = '<span style="color:#22c55e;">● Connected to Supabase</span>';
        return true;
    } catch (error) {
        console.error('Supabase connection error:', error);
        document.getElementById('supabase-connection-status').innerHTML = '<span style="color:#ef4444;">● Connection failed</span>';
        return false;
    }
}

window.checkSupabaseConnection = checkSupabaseConnection;

// Run check on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => checkSupabaseConnection());
} else {
    checkSupabaseConnection();
}