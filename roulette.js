// 게임 상태
const gameState = {
    gold: 1000000,
    betType: 'odd',

    load() {
        const data = JSON.parse(localStorage.getItem('gameState') || '{}');
        this.gold = data.gold || 1000000;
    },

    save() {
        localStorage.setItem('gameState', JSON.stringify(this));
    }
};

// 룰렛 칸 (1-50, 빨강/하양, 홀수/짝수)
const ROULETTE_NUMBERS = [];
for (let i = 1; i <= 50; i++) {
    ROULETTE_NUMBERS.push({
        number: i,
        color: i % 2 === 1 ? 'red' : 'white',
        parity: i % 2 === 1 ? 'odd' : 'even'
    });
}

function formatNumber(num) {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return Math.floor(num).toString();
}

// UI 업데이트
function updateUI() {
    document.getElementById('currentGold').textContent = `보유 골드: ${formatNumber(gameState.gold)}G`;
}

// 배팅 타입 선택
function selectBetType(type) {
    gameState.betType = type;
    document.querySelectorAll('.bet-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-type="${type}"]`).classList.add('active');
}

// 스핀 실행
document.getElementById('spinBtn').addEventListener('click', async () => {
    const betAmount = parseInt(document.getElementById('betAmount').value) || 0;
    const spinBtn = document.getElementById('spinBtn');

    if (betAmount <= 0) {
        alert('베팅 금액을 입력하세요.');
        return;
    }

    if (gameState.gold < betAmount) {
        alert('골드가 부족합니다!');
        return;
    }

    spinBtn.disabled = true;

    // 배경 비용 차감
    gameState.gold -= betAmount;
    updateUI();

    // 룰렛 스핀
    const wheel = document.getElementById('rouletteWheel');
    const spinIndex = Math.floor(Math.random() * 50);
    const resultNumber = ROULETTE_NUMBERS[spinIndex];

    wheel.style.transition = 'none';
    wheel.style.transform = 'rotate(0deg)';
    void wheel.offsetWidth;

    const rotations = 5 + Math.random() * 3;
    const anglePerSegment = 360 / 50;
    const finalAngle = rotations * 360 + spinIndex * anglePerSegment + Math.random() * anglePerSegment;

    wheel.style.transition = `transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    wheel.style.transform = `rotate(${finalAngle}deg)`;

    setTimeout(() => {
        // 배팅 결과 판정
        let isWin = false;
        
        if (gameState.betType === 'odd' && resultNumber.parity === 'odd') isWin = true;
        if (gameState.betType === 'even' && resultNumber.parity === 'even') isWin = true;
        if (gameState.betType === 'red' && resultNumber.color === 'red') isWin = true;
        if (gameState.betType === 'white' && resultNumber.color === 'white') isWin = true;

        const winAmount = isWin ? betAmount * 2 : 0;
        gameState.gold += winAmount;
        gameState.save();
        updateUI();

        // 결과 표시
        const resultDisplay = document.getElementById('resultDisplay');
        document.getElementById('resultTitle').textContent = isWin ? '🎉 승리!' : '💔 패배';
        document.getElementById('resultAmount').textContent = `${isWin ? '+' : '-'}${formatNumber(betAmount)}G`;
        document.getElementById('resultStatus').textContent = `숫자: ${resultNumber.number} (${resultNumber.color === 'red' ? '빨강' : '하양'} / ${resultNumber.parity === 'odd' ? '홀수' : '짝수'})\n현재 골드: ${formatNumber(gameState.gold)}G`;
        resultDisplay.classList.add('show');

        setTimeout(() => resultDisplay.classList.remove('show'), 3000);

        spinBtn.disabled = false;

        // Supabase 업데이트
        updatePlayerStats();
    }, 3000);
});

// Supabase 업데이트
async function updatePlayerStats() {
    try {
        const userId = localStorage.getItem('userId');
        const isGuest = localStorage.getItem('isGuest') === 'true';
        
        if (!userId || isGuest) return;

        await CONFIG.supabase
            .from('users')
            .update({ gold: gameState.gold })
            .eq('id', userId);
    } catch (error) {
        console.error('업데이트 실패:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    gameState.load();
    updateUI();
});
