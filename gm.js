// GM 비밀번호 (Supabase에 저장되어야 함 - 테스트용)
const GM_PASSWORD = 'admin1234';

// GM 로그인
function gmLogin() {
    const password = document.getElementById('gmPassword').value;

    if (password === GM_PASSWORD) {
        localStorage.setItem('gmLoggedIn', 'true');
        document.getElementById('gmLogin').style.display = 'none';
        document.getElementById('gmMenu').style.display = 'block';
        showMsg('GM 로그인 성공!', 'success');
    } else {
        showMsg('비밀번호가 일치하지 않습니다.', 'error');
    }
}

// GM 로그아웃
function gmLogout() {
    localStorage.removeItem('gmLoggedIn');
    document.getElementById('gmLogin').style.display = 'block';
    document.getElementById('gmMenu').style.display = 'none';
    document.getElementById('gmPassword').value = '';
    showMsg('로그아웃되었습니다.', 'success');
}

// 골드 추가
function addGold() {
    const amount = prompt('추가할 골드 양: ');
    if (!amount) return;

    const gameState = JSON.parse(localStorage.getItem('gameState') || '{}');
    gameState.gold = (gameState.gold || 1000000) + parseInt(amount);
    localStorage.setItem('gameState', JSON.stringify(gameState));

    showMsg(`${amount}G 추가되었습니다!`, 'success');
    updatePlayerStats();
}

// 머니 추가
function addMoney() {
    const amount = prompt('추가할 머니 양: ');
    if (!amount) return;

    const gameState = JSON.parse(localStorage.getItem('gameState') || '{}');
    gameState.money = (gameState.money || 0) + parseInt(amount);
    localStorage.setItem('gameState', JSON.stringify(gameState));

    showMsg(`${amount}M 추가되었습니다!`, 'success');
    updatePlayerStats();
}

// 검 레벨 설정
function setSwordLevel() {
    const level = prompt('설정할 검 레벨 (+0 ~ +30): ');
    if (!level) return;

    const levelNum = parseInt(level);
    if (levelNum < 0 || levelNum > 30) {
        showMsg('0 ~ 30 사이의 값을 입력하세요.', 'error');
        return;
    }

    const gameState = JSON.parse(localStorage.getItem('gameState') || '{}');
    gameState.swordLevel = levelNum;
    localStorage.setItem('gameState', JSON.stringify(gameState));

    showMsg(`검 레벨이 +${level}로 설정되었습니다!`, 'success');
    updatePlayerStats();
}

// 플레이어 초기화
function resetPlayer() {
    if (!confirm('정말 초기화하시겠습니까? 이 작업은 취소할 수 없습니다.')) return;

    const gameState = {
        swordLevel: 0,
        gold: 1000000,
        money: 0,
        cumulativeCost: 0
    };

    localStorage.setItem('gameState', JSON.stringify(gameState));
    showMsg('플레이어가 초기화되었습니다.', 'success');
    updatePlayerStats();
}

// 메시지 표시
function showMsg(text, type) {
    const msg = document.getElementById('gmMsg');
    msg.textContent = text;
    msg.className = `msg ${type}`;
    setTimeout(() => msg.className = 'msg', 3000);
}

// Supabase 업데이트
async function updatePlayerStats() {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        const gameState = JSON.parse(localStorage.getItem('gameState') || '{}');

        await CONFIG.supabase
            .from('users')
            .update({
                gold: gameState.gold || 1000000,
                money: gameState.money || 0,
                sword_level: gameState.swordLevel || 0
            })
            .eq('id', userId);
    } catch (error) {
        console.error('업데이트 실패:', error);
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('gmLoggedIn') === 'true';
    
    if (isLoggedIn) {
        document.getElementById('gmLogin').style.display = 'none';
        document.getElementById('gmMenu').style.display = 'block';
    }
});
