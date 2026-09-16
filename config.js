// Supabase 설정
const SUPABASE_URL = 'https://rayxkagfyuxdgbwrherq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJheXhrYWdmeXV4ZGdid3JoZXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzODkyODMsImV4cCI6MjEwNDk2NTI4M30.Ee1dObloT4CAXa_HirdZXe6Dy21R5O5Wywmv_8PKxCM';

// Supabase 초기화 (이미 선언되지 않았을 경우만)
let supabaseClient;
if (typeof window.supabase !== 'undefined') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// 환경 설정
const CONFIG = {
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    supabase: supabaseClient,
    API_TIMEOUT: 5000,
    MAX_RETRIES: 3
};

// 로컬스토리지 키
const STORAGE_KEYS = {
    USER_ID: 'userId',
    USERNAME: 'username',
    GAME_STATE: 'gameState'
};
