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
    const gold = document.getElementById('goldDisplay');
    if (gold) {
        document.getElementById('goldDisplay').textContent = formatNumber(gameState.gold);
        document.getElementById('moneyDisplay').textContent = formatNumber(gameState.money);
        document.getElementById('swordLevel').textContent = gameState.swordLevel;
        document.getElementById('displayLevel').textContent = `+${gameState.swordLevel}`;
        document.getElementById('cumulativeCost').textContent = formatNumber(gameState.cumulativeCost);
        document.getElementById('rouletteGold').textContent = formatNumber(gameState.gold);
        updateEnhanceInfo();
    }
}

// 강화 정보 업데이트
function updateEnhanceInfo() {
    const rate = document.getElementById('successRate');
    if (!rate) return;
    
    if (gameState.swordLevel >= 30) {
        document.getElementById('successRate').textContent = '완료';
        document.getElementById('maintainRate').textContent = '-';
        document.getElementById('breakRate').textContent = '-';
        document.getElementById('costAmount').textContent = '-';
    } else {
        const data = ENHANCEMENT_DATA[gameState.swordLevel];
        document.getElementById('successRate').textContent = `${data.success}%`;
        document.getElementById('maintainRate').textContent = `${data.maintain}%`;
        document.getElementById('breakRate').textContent = `${data.break}%`;
        document.getElementById('costAmount').textContent = formatNumber(data.cost);
    }
}

// Supabase에 플레이어 상태 저장
async function updatePlayerStatsDB(userId) {
    try {
        const { error } = await CONFIG.supabase
            .from('player_stats')
            .upsert({
                user_id: userId,
                sword_level: gameState.swordLevel,
                gold: gameState.gold,
                money: gameState.money,
                cumulative_cost: gameState.cumulativeCost,
                last_updated: new Date()
            }, { onConflict: 'user_id' });
        
        if (error) throw error;
    } catch (error) {
        console.error('Supabase 저장 실패:', error);
    }
}

// Supabase에서 플레이어 상태 로드
async function loadPlayerStatsDB(userId) {
    try {
        const { data, error } = await CONFIG.supabase
            .from('player_stats')
            .select('*')
            .eq('user_id', userId)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
            gameState.swordLevel = data.sword_level || 0;
            gameState.gold = data.gold || 1000000;
            gameState.money = data.money || 0;
            gameState.cumulativeCost = data.cumulative_cost || 0;
            gameState.save();
        }
    } catch (error) {
        console.error('Supabase 로드 실패:', error);
    }
}

// === 회원가입 ===
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signupEmail').value;
        const username = document.getElementById('signupUsername').value;
        const password = document.getElementById('signupPassword').value;
        const confirm = document.getElementById('signupPasswordConfirm').value;

        // 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showAuthMessage('올바른 이메일 형식을 입력하세요.', 'error');
            return;
        }

        if (password !== confirm) {
            showAuthMessage('비밀번호가 일치하지 않습니다.', 'error');
            return;
        }

        if (password.length < 8) {
            showAuthMessage('비밀번호는 8자 이상이어야 합니다.', 'error');
            return;
        }

        try {
            // 로컬에만 저장 (Supabase rate limit 회피)
            const userId = 'user_' + Date.now();
            localStorage.setItem('user_id', userId);
            localStorage.setItem('username', username);
            localStorage.setItem('email', email);
            localStorage.setItem('password', password);
            
            // Supabase에 저장 (배경)
            CONFIG.supabase.from('player_stats').insert({
                user_id: userId,
                email: email,
                username: username,
                sword_level: 0,
                gold: 1000000,
                money: 0,
                cumulative_cost: 0
            }).then(() => console.log('Supabase 저장됨')).catch(err => console.log('Supabase 저장:', err));

            showAuthMessage('회원가입 성공! 게임 시작합니다.', 'success');
            
            setTimeout(() => {
                gameState.load();
                document.getElementById('playerName').textContent = username;
                updateUI();
                showPage('gamePage');
            }, 1500);

        } catch (error) {
            showAuthMessage('회원가입 실패: ' + error.message, 'error');
        }
    });
}

// === 로그인 ===
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showAuthMessage('올바른 이메일 형식을 입력하세요.', 'error');
            return;
        }

        if (password.length < 8) {
            showAuthMessage('비밀번호는 8자 이상이어야 합니다.', 'error');
            return;
        }

        try {
            // 로컬스토리지에서 조회
            const storedEmail = localStorage.getItem('email');
            const storedPassword = localStorage.getItem('password');
            const storedUserId = localStorage.getItem('user_id');

            if (email === storedEmail && password === storedPassword && storedUserId) {
                const username = localStorage.getItem('username');
                
                // 게임 상태 로드
                await loadPlayerStatsDB(storedUserId);
                
                document.getElementById('playerName').textContent = username;
                updateUI();
                showPage('gamePage');
            } else {
                showAuthMessage('이메일 또는 비밀번호가 일치하지 않습니다.', 'error');
            }
        } catch (error) {
            showAuthMessage('로그인 실패: ' + error.message, 'error');
        }
    });
}

