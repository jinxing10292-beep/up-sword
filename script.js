// ===== 게임 상태 =====
const gameState = {
    swordLevel: 0,
    gold: 1000000,
    money: 0,
    cumulativeCost: 0,
    userId: '',
    username: '',

    save() {
        localStorage.setItem('gameState', JSON.stringify({
            swordLevel: this.swordLevel,
            gold: this.gold,
            money: this.money,
            cumulativeCost: this.cumulativeCost
        }));
    },

    load() {
        const data = JSON.parse(localStorage.getItem('gameState') || '{}');
        this.swordLevel = data.swordLevel || 0;
        this.gold = data.gold || 1000000;
        this.money = data.money || 0;
        this.cumulativeCost = data.cumulativeCost || 0;
    },

    updateRanking() {
        return JSON.parse(localStorage.getItem('rankings') || '[]');
    }
};

// ===== 강화 데이터 =====
const ENHANCEMENT_DATA = {
    0: { success: 100, maintain: 0, break: 0, cost: 100 },
    1: { success: 100, maintain: 0, break: 0, cost: 200 },
    2: { success: 100, maintain: 0, break: 0, cost: 300 },
    3: { success: 100, maintain: 0, break: 0, cost: 500 },
    4: { success: 100, maintain: 0, break: 0, cost: 700 },
    5: { success: 95, maintain: 5, break: 0, cost: 1000 },
    6: { success: 95, maintain: 5, break: 0, cost: 1500 },
    7: { success: 95, maintain: 5, break: 0, cost: 2000 },
    8: { success: 95, maintain: 5, break: 0, cost: 3000 },
    9: { success: 95, maintain: 5, break: 0, cost: 5000 },
    10: { success: 90, maintain: 8, break: 2, cost: 10000 },
    11: { success: 90, maintain: 8, break: 2, cost: 15000 },
    12: { success: 90, maintain: 8, break: 2, cost: 20000 },
    13: { success: 90, maintain: 8, break: 2, cost: 30000 },
    14: { success: 90, maintain: 8, break: 2, cost: 50000 },
    15: { success: 80, maintain: 15, break: 5, cost: 100000 },
    16: { success: 80, maintain: 15, break: 5, cost: 150000 },
    17: { success: 80, maintain: 15, break: 5, cost: 200000 },
    18: { success: 80, maintain: 15, break: 5, cost: 300000 },
    19: { success: 80, maintain: 15, break: 5, cost: 500000 },
    20: { success: 70, maintain: 20, break: 10, cost: 1000000 },
    21: { success: 70, maintain: 20, break: 10, cost: 1500000 },
    22: { success: 70, maintain: 20, break: 10, cost: 2000000 },
    23: { success: 70, maintain: 20, break: 10, cost: 3000000 },
    24: { success: 70, maintain: 20, break: 10, cost: 5000000 },
    25: { success: 60, maintain: 25, break: 15, cost: 10000000 },
    26: { success: 60, maintain: 25, break: 15, cost: 15000000 },
    27: { success: 60, maintain: 25, break: 15, cost: 20000000 },
    28: { success: 60, maintain: 25, break: 15, cost: 30000000 },
    29: { success: 60, maintain: 25, break: 15, cost: 50000000 },
    30: { success: 0, maintain: 0, break: 0, cost: 0 }
};

// ===== 도움 함수 =====
function formatNumber(num) {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toString();
}

// ===== UI 업데이트 =====
function updateUI() {
    const goldEl = document.querySelector('.stat-box .gold');
    const moneyEl = document.querySelector('.stat-box .money');
    
    if (goldEl) {
        goldEl.textContent = formatNumber(gameState.gold);
        moneyEl.textContent = formatNumber(gameState.money);
    }
}

// ===== 초기화 =====
document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    
    if (userId && username) {
        gameState.userId = userId;
        gameState.username = username;
        gameState.load();
        updateUI();
        document.querySelector('.greeting').textContent = `${username}님\n안녕하세요!`;
    }
});
