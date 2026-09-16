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

// 판매가 테이블
const SELL_PRICE_TABLE = [
    0, 60, 407, 1216, 3509, 6743, 12831, 21943, 37777, 60599,
    97038, 171053, 295686, 575604, 1127042, 2158839, 4059395, 7493960, 14026316, 29729641,
    63716305, 151432796, 434968926, 1459524120, 6259813029, 35461774437, 249598994570, 2389256699496, 40245562247397, 1281973974860861,
    147444191973261585
];

// 게임 상태
const gameState = {
    swordLevel: 0,
    gold: 1000000,
    cumulativeCost: 0,
    protectScroll: 0,

    load() {
        const data = JSON.parse(localStorage.getItem('gameState') || '{}');
        this.swordLevel = data.swordLevel || 0;
        this.gold = data.gold || 1000000;
        this.cumulativeCost = data.cumulativeCost || 0;
        this.protectScroll = data.protectScroll || 0;
    },

    save() {
        localStorage.setItem('gameState', JSON.stringify(this));
    }
};

// 인벤토리
const inventory = {
    storedSwords: [],

    load() {
        const data = JSON.parse(localStorage.getItem('inventory') || '{}');
        this.storedSwords = data.storedSwords || [];
    },

    save() {
        localStorage.setItem('inventory', JSON.stringify(this));
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
    if (level >= 30) {
        document.getElementById('displayLevel').textContent = '+30 (완료)';
        document.getElementById('enhanceBtn').disabled = true;
        document.getElementById('enhanceBtn').textContent = '완료';
    } else {
        document.getElementById('displayLevel').textContent = `+${level}`;
        const enhancement = ENHANCEMENT_TABLE[level];
        document.getElementById('costAmount').textContent = formatNumber(enhancement.cost) + 'G';
        document.getElementById('successRate').textContent = `${enhancement.success}%`;

        // 판매가 (sell-price.md 적용)
        const sellPrice = SELL_PRICE_TABLE[level];
        document.getElementById('sellPrice').textContent = formatNumber(sellPrice) + 'G';

        // 강화 버튼 활성화
        const canEnhance = gameState.gold >= enhancement.cost;
        document.getElementById('enhanceBtn').disabled = !canEnhance;
        document.getElementById('enhanceBtn').textContent = canEnhance ? '강화하기' : '골드 부족';
    }
}

// 강화하기
function enhanceSword() {
    const level = gameState.swordLevel;
    if (level >= 30) return;

    const enhancement = ENHANCEMENT_TABLE[level];
    if (gameState.gold < enhancement.cost) {
        showResult('error', '골드 부족', '필요한 골드보다 적습니다.');
        return;
    }

    // 비용 차감
    gameState.gold -= enhancement.cost;
    gameState.cumulativeCost += enhancement.cost;

    // 확률 계산
    const rand = Math.random() * 100;
    let result;

    if (rand < enhancement.success) {
        gameState.swordLevel++;
        result = 'success';
    } else if (rand < enhancement.success + enhancement.maintain) {
        result = 'maintain';
    } else {
        // 파괴 처리
        if (gameState.protectScroll > 0) {
            gameState.protectScroll--;
            result = 'protect';
        } else {
            gameState.swordLevel = Math.max(0, gameState.swordLevel - 1);
            result = 'break';
        }
    }

    gameState.save();
    updateUI();
    updatePlayerStats();

    // 결과 표시
    switch (result) {
        case 'success':
            showResult('success', '⭐ 성공!', `+${level + 1}로 강화되었습니다!`);
            break;
        case 'maintain':
            showResult('maintain', '⚪ 유지', `강화가 유지되었습니다.`);
            break;
        case 'protect':
            showResult('protect', '🛡️ 방지됨', `파괴방지권으로 보호되었습니다!`);
            break;
        case 'break':
            showResult('break', '💥 파괴', `강화가 파괴되어 +${gameState.swordLevel}로 내려갔습니다.`);
            break;
    }
}

// 보관하기
function storeSword() {
    if (gameState.swordLevel === 0) {
        showResult('error', '알림', '보관할 검이 없습니다.');
        return;
    }

    const sellPrice = SELL_PRICE_TABLE[gameState.swordLevel];

    inventory.storedSwords.push({
        level: gameState.swordLevel,
        sellPrice: sellPrice
    });

    gameState.swordLevel = 0;
    gameState.cumulativeCost = 0;
    gameState.save();
    inventory.save();
    updateUI();

    showResult('protect', '✅ 보관됨', `+${inventory.storedSwords[inventory.storedSwords.length - 1].level} 검이 보관되었습니다.`);
}

// 폭죽 애니메이션
function showConfetti(type) {
    const modal = document.getElementById('resultModal');
    const content = document.getElementById('resultContent');
    
    // 모달 내용 설정
    const icons = {
        success: '⭐',
        maintain: '⚪',
        protect: '🛡️',
        break: '💥'
    };
    
    content.className = `result-content ${type}`;
    content.innerHTML = `<div style="font-size: 60px; animation: bounce 0.8s infinite;">${icons[type] || '⭐'}</div>`;
    
    modal.classList.add('show');
    setTimeout(() => modal.classList.remove('show'), 800);
}

// 결과 표시
function showResult(type, title, detail) {
    const modal = document.getElementById('resultModal');
    const content = document.getElementById('resultContent');
    const icon = document.getElementById('resultIcon');
    const text = document.getElementById('resultText');
    const detailEl = document.getElementById('resultDetail');

    content.className = `result-content ${type}`;
    icon.textContent = title.split(' ')[0];
    text.textContent = title.split(' ').slice(1).join(' ');
    detailEl.textContent = detail;

    modal.classList.add('show');
    setTimeout(() => modal.classList.remove('show'), 1200);
}

// Supabase 업데이트
async function updatePlayerStats() {
    try {
        const userId = localStorage.getItem('userId');
        const isGuest = localStorage.getItem('isGuest') === 'true';
        
        if (!userId || isGuest) return;

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
    inventory.load();
    updateUI();
});
