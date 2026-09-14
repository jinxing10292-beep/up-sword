// Supabase 설정
const SUPABASE_URL = 'https://rayxkagfyuxdgbwrherq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJheXhrYWdmeXV4ZGdid3JoZXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzODkyODMsImV4cCI6MjEwNDk2NTI4M30.Ee1dObloT4CAXa_HirdZXe6Dy21R5O5Wywmv_8PKxCM';

// Supabase 초기화
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 환경 설정
const CONFIG = {
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    supabase,
    API_TIMEOUT: 5000,
    MAX_RETRIES: 3
};

// 로컬스토리지 키
const STORAGE_KEYS = {
    USER_ID: 'user_id',
    USERNAME: 'username',
    SESSION: 'session_token',
    GAME_STATE: 'swordGameState'
};
