const CHECKIN_REWARD = {
    gold: 100000,
    money: 100
};

// 출석 상태 확인
async function checkAttendanceStatus() {
    try {
        const userId = localStorage.getItem('userId');
        const lastCheckin = localStorage.getItem('lastCheckin');
        const today = new Date().toDateString();

        const statusEl = document.getElementById('statusText');
        const btn = document.getElementById('checkInBtn');

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

// 출석 체크
document.getElementById('checkInBtn').addEventListener('click', async () => {
    try {
        const userId = localStorage.getItem('userId');
        const today = new Date().toDateString();

        // Supabase 업데이트
        const { data: userData, error: fetchError } = await CONFIG.supabase
            .from('users')
            .select('gold, money')
            .eq('id', userId)
            .single();

        if (fetchError) throw fetchError;

        const newGold = (userData.gold || 0) + CHECKIN_REWARD.gold;
        const newMoney = (userData.money || 0) + CHECKIN_REWARD.money;

        const { error: updateError } = await CONFIG.supabase
            .from('users')
            .update({ gold: newGold, money: newMoney })
            .eq('id', userId);

        if (updateError) throw updateError;

        // 로컬 저장
        localStorage.setItem('lastCheckin', today);

        // 메시지
        const msg = document.getElementById('attendanceMsg');
        msg.textContent = `출석 완료! +100,000G, +100M`;
        msg.className = 'msg success';

        // UI 업데이트
        document.getElementById('statusText').textContent = '오늘 이미 출석했습니다!';
        document.getElementById('checkInBtn').disabled = true;
        document.getElementById('checkInBtn').textContent = '완료됨';

    } catch (error) {
        const msg = document.getElementById('attendanceMsg');
        msg.textContent = '출석 실패: ' + error.message;
        msg.className = 'msg error';
    }
});

document.addEventListener('DOMContentLoaded', checkAttendanceStatus);
