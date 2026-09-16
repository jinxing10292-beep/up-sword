// 인벤토리 상태
const inventory = {
    protectScroll: 0,
    enhanceScroll: 0,
    storedSwords: [],

    load() {
        const data = JSON.parse(localStorage.getItem('inventory') || '{}');
        this.protectScroll = data.protectScroll || 0;
        this.enhanceScroll = data.enhanceScroll || 0;
        this.storedSwords = data.storedSwords || [];
    },

    save() {
        localStorage.setItem('inventory', JSON.stringify(this));
    }
};

// 탭 전환
function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
    
    document.getElementById(tab).classList.add('active');
    event.target.classList.add('active');

    if (tab === 'items') loadItems();
    else loadStorage();
}

// 보유 아이템 로드
function loadItems() {
    const list = document.getElementById('itemsList');
    list.innerHTML = '';

    const items = [
        { id: 'protect', name: '파괴방지권', description: '강화 실패 시 파괴 대신 유지', count: inventory.protectScroll },
        { id: 'enhance', name: '강화권', description: '강화 시 성공확률 +10%', count: inventory.enhanceScroll }
    ];

    items.forEach(item => {
        if (item.count > 0) {
            const div = document.createElement('div');
            div.className = 'inventory-item';
            div.innerHTML = `
                <div class="item-info">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <p style="color: #667eea; font-weight: 700;">보유: ${item.count}개</p>
                </div>
                <div class="item-action">
                    <button class="item-btn" onclick="useItem('${item.id}')">사용</button>
                </div>
            `;
            list.appendChild(div);
        }
    });

    if (list.children.length === 0) {
        list.innerHTML = '<div class="empty-message">보유한 아이템이 없습니다.</div>';
    }
}

// 보관함 로드
function loadStorage() {
    const list = document.getElementById('storageList');
    list.innerHTML = '';

    if (!inventory.storedSwords || inventory.storedSwords.length === 0) {
        list.innerHTML = '<div class="empty-message">보관된 검이 없습니다.</div>';
        return;
    }

    inventory.storedSwords.forEach((sword, idx) => {
        const div = document.createElement('div');
        div.className = 'inventory-item';
        const sellPrice = sword.sellPrice || 0;
        
        div.innerHTML = `
            <div class="item-info">
                <h3>보관된 검 #${idx + 1}</h3>
                <p>+${sword.level || 0} 검</p>
                <p style="color: #7b5bd6; font-weight: 700;">판매가: ${formatNumber(sellPrice)}</p>
            </div>
            <div class="item-action">
                <button class="item-btn" onclick="retrieveSword(${idx})">회수</button>
            </div>
        `;
        list.appendChild(div);
    });
}

// 아이템 사용
function useItem(itemId) {
    if (itemId === 'protect') {
        inventory.protectScroll = Math.max(0, inventory.protectScroll - 1);
        alert('파괴방지권을 사용했습니다!');
    } else if (itemId === 'enhance') {
        inventory.enhanceScroll = Math.max(0, inventory.enhanceScroll - 1);
        alert('강화권을 사용했습니다!');
    }
    inventory.save();
    loadItems();
}

// 검 회수
function retrieveSword(idx) {
    const sword = inventory.storedSwords[idx];
    inventory.storedSwords.splice(idx, 1);
    inventory.save();
    
    alert(`+${sword.level} 검을 회수했습니다!`);
    loadStorage();
}

// 숫자 포맷
function formatNumber(num) {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toString();
}

document.addEventListener('DOMContentLoaded', () => {
    inventory.load();
    loadItems();
});
