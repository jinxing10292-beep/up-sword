// 탭 전환
function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(tab + 'Tab').classList.add('active');
}

// 메시지 표시
function showMsg(tabName, msg, type) {
    const msgEl = document.getElementById(tabName + 'Msg');
    msgEl.textContent = msg;
    msgEl.className = `msg ${type}`;
    setTimeout(() => msgEl.className = 'msg', 3000);
}

// ===== 회원가입 =====
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupPasswordConfirm').value;

    // 검증
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
        // Supabase 저장
        const { data, error } = await CONFIG.supabase
            .from('users')
            .insert([{ email, username, password }])
            .select();

        if (error) throw error;

        const userId = data[0].id;

        // 로컬 저장
        localStorage.setItem('userId', userId);
        localStorage.setItem('username', username);
        localStorage.setItem('email', email);

        showMsg('signup', '회원가입 성공! 게임 시작합니다.', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);

    } catch (error) {
        showMsg('signup', '회원가입 실패: ' + error.message, 'error');
    }
});

// ===== 로그인 =====
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        // Supabase 조회
        const { data, error } = await CONFIG.supabase
            .from('users')
            .select('id, username, email, password')
            .eq('email', email)
            .single();

        if (error || !data) throw new Error('계정을 찾을 수 없습니다.');
        if (data.password !== password) throw new Error('비밀번호가 일치하지 않습니다.');

        // 로컬 저장
        localStorage.setItem('userId', data.id);
        localStorage.setItem('username', data.username);
        localStorage.setItem('email', data.email);

        showMsg('login', '로그인 성공!', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);

    } catch (error) {
        showMsg('login', '로그인 실패: ' + error.message, 'error');
    }
});
