// 강화 데이터
const ENHANCEMENT_TABLE = [
    { success: 100, maintain: 0, break: 0, cost: 100 },
    { success: 95, maintain: 5, break: 0, cost: 500 },
    { success: 90, maintain: 10, break: 0, cost: 1000 },
    { success: 85, maintain: 15, break: 0, cost: 2500 },
    { success: 80, maintain: 20, break: 0, cost: 3000 },
    { success: 75, maintain: 25, break: 0, cost: 5000 },
    { success: 70, maintain: 30, break: 0, cost: 6500 },
    { success: 65, maintain: 35, break: 0, cost: 10000 },
    { success: 60, maintain: 40, break: 0, cost: 12500 },
    { success: 55, maintain: 45, break: 0, cost: 17500 },
    { success: 50, maintain: 45, break: 5, cost: 20000 },
    { success: 47, maintain: 47, break: 6, cost: 25000 },
    { success: 44, maintain: 49, break: 7, cost: 50000 },
    { success: 41, maintain: 51, break: 8, cost: 75000 },
    { success: 38, maintain: 53, break: 9, cost: 100000 },
    { success: 35, maintain: 55, break: 10, cost: 125000 },
    { success: 33, maintain: 56, break: 11, cost: 150000 },
    { success: 31, maintain: 57, break: 12, cost: 200000 },
    { success: 29, maintain: 58, break: 13, cost: 500000 },
    { success: 27, maintain: 59, break: 14, cost: 750000 },
    { success: 25, maintain: 55, break: 20, cost: 1000000 },
    { success: 21, maintain: 54, break: 25, cost: 2000000 },
    { success: 18, maintain: 52, break: 30, cost: 3500000 },
    { success: 14, maintain: 50, break: 36, cost: 5000000 },
    { success: 11, maintain: 47, break: 42, cost: 10000000 },
    { success: 10, maintain: 40, break: 50, cost: 50000000 },
    { success: 8, maintain: 34, break: 58, cost: 150000000 },
    { success: 5, maintain: 27, break: 68, cost: 500000000 },
    { success: 3, maintain: 17, break: 80, cost: 3000000000 },
    { success: 1, maintain: 0, break: 99, cost: 10000000000 }
];

// 게임 상태
const gameState = {
    swordLevel: 0,
    gold: 1000000,
    cumulativeCost: 0,
    protectScroll: 0,
    enhanceScroll: 0,

    load() {
        const data = JSON.parse(localStorage.getItem('gameState') || '{}');
        this.swordLevel = data.swordLevel || 0;
        this.gold = data.gold || 1000000;
        this.cumulativeCost = data.cumulativeCost || 0;
        this.protectScroll = data.protectScroll || 0;
        this.enhanceScroll = data.enhanceScroll || 0;
    },

    save() {
        localStorage.setItem('gameState', JSON.stringify(this));
    }
};

function formatNumber(num) {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toString();
}

// UI 업데이트
function updateUI() {
    const level = gameState.swordLevel;
    const enhancement = ENHANCEMENT_TABLE[Math.min(level, 29)];

    document.getElementById('displayLevel').textContent = `+${level}`;
    document.getElementById('currentLevel').textContent = `+${level}`;
    document.getElementById('cumulativeCost').textContent = formatNumber(gameState.cumulativeCost);
    document.getElementById('currentGold').textContent = formatNumber(gameState.gold);
    document.getElementById('successRate').textContent = `${enhancement.success}%`;
    document.getElementById('maintainRate').textContent = `${enhancement.maintain}%`;
    document.getElementById('breakRate').textContent = `${enhancement.break}%`;
    document.getElementById('costAmount').textContent = formatNumber(enhancement.cost);

    // 판매가 계산
    if (level >= 13) {
        const sellPrice = gameState.cumulativeCost;
        const profit = sellPrice - gameState.cumulativeCost;
        document.getElementById('sellPrice').textContent = formatNumber(sellPrice);
        document.getElementById('profitLoss').textContent = profit >= 0 ? `+${formatNumber(profit)}` : formatNumber(profit);
    } else {
        document.getElementById('sellPrice').textContent = formatNumber(0);
        document.getElementById('profitLoss').textContent = `-${formatNumber(gameState.cumulativeCost)}`;
    }

    // 강화 버튼 활성화
    const btn = document.getElementById('enhanceBtn');
    if (level >= 30) {
        btn.disabled = true;
        btn.textContent = '최대강화 달성!';
    } else {
        btn.disabled = gameState.gold < enhancement.cost;
        btn.textContent = gameState.gold < enhancement.cost ? '골드 부족' : '강화하기';
    }
}

