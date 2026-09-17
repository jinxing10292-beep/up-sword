const CHECKIN_REWARD = {
    gold: 100000,
    money: 100
};

async function checkAttendanceStatus() {
    try {
        const statusEl = document.getElementById('statusText');
        const btn = document.getElementById('checkInBtn');
        if (!statusEl || !btn) return;

        const lastCheckin = localStorage.getItem('lastCheckin');
        const today = new Date().toDateString();

        if (lastCheckin === today) {
            statusEl.textContent = '오늘 이미 출석했습니다!';
            btn.disabled = true;
            btn.textContent = '완료됨';
        } else {
            statusEl.textContent = '출석 가능합니다!';
            btn.disabled = false;
        }
    } catch (error) {
        console.error('출석 상태 확인 실패:', error);
    }
}

const checkInBtn = document.getElementById('checkInBtn');
if (checkInBtn) {
    checkInBtn.addEventListener('click', async () => {
        try {
            const userId = localStorage.getItem('userId');
            const isGuest = localStorage.getItem('isGuest') === 'true';
            const today = new Date().toDateString();

            if (isGuest) {
                const gameState = JSON.parse(localStorage.getItem('gameState') || '{}');
                gameState.gold = (gameState.gold || 1000000) + CHECKIN_REWARD.gold;
                gameState.money = (gameState.money || 0) + CHECKIN_REWARD.money;
                localStorage.setItem('gameState', JSON.stringify(gameState));

                localStorage.setItem('lastCheckin', today);

                const msg = document.getElementById('attendanceMsg');
                if (msg) {
                    msg.textContent = `출석 완료! +100,000G, +100M`;
                    msg.className = 'msg success';
                }
            } else {
                if (!CONFIG || !CONFIG.supabase || typeof CONFIG.supabase.from !== 'function') {
                    throw new Error('Supabase 연결이 준비되지 않았습니다.');
                }

                const { data: userData, error: fetchError } = await CONFIG.supabase
                    .from('users')
                    .select('gold, money')
                    .eq('id', userId)
                    .single();

                if (fetchError) {
                    console.error('사용자 조회 실패:', fetchError);
                    throw fetchError;
                }

                const newGold = (userData?.gold || 1000000) + CHECKIN_REWARD.gold;
                const newMoney = (userData?.money || 0) + CHECKIN_REWARD.money;

                const { error: updateError } = await CONFIG.supabase
                    .from('users')
                    .update({ gold: newGold, money: newMoney })
                    .eq('id', userId);

                if (updateError) throw updateError;

                const msg = document.getElementById('attendanceMsg');
                if (msg) {
                    msg.textContent = `출석 완료! +100,000G, +100M`;
                    msg.className = 'msg success';
                }
            }

            localStorage.setItem('lastCheckin', today);

            const statusText = document.getElementById('statusText');
            const button = document.getElementById('checkInBtn');

            if (statusText) statusText.textContent = '오늘 이미 출석했습니다!';
            if (button) {
                button.disabled = true;
                button.textContent = '완료됨';
            }
        } catch (error) {
            const msg = document.getElementById('attendanceMsg');
            if (msg) {
                msg.textContent = '출석 실패: ' + (error.message || '알 수 없는 오류');
                msg.className = 'msg error';
            }
            console.error('출석 실패:', error);
        }
    });
}

document.addEventListener('DOMContentLoaded', checkAttendanceStatus);
