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
        try {
            const data = JSON.parse(localStorage.getItem('gameState') || '{}');
            this.swordLevel = data.swordLevel || 0;
            this.gold = data.gold || 1000000;
            this.money = data.money || 0;
            this.cumulativeCost = data.cumulativeCost || 0;
        } catch (error) {
            console.warn('게임 상태 로드 실패:', error);
            this.swordLevel = 0;
            this.gold = 1000000;
            this.money = 0;
            this.cumulativeCost = 0;
        }
    },

    updateRanking() {
        try {
            return JSON.parse(localStorage.getItem('rankings') || '[]');
        } catch (error) {
            return [];
        }
    }
};

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

function formatNumber(num) {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toString();
}

function updateUI() {
    const goldEl = document.querySelector('.stat-box .gold');
    const moneyEl = document.querySelector('.stat-box .money');

    if (goldEl) {
        goldEl.textContent = formatNumber(gameState.gold);
    }
    if (moneyEl) {
        moneyEl.textContent = formatNumber(gameState.money);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');

    if (userId && username) {
        gameState.userId = userId;
        gameState.username = username;
        gameState.load();
        updateUI();

        const greeting = document.querySelector('.greeting');
        if (greeting) {
            greeting.innerHTML = `${username}님<br>안녕하세요!`;
        }

        const topUsername = document.getElementById('topUsername');
        if (topUsername) {
            topUsername.textContent = username;
        }
    } else {
        window.location.href = 'auth.html';
    }

    const rankingModal = document.getElementById('rankingModal');
    const closeRankingBtn = document.getElementById('closeRankingBtn');

    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            if (action === 'ranking') {
                if (rankingModal) {
                    rankingModal.classList.add('visible');
                    rankingModal.setAttribute('aria-hidden', 'false');
                }
                return;
            }

            if (action === 'attendance') {
                window.location.href = 'attendance.html';
                return;
            }
            if (action === 'shop') {
                window.location.href = 'shop.html';
                return;
            }
            if (action === 'inventory') {
                window.location.href = 'inventory.html';
                return;
            }
            if (action === 'achievement') {
                window.location.href = 'achievements.html';
                return;
            }
            if (action === 'sword') {
                window.location.href = 'game.html';
                return;
            }

            console.log('버튼 클릭:', btn.textContent);
        });
    });

    if (closeRankingBtn && rankingModal) {
        closeRankingBtn.addEventListener('click', () => {
            rankingModal.classList.remove('visible');
            rankingModal.setAttribute('aria-hidden', 'true');
        });

        rankingModal.addEventListener('click', (event) => {
            if (event.target === rankingModal) {
                rankingModal.classList.remove('visible');
                rankingModal.setAttribute('aria-hidden', 'true');
            }
        });
    }

    const promo = document.querySelector('.promo-card.sword-card');
    if (promo) {
        promo.style.cursor = 'pointer';
        promo.addEventListener('click', () => {
            window.location.href = 'game.html';
        });
    }

    const roulette = document.querySelector('.promo-card.roulette-card');
    if (roulette) {
        roulette.style.cursor = 'pointer';
        roulette.addEventListener('click', (event) => {
            event.preventDefault();
            alert('준비 중인 기능입니다.');
        });
    }
});
