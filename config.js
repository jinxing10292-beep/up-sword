// Supabase 설정
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';

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
