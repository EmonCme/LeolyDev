// ========================================
// SUPABASE CONFIGURATION
// ========================================

const SUPABASE_URL = 'https://aummxgxudbjeqjnzlxrq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1bW14Z3h1ZGJqZXFqbnpseHJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjY5MzIsImV4cCI6MjA5NjQwMjkzMn0.pQqh7CeXACaarP-7qnMNWZWD4bXqJ1YFsl9jlMvo0YY';

// Tunggu hingga Supabase library siap
function waitForSupabase() {
    return new Promise((resolve) => {
        if (window.supabase && window.supabase.createClient) {
            resolve(window.supabase);
        } else {
            const checkInterval = setInterval(() => {
                if (window.supabase && window.supabase.createClient) {
                    clearInterval(checkInterval);
                    resolve(window.supabase);
                }
            }, 50);
            
            setTimeout(() => {
                clearInterval(checkInterval);
                console.error('Supabase library timeout');
                resolve(null);
            }, 5000);
        }
    });
}

// Initialize Supabase client
let supabase = null;
let supabaseClient = null;

async function initSupabase() {
    const sb = await waitForSupabase();
    if (sb) {
        supabase = sb;
        supabaseClient = sb.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        window.supabaseClient = supabaseClient;
        console.log('✅ Supabase client initialized');
        return true;
    } else {
        console.error('❌ Failed to initialize Supabase');
        return false;
    }
}

// Export for use in other files
window.initSupabase = initSupabase;
window.getSupabaseClient = () => supabaseClient;

// Check connection
async function checkSupabaseConnection() {
    if (!supabaseClient) {
        console.log('Supabase client not ready yet');
        const statusEl = document.getElementById('supabase-connection-status');
        if (statusEl) {
            statusEl.innerHTML = '<span style="color:#f59e0b;">● Initializing...</span>';
        }
        return false;
    }
    
    try {
        console.log('Checking Supabase connection...');
        const { data, error } = await supabaseClient.from('settings').select('*').limit(1);
        
        if (error) {
            console.error('Supabase query error:', error);
            const statusEl = document.getElementById('supabase-connection-status');
            if (statusEl) {
                if (error.code === '42P01') {
                    statusEl.innerHTML = '<span style="color:#ef4444;">● Missing tables - Run SQL script</span>';
                } else {
                    statusEl.innerHTML = `<span style="color:#ef4444;">● Error: ${error.message.substring(0, 50)}</span>`;
                }
            }
            return false;
        }
        
        console.log('✅ Supabase connected successfully!');
        const statusEl = document.getElementById('supabase-connection-status');
        if (statusEl) {
            statusEl.innerHTML = '<span style="color:#22c55e;">● Connected to Supabase</span>';
        }
        return true;
    } catch (error) {
        console.error('Supabase connection error:', error);
        const statusEl = document.getElementById('supabase-connection-status');
        if (statusEl) {
            statusEl.innerHTML = '<span style="color:#ef4444;">● Connection failed</span>';
        }
        return false;
    }
}

window.checkSupabaseConnection = checkSupabaseConnection;

// Auto init when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initSupabase().then(() => {
            setTimeout(checkSupabaseConnection, 500);
        });
    });
} else {
    initSupabase().then(() => {
        setTimeout(checkSupabaseConnection, 500);
    });
}