// 숫자 포맷
function formatNumber(num) {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toString();
}

// 랭킹 로드
async function loadRanking() {
    try {
        const { data, error } = await CONFIG.supabase
            .from('users')
            .select('id, username, gold, sword_level')
            .order('gold', { ascending: false })
            .limit(100);

        if (error) throw error;

        const list = document.getElementById('rankingList');
        list.innerHTML = '';

        data.forEach((user, idx) => {
            const div = document.createElement('div');
            div.className = 'ranking-item';
            if (idx === 0) div.classList.add('rank-1');
            else if (idx === 1) div.classList.add('rank-2');
            else if (idx === 2) div.classList.add('rank-3');

            const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`;
            
            div.innerHTML = `
                <div class="rank-num">${medal}</div>
                <div class="rank-info">
                    <div class="rank-name">${user.username}</div>
                    <div class="rank-level">+${user.sword_level}</div>
                </div>
                <div class="rank-gold">${formatNumber(user.gold)}G</div>
            `;
            list.appendChild(div);
        });
    } catch (error) {
        console.error('랭킹 로드 실패:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadRanking);
