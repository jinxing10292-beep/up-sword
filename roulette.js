// 게임 상태
const gameState = {
    gold: 1000000,

    load() {
        const data = JSON.parse(localStorage.getItem('gameState') || '{}');
        this.gold = data.gold || 1000000;
    },

    save() {
        localStorage.setItem('gameState', JSON.stringify(this));
    }
};

// 룰렛 배율 (1-46)
const ROULETTE_MULTIPLIERS = [
    2, 3, 1.5, 4, 0.5, 5, 1, 6, 0.2, 10,
    2.5, 3.5, 1.2, 7, 0.8, 8, 1.5, 9, 0.3, 15,
    3, 4, 2, 5, 1, 11, 2.2, 3.5, 1.8, 12,
    2.8, 3.2, 2.5, 6, 1.2, 13, 3.5, 2.5, 1.5, 14,
    2.2, 2.8, 2, 7, 1.3, 20
];

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

// 베팅 설정
function setBet(amount) {
    document.getElementById('betAmount').value = amount;
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
    const spinIndex = Math.floor(Math.random() * 46);
    const multiplier = ROULETTE_MULTIPLIERS[spinIndex];

    wheel.style.transition = 'none';
    wheel.style.transform = 'rotate(0deg)';
    void wheel.offsetWidth;

    const rotations = 5 + Math.random() * 3;
    const anglePerSegment = 360 / 46;
    const finalAngle = rotations * 360 + spinIndex * anglePerSegment + Math.random() * anglePerSegment;

    wheel.style.transition = `transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    wheel.style.transform = `rotate(${finalAngle}deg)`;

    setTimeout(() => {
        const winAmount = Math.floor(betAmount * multiplier);
        const isWin = multiplier >= 2;

        gameState.gold += winAmount;
        gameState.save();
        updateUI();

        // 결과 표시
        const resultDisplay = document.getElementById('resultDisplay');
        document.getElementById('resultTitle').textContent = isWin ? '🎉 승리!' : '💔 패배';
        document.getElementById('resultAmount').textContent = `${isWin ? '+' : ''}${formatNumber(winAmount)}G (배율: ${multiplier}x)`;
        document.getElementById('resultStatus').textContent = `현재 골드: ${formatNumber(gameState.gold)}G`;
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
        
        if (!userId || isGuest) return; // 게스트는 저장 안 함

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
