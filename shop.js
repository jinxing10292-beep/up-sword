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

// 인벤토리 상태
const inventory = {
    protectScroll: 0,
    enhanceScroll: 0,

    load() {
        const data = JSON.parse(localStorage.getItem('inventory') || '{}');
        this.protectScroll = data.protectScroll || 0;
        this.enhanceScroll = data.enhanceScroll || 0;
    },

    save() {
        localStorage.setItem('inventory', JSON.stringify(this));
    }
};

// 상점 상품
const SHOP_ITEMS = [
    {
        id: 'protect',
        name: '파괴방지권',
        description: '강화 실패 시 파괴 대신 유지',
        price: 500000,
        quantity: 1
    },
    {
        id: 'enhance',
        name: '강화권',
        description: '강화 시 성공확률 +10%',
        price: 300000,
        quantity: 1
    }
];

function formatNumber(num) {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toString();
}

// UI 업데이트
function updateUI() {
    document.getElementById('playerGold').textContent = formatNumber(gameState.gold);
    loadShopItems();
}

// 상점 아이템 로드
function loadShopItems() {
    const container = document.getElementById('shopItems');
    container.innerHTML = '';

    SHOP_ITEMS.forEach(item => {
        const div = document.createElement('div');
        div.className = 'shop-item';
        
        const totalPrice = item.price * item.quantity;
        const canBuy = gameState.gold >= totalPrice;

        div.innerHTML = `
            <div class="item-info">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <div class="item-price">${formatNumber(item.price)}G × <input type="number" class="quantity-input" id="qty-${item.id}" value="1" min="1" max="99" onchange="updateQuantity('${item.id}')"></div>
            </div>
            <div class="item-action">
                <div style="font-size: 12px; font-weight: 700; color: #f5a623;">총 ${formatNumber(totalPrice)}G</div>
                <button class="buy-btn" ${canBuy ? '' : 'disabled'} onclick="buyItem('${item.id}')">구매</button>
            </div>
        `;
        container.appendChild(div);
    });
}

// 수량 업데이트
function updateQuantity(itemId) {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    const qty = parseInt(document.getElementById(`qty-${itemId}`).value) || 1;
    item.quantity = Math.max(1, Math.min(99, qty));
    loadShopItems();
}

// 구매
function buyItem(itemId) {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    const totalPrice = item.price * item.quantity;

    if (gameState.gold < totalPrice) {
        showMsg('골드가 부족합니다!', 'error');
        return;
    }

    gameState.gold -= totalPrice;
    
    if (itemId === 'protect') {
        inventory.protectScroll += item.quantity;
    } else if (itemId === 'enhance') {
        inventory.enhanceScroll += item.quantity;
    }

    gameState.save();
    inventory.save();

    showMsg(`${item.name} ${item.quantity}개를 구매했습니다!`, 'success');
    
    // 수량 초기화
    document.getElementById(`qty-${itemId}`).value = 1;
    item.quantity = 1;

    updateUI();
    updatePlayerStats();
}

// 메시지 표시
function showMsg(text, type) {
    const msg = document.getElementById('shopMsg');
    msg.textContent = text;
    msg.className = `msg ${type}`;
    setTimeout(() => msg.className = 'msg', 3000);
}

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
    inventory.load();
    updateUI();
});
