// SUPABASE CLIENT CONFIGURATION PLATFORM
const SUPABASE_URL = "https://qndqvujqfuplmwpzrbgl.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZHF2dWpxZnVwbG13cHpyYmdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyODg1NTMsImV4cCI6MjA5NTg2NDU1M30.xjYhc6RdShq4uq-nRDKQ5uEvE02pzwixpfhfsCcLrrk";

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabaseClient = _supabase;
