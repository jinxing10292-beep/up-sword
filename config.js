// Supabase 설정
const SUPABASE_URL = 'https://rayxkagfyuxdgbwrherq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJheXhrYWdmeXV4ZGdid3JoZXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzODkyODMsImV4cCI6MjEwNDk2NTI4M30.Ee1dObloT4CAXa_HirdZXe6Dy21R5O5Wywmv_8PKxCM';

let supabaseClient = null;
if (typeof window !== 'undefined' && window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (error) {
        console.warn('Supabase client 생성 실패:', error);
    }
}

const CONFIG = {
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    supabase: supabaseClient,
    API_TIMEOUT: 5000,
    MAX_RETRIES: 3,
    isSupabaseReady: !!supabaseClient
};

if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}

const STORAGE_KEYS = {
    USER_ID: 'userId',
    USERNAME: 'username',
    GAME_STATE: 'gameState'
};
