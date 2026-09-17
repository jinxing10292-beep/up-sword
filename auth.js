function switchTab(tab) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(t => t.classList.remove('active'));
    const targetTab = document.getElementById(tab + 'Tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }
}

function showMsg(tabName, msg, type) {
    const msgEl = document.getElementById(tabName + 'Msg');
    if (!msgEl) return;
    msgEl.textContent = msg;
    msgEl.className = `msg ${type}`;
    setTimeout(() => {
        msgEl.className = 'msg';
    }, 3000);
}

function canUseSupabase() {
    return !!(CONFIG && CONFIG.supabase && typeof CONFIG.supabase.from === 'function');
}

const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signupEmail')?.value || '';
        const username = document.getElementById('signupUsername')?.value || '';
        const password = document.getElementById('signupPassword')?.value || '';
        const confirm = document.getElementById('signupPasswordConfirm')?.value || '';

        if (!email.includes('@')) {
            showMsg('signup', '올바른 이메일을 입력하세요.', 'error');
            return;
        }
        if (username.length < 2) {
            showMsg('signup', '닉네임은 2자 이상이어야 합니다.', 'error');
            return;
        }
        if (password.length < 8) {
            showMsg('signup', '비밀번호는 8자 이상이어야 합니다.', 'error');
            return;
        }
        if (password !== confirm) {
            showMsg('signup', '비밀번호가 일치하지 않습니다.', 'error');
            return;
        }

        try {
            if (!canUseSupabase()) {
                throw new Error('Supabase 연결이 준비되지 않았습니다.');
            }

            const { data, error } = await CONFIG.supabase
                .from('users')
                .insert([{ email, username, password_hash: password }])
                .select();

            if (error) throw error;

            const userId = data && data[0] ? data[0].id : null;
            if (!userId) throw new Error('회원 생성 후 사용자 ID를 확인할 수 없습니다.');

            localStorage.setItem('userId', userId);
            localStorage.setItem('username', username);
            localStorage.setItem('email', email);
            localStorage.setItem('isGuest', 'false');

            showMsg('signup', '회원가입 성공! 게임 시작합니다.', 'success');

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } catch (error) {
            console.error('회원가입 실패:', error);
            showMsg('signup', '회원가입 실패: ' + (error.message || '알 수 없는 오류'), 'error');
        }
    });
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail')?.value || '';
        const password = document.getElementById('loginPassword')?.value || '';

        try {
            if (!canUseSupabase()) {
                throw new Error('Supabase 연결이 준비되지 않았습니다.');
            }

            const { data, error } = await CONFIG.supabase
                .from('users')
                .select('id, username, email, password_hash')
                .eq('email', email)
                .single();

            if (error || !data) throw new Error('계정을 찾을 수 없습니다.');
            if (data.password_hash !== password) throw new Error('비밀번호가 일치하지 않습니다.');

            localStorage.setItem('userId', data.id);
            localStorage.setItem('username', data.username);
            localStorage.setItem('email', data.email);
            localStorage.setItem('isGuest', 'false');

            showMsg('login', '로그인 성공!', 'success');

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } catch (error) {
            console.error('로그인 실패:', error);
            showMsg('login', '로그인 실패: ' + (error.message || '알 수 없는 오류'), 'error');
        }
    });
}

function guestLogin() {
    const guestId = 'guest_' + Date.now();
    const guestName = '게스트_' + Math.floor(Math.random() * 10000);

    localStorage.setItem('userId', guestId);
    localStorage.setItem('username', guestName);
    localStorage.setItem('email', '');
    localStorage.setItem('isGuest', 'true');

    localStorage.setItem('gameState', JSON.stringify({
        swordLevel: 0,
        gold: 1000000,
        money: 0,
        cumulativeCost: 0
    }));

    window.location.href = 'index.html';
}