// 강화 실행
document.getElementById('enhanceBtn').addEventListener('click', async () => {
    const level = gameState.swordLevel;
    if (level >= 30) return;

    const enhancement = ENHANCEMENT_TABLE[level];
    if (gameState.gold < enhancement.cost) {
        alert('골드가 부족합니다!');
        return;
    }

    gameState.gold -= enhancement.cost;
    gameState.cumulativeCost += enhancement.cost;

    const rand = Math.random() * 100;
    let result;

    if (rand < enhancement.success) {
        gameState.swordLevel++;
        result = 'success';
    } else if (rand < enhancement.success + enhancement.maintain) {
        result = 'maintain';
    } else {
        // 파괴 방지권 사용
        if (gameState.protectScroll > 0) {
            gameState.protectScroll--;
            result = 'protect';
        } else {
            gameState.swordLevel = Math.max(0, gameState.swordLevel - 1);
            result = 'break';
        }
    }

    gameState.save();
    await updatePlayerStats();
    updateUI();
    showResult(result);
});

// 결과 표시
function showResult(result) {
    const msg = document.getElementById('resultMessage');
    msg.style.display = 'block';

    switch (result) {
        case 'success':
            msg.textContent = '⭐ 강화 성공!';
            msg.className = 'result-message result-success';
            break;
        case 'maintain':
            msg.textContent = '⚪ 강화 유지';
            msg.className = 'result-message result-maintain';
            break;
        case 'protect':
            msg.textContent = '🛡️ 파괴 방지권 사용! 유지됨';
            msg.className = 'result-message result-maintain';
            break;
        case 'break':
            msg.textContent = '💥 강화 파괴! 레벨 -1';
            msg.className = 'result-message result-break';
            break;
    }

    setTimeout(() => msg.style.display = 'none', 3000);
}

// 판매하기
async function sellSword() {
    const level = gameState.swordLevel;
    if (level === 0) {
        alert('판매할 검이 없습니다.');
        return;
    }

    const sellPrice = level >= 13 ? gameState.cumulativeCost : 0;
    gameState.gold += sellPrice;
    gameState.swordLevel = 0;
    gameState.cumulativeCost = 0;

    gameState.save();
    await updatePlayerStats();
    updateUI();
    alert(`검 판매 완료! +${formatNumber(sellPrice)}G`);
}

// 파괴 방지권 사용
function useProtect() {
    alert('인벤토리에서 사용 가능합니다.');
}

// 강화권 사용
function useScroll() {
    alert('인벤토리에서 사용 가능합니다.');
}

// Supabase 업데이트
async function updatePlayerStats() {
    try {
        const userId = localStorage.getItem('userId');
        const isGuest = localStorage.getItem('isGuest') === 'true';
        
        if (!userId || isGuest) return; // 게스트는 저장 안 함

        await CONFIG.supabase
            .from('users')
            .update({
                sword_level: gameState.swordLevel,
                gold: gameState.gold,
                cumulative_cost: gameState.cumulativeCost
            })
            .eq('id', userId);
    } catch (error) {
        console.error('업데이트 실패:', error);
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    gameState.load();
    updateUI();
});