// === 로그아웃 ===
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        await CONFIG.supabase.auth.signOut();
        localStorage.removeItem('user_id');
        localStorage.removeItem('username');
        
        gameState.swordLevel = 0;
        gameState.gold = 0;
        gameState.money = 0;
        gameState.cumulativeCost = 0;
        
        const loginEmail = document.getElementById('loginEmail');
        const loginPassword = document.getElementById('loginPassword');
        if (loginEmail) loginEmail.value = '';
        if (loginPassword) loginPassword.value = '';
        
        switchTab('login');
        showPage('authPage');
    });
}

// === 강화 ===
const enhanceBtn = document.getElementById('enhanceBtn');
if (enhanceBtn) {
    enhanceBtn.addEventListener('click', async () => {
        const result = gameState.attemptEnhance();
        const resultMessage = document.getElementById('resultMessage');
        const resultText = document.getElementById('resultText');
        
        resultMessage.className = 'result-message ' + result.result;
        resultText.textContent = result.message;
        resultMessage.style.display = 'block';
        
        updateUI();
        
        const userId = localStorage.getItem('user_id');
        if (userId) await updatePlayerStatsDB(userId);
        
        setTimeout(() => resultMessage.style.display = 'none', 3000);
    });
}

// === 판매 ===
const sellBtn = document.getElementById('sellBtn');
if (sellBtn) {
    sellBtn.addEventListener('click', async () => {
        const result = gameState.sellSword();
        alert(result.message);
        updateUI();
        
        const userId = localStorage.getItem('user_id');
        if (userId) await updatePlayerStatsDB(userId);
    });
}

// === 보관 ===
const storeBtn = document.getElementById('storeBtn');
if (storeBtn) {
    storeBtn.addEventListener('click', async () => {
        if (gameState.swordLevel === 0) {
            alert('보관할 검이 없습니다!');
            return;
        }
        
        const userId = localStorage.getItem('user_id');
        try {
            await CONFIG.supabase.from('inventory').insert({
                user_id: userId,
                sword_level: gameState.swordLevel,
                sword_name: '검',
                rarity: 'common'
            });
            alert(`+${gameState.swordLevel} 검을 보관했습니다!`);
        } catch (error) {
            alert('보관 실패: ' + error.message);
        }
    });
}

// === 메뉴 버튼 ===
const rankingBtn = document.getElementById('rankingBtn');
if (rankingBtn) rankingBtn.addEventListener('click', () => {
    updateRankingDisplay();
    showPage('rankingPage');
});

const upgradeBtn = document.getElementById('upgradeBtn');
if (upgradeBtn) upgradeBtn.addEventListener('click', () => {
    showPage('upgradePage');
    updateUI();
});

const rouletteBtn = document.getElementById('rouletteBtn');
if (rouletteBtn) rouletteBtn.addEventListener('click', () => {
    showPage('roulettePage');
    updateUI();
});

const checkBtn = document.getElementById('checkBtn');
if (checkBtn) checkBtn.addEventListener('click', () => alert('준비 중입니다!'));

const battleBtn = document.getElementById('battleBtn');
if (battleBtn) battleBtn.addEventListener('click', () => alert('준비 중입니다!'));

const gmBtn = document.getElementById('gmBtn');
if (gmBtn) gmBtn.addEventListener('click', () => {
    const pwd = prompt('GM 비밀번호:');
    if (pwd === 'admin') {
        gameState.addGold(1000000);
        updateUI();
    }
});

const inventoryBtn = document.getElementById('inventoryBtn');
if (inventoryBtn) inventoryBtn.addEventListener('click', () => showPage('inventoryPage'));

const equipBtn = document.getElementById('equipBtn');
if (equipBtn) equipBtn.addEventListener('click', () => alert('준비 중입니다!'));

// === 뒤로가기 ===
['backFromUpgrade', 'backFromRoulette', 'backFromRanking', 'backFromInventory'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => showPage('gamePage'));
});

// === 룰렛 ===
const spinBtn = document.getElementById('spinBtn');
if (spinBtn) {
    spinBtn.addEventListener('click', async () => {
        const betAmount = parseInt(document.getElementById('betAmount').value) || 0;
        
        if (betAmount <= 0) {
            alert('베팅 금액을 입력하세요.');
            return;
        }
        
        if (gameState.gold < betAmount) {
            alert('골드가 부족합니다!');
            return;
        }

        spinBtn.disabled = true;
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

        setTimeout(async () => {
            const resultDiv = document.getElementById('rouletteResult');
            document.getElementById('resultText').textContent = spinResult.message;
            document.getElementById('resultAmount').textContent = 
                spinResult.winAmount > 0 ? `획득: +${formatNumber(spinResult.winAmount)}G` : '';
            resultDiv.style.display = 'block';
            
            updateUI();
            
            const userId = localStorage.getItem('user_id');
            if (userId) await updatePlayerStatsDB(userId);
            
            spinBtn.disabled = false;
            document.getElementById('betAmount').value = '';
            
            setTimeout(() => resultDiv.style.display = 'none', 3000);
        }, 3000);
    });
}

// === 빠른 베팅 ===
document.querySelectorAll('.quick-bet').forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById('betAmount').value = btn.dataset.amount;
    });
});

// === 랭킹 표시 ===
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

// === 초기화 ===
document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('user_id');
    const username = localStorage.getItem('username');
    
    if (userId && username) {
        loadPlayerStatsDB(userId).then(() => {
            document.getElementById('playerName').textContent = username;
            updateUI();
            showPage('gamePage');
        });
    } else {
        showPage('authPage');
    }
});
