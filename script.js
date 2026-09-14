// 페이지 전환
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// 탭 전환
function switchTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(tab === 'login' ? 'loginTab' : 'signupTab').classList.add('active');
}

// 메시지 표시
function showAuthMessage(msg, type) {
    const msgDiv = document.getElementById('authMessage');
    msgDiv.textContent = msg;
    msgDiv.className = `auth-message ${type}`;
    setTimeout(() => msgDiv.className = 'auth-message', 3000);
}

// 숫자 포맷
function formatNumber(num) {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toString();
}

// UI 업데이트
function updateUI() {
    document.getElementById('goldDisplay').textContent = formatNumber(gameState.gold);
    document.getElementById('moneyDisplay').textContent = formatNumber(gameState.money);
    document.getElementById('swordLevel').textContent = gameState.swordLevel;
    document.getElementById('displayLevel').textContent = `+${gameState.swordLevel}`;
    document.getElementById('cumulativeCost').textContent = formatNumber(gameState.cumulativeCost);
    document.getElementById('rouletteGold').textContent = formatNumber(gameState.gold);
    updateEnhanceInfo();
}

// 강화 정보 업데이트
function updateEnhanceInfo() {
    if (gameState.swordLevel >= 30) {
        document.getElementById('successRate').textContent = '완료';
        document.getElementById('maintainRate').textContent = '-';
        document.getElementById('breakRate').textContent = '-';
        document.getElementById('costAmount').textContent = '-';
        document.getElementById('enhanceBtn').disabled = true;
    } else {
        const data = ENHANCEMENT_DATA[gameState.swordLevel];
        document.getElementById('successRate').textContent = `${data.success}%`;
        document.getElementById('maintainRate').textContent = `${data.maintain}%`;
        document.getElementById('breakRate').textContent = `${data.break}%`;
        document.getElementById('costAmount').textContent = formatNumber(data.cost);
        document.getElementById('enhanceBtn').disabled = false;
    }
}

// 로그인
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const { data, error } = await CONFIG.supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        localStorage.setItem('user_id', data.user.id);
        localStorage.setItem('username', email);
        showPage('gamePage');
        updateUI();
    } catch (error) {
        showAuthMessage('로그인 실패: ' + error.message, 'error');
    }
});

// 회원가입
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupPasswordConfirm').value;

    if (password !== confirm) {
        showAuthMessage('비밀번호가 일치하지 않습니다.', 'error');
        return;
    }

    try {
        const { data, error } = await CONFIG.supabase.auth.signUp({ email, password });
        if (error) throw error;
        showAuthMessage('회원가입 성공! 로그인하세요.', 'success');
        switchTab('login');
    } catch (error) {
        showAuthMessage('회원가입 실패: ' + error.message, 'error');
    }
});

// 로그아웃
document.getElementById('logoutBtn').addEventListener('click', async () => {
    await CONFIG.supabase.auth.signOut();
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    showPage('loginPage');
});

// 강화 버튼
document.getElementById('enhanceBtn').addEventListener('click', () => {
    const result = gameState.attemptEnhance();
    const resultMessage = document.getElementById('resultMessage');
    const resultText = document.getElementById('resultText');
    
    resultMessage.className = 'result-message ' + result.result;
    resultText.textContent = result.message;
    resultMessage.style.display = 'block';
    
    updateUI();
    setTimeout(() => resultMessage.style.display = 'none', 3000);
});

// 판매 버튼
document.getElementById('sellBtn').addEventListener('click', () => {
    const result = gameState.sellSword();
    alert(result.message);
    updateUI();
});

// 보관 버튼
document.getElementById('storeBtn').addEventListener('click', () => {
    if (gameState.swordLevel === 0) {
        alert('보관할 검이 없습니다!');
        return;
    }
    alert(`+${gameState.swordLevel} 검을 보관했습니다!`);
});

