// 페이지 전환 함수
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
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
    const username = document.getElementById('signupUsername').value;
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

// UI 업데이트 함수
function updateUI() {
    // 메인 페이지
    document.getElementById('goldDisplay').textContent = formatNumber(gameState.gold);
    document.getElementById('moneyDisplay').textContent = formatNumber(gameState.money);
    document.getElementById('swordLevel').textContent = gameState.swordLevel;

    // 강화 페이지
    document.getElementById('displayLevel').textContent = `+${gameState.swordLevel}`;
    document.getElementById('cumulativeCost').textContent = formatNumber(gameState.cumulativeCost);
    
    // 강화 정보 업데이트
    updateEnhanceInfo();

    // 룰렛 페이지
    document.getElementById('rouletteGold').textContent = formatNumber(gameState.gold);
}

// 강화 정보 업데이트
function updateEnhanceInfo() {
    if (gameState.swordLevel >= 30) {
        document.getElementById('successRate').textContent = '완료';
        document.getElementById('maintainRate').textContent = '-';
        document.getElementById('breakRate').textContent = '-';
        document.getElementById('costAmount').textContent = '-';
        document.getElementById('enhanceBtn').textContent = '최대 강화 달성!';
        document.getElementById('enhanceBtn').disabled = true;
    } else {
        const data = ENHANCEMENT_DATA[gameState.swordLevel];
        document.getElementById('successRate').textContent = `${data.success}%`;
        document.getElementById('maintainRate').textContent = `${data.maintain}%`;
        document.getElementById('breakRate').textContent = `${data.break}%`;
        document.getElementById('costAmount').textContent = formatNumber(data.cost);
        document.getElementById('enhanceBtn').disabled = false;
        document.getElementById('enhanceBtn').textContent = '강화하기';
    }
}

// 숫자 포맷팅 (1,000 -> 1.0K 등)
function formatNumber(num) {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toString();
}

// 강화하기 버튼
document.getElementById('enhanceBtn').addEventListener('click', () => {
    const result = gameState.attemptEnhance();
    const resultMessage = document.getElementById('resultMessage');
    const resultText = document.getElementById('resultText');
    
    resultMessage.className = 'result-message ' + result.result;
    resultText.textContent = result.message;
    resultMessage.style.display = 'block';
    
    updateUI();

    // 결과 메시지 자동 숨김
    setTimeout(() => {
        resultMessage.style.display = 'none';
    }, 3000);
});

// 메인 페이지 버튼들
document.getElementById('rankingBtn').addEventListener('click', () => {
    gameState.updateRanking();
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

// 강화 페이지 돌아가기
document.getElementById('backFromUpgrade').addEventListener('click', () => {
    showPage('mainPage');
    updateUI();
});

// 룰렛 페이지 돌아가기
document.getElementById('backFromRoulette').addEventListener('click', () => {
    showPage('mainPage');
    updateUI();
});

// 랭킹 페이지 돌아가기
document.getElementById('backFromRanking').addEventListener('click', () => {
    showPage('mainPage');
});

// 룰렛 스핀
document.getElementById('spinBtn').addEventListener('click', () => {
    const betInput = document.getElementById('betAmount');
    const betAmount = parseInt(betInput.value) || 0;

    if (betAmount <= 0) {
        alert('베팅 금액을 입력해주세요.');
        return;
    }

    if (gameState.gold < betAmount) {
        alert('골드가 부족합니다!');
        return;
    }

    // 스핀 버튼 비활성화
    document.getElementById('spinBtn').disabled = true;

    // 룰렛 회전
    const rouletteWheel = document.getElementById('rouletteWheel');
    const spinResult = gameState.spin(betAmount);

    // 회전 애니메이션 - 여러 바퀴 돌고 결과 위치로 정지
    const rotations = 5; // 5바퀴
    const finalPosition = spinResult.spinIndex * 45;
    const spinAngle = rotations * 360 + finalPosition + (Math.random() * 30); // 약간의 랜덤성
    
    rouletteWheel.style.transition = 'none';
    rouletteWheel.style.transform = 'rotate(0deg)';
    
    // 리플로우 강제 실행
    void rouletteWheel.offsetWidth;
    
    rouletteWheel.style.transition = 'transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    rouletteWheel.style.transform = `rotate(${spinAngle}deg)`;

    // 회전 후 결과 표시
    setTimeout(() => {
        const resultDiv = document.getElementById('rouletteResult');
        document.getElementById('resultText').textContent = spinResult.message;
        document.getElementById('resultAmount').textContent = 
            spinResult.winAmount > 0 ? `획득 골드: +${formatNumber(spinResult.winAmount)}G` : '';
        resultDiv.style.display = 'block';

        updateUI();
        document.getElementById('spinBtn').disabled = false;
        betInput.value = '';

        setTimeout(() => {
            resultDiv.style.display = 'none';
        }, 3000);
    }, 3000);
});

// 빠른 베팅 버튼
document.querySelectorAll('.quick-bet').forEach(btn => {
    btn.addEventListener('click', () => {
        const amount = btn.dataset.amount;
        document.getElementById('betAmount').value = amount;
    });
});

// 랭킹 표시
function updateRankingDisplay() {
    const rankingList = document.getElementById('rankingList');
    rankingList.innerHTML = '';

    gameState.rankings.forEach((item, idx) => {
        const rankingItem = document.createElement('div');
        rankingItem.className = 'ranking-item';
        
        if (idx === 0) rankingItem.classList.add('top-1');
        else if (idx === 1) rankingItem.classList.add('top-2');
        else if (idx === 2) rankingItem.classList.add('top-3');

        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`;

        rankingItem.innerHTML = `
            <div class="rank-badge">${medal}</div>
            <div class="ranking-info">
                <div class="ranking-name">${item.name}</div>
                <div class="ranking-stats">
                    <span>레벨: +${item.level}</span>
                    <span>비용: ${formatNumber(item.gold)}G</span>
                </div>
            </div>
        `;

        rankingList.appendChild(rankingItem);
    });
}

// 테스트용 GM 버튼 (개발 중 사용)
document.getElementById('gmBtn').addEventListener('click', () => {
    const amount = prompt('추가할 골드 양?', '1000000');
    if (amount) {
        gameState.addGold(parseInt(amount));
        updateUI();
    }
});

// 기타 메뉴 버튼들 (준비 중)
document.getElementById('checkBtn').addEventListener('click', () => {
    alert('준비 중입니다!');
});

document.getElementById('battleBtn').addEventListener('click', () => {
    alert('준비 중입니다!');
});

document.getElementById('inventoryBtn').addEventListener('click', () => {
    alert('준비 중입니다!');
});

document.getElementById('missionBtn').addEventListener('click', () => {
    alert('준비 중입니다!');
});

document.getElementById('shopBtn').addEventListener('click', () => {
    alert('준비 중입니다!');
});

document.getElementById('equipBtn').addEventListener('click', () => {
    alert('준비 중입니다!');
});

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    updateRankingDisplay();
});