// 메인 메뉴 버튼들
document.getElementById('rankingBtn').addEventListener('click', () => {
    updateRankingDisplay();
    showPage('rankingPage');
});

document.getElementById('upgradeBtn').addEventListener('click', () => {
    showPage('upgradePage');
    updateUI();
});

document.getElementById('rouletteBtn').addEventListener('click', () => {
    showPage('roulettePage');
    updateUI();
});

document.getElementById('checkBtn').addEventListener('click', () => alert('준비 중입니다!'));
document.getElementById('battleBtn').addEventListener('click', () => alert('준비 중입니다!'));
document.getElementById('gmBtn').addEventListener('click', () => {
    const pwd = prompt('GM 비밀번호:');
    if (pwd === 'admin') gameState.addGold(1000000);
});
document.getElementById('inventoryBtn').addEventListener('click', () => showPage('inventoryPage'));
document.getElementById('missionBtn').addEventListener('click', () => alert('준비 중입니다!'));
document.getElementById('shopBtn').addEventListener('click', () => alert('준비 중입니다!'));
document.getElementById('equipBtn').addEventListener('click', () => alert('준비 중입니다!'));

// 돌아가기 버튼들
document.getElementById('backFromUpgrade').addEventListener('click', () => showPage('gamePage'));
document.getElementById('backFromRoulette').addEventListener('click', () => showPage('gamePage'));
document.getElementById('backFromRanking').addEventListener('click', () => showPage('gamePage'));
document.getElementById('backFromInventory').addEventListener('click', () => showPage('gamePage'));

// 룰렛 스핀
document.getElementById('spinBtn').addEventListener('click', () => {
    const betAmount = parseInt(document.getElementById('betAmount').value) || 0;
    
    if (betAmount <= 0) {
        alert('베팅 금액을 입력하세요.');
        return;
    }
    
    if (gameState.gold < betAmount) {
        alert('골드가 부족합니다!');
        return;
    }

    document.getElementById('spinBtn').disabled = true;
    const wheel = document.getElementById('rouletteWheel');
    const spinResult = gameState.spin(betAmount);

    wheel.style.transition = 'none';
    wheel.style.transform = 'rotate(0deg)';
    void wheel.offsetWidth;

    const rotations = 5;
    const finalPosition = spinResult.spinIndex * (360 / 46);
    const spinAngle = rotations * 360 + finalPosition + Math.random() * 30;

    wheel.style.transition = 'transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    wheel.style.transform = `rotate(${spinAngle}deg)`;

    setTimeout(() => {
        document.getElementById('resultText').textContent = spinResult.message;
        document.getElementById('resultAmount').textContent = 
            spinResult.winAmount > 0 ? `획득: +${formatNumber(spinResult.winAmount)}G` : '';
        document.getElementById('rouletteResult').style.display = 'block';
        
        updateUI();
        document.getElementById('spinBtn').disabled = false;
        document.getElementById('betAmount').value = '';
        
        setTimeout(() => document.getElementById('rouletteResult').style.display = 'none', 3000);
    }, 3000);
});

// 빠른 베팅
document.querySelectorAll('.quick-bet').forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById('betAmount').value = btn.dataset.amount;
    });
});

// 랭킹 표시
function updateRankingDisplay() {
    gameState.updateRanking();
    const list = document.getElementById('rankingList');
    list.innerHTML = '';

    gameState.rankings.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'ranking-item';
        if (idx === 0) div.classList.add('top-1');
        else if (idx === 1) div.classList.add('top-2');
        else if (idx === 2) div.classList.add('top-3');

        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}위`;
        
        div.innerHTML = `
            <div class="rank-badge">${medal}</div>
            <div>
                <div class="ranking-name">${item.name}</div>
                <div class="ranking-stats">+${item.level} • ${formatNumber(item.gold)}G</div>
            </div>
        `;
        list.appendChild(div);
    });
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('user_id');
    if (userId) {
        showPage('gamePage');
        updateUI();
    }
});
