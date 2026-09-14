// Supabase 함수들
async function signUp(email, username, password) {
    try {
        const { data, error } = await CONFIG.supabase.auth.signUp({ email, password });
        if (error) throw error;
        return { success: true, message: '회원가입 성공!' };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// 로그인
async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) throw error;

        localStorage.setItem('user_id', data.user.id);
        localStorage.setItem('username', data.user.email);

        return { success: true, message: '로그인 성공!' };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// 로그아웃
async function signOut() {
    try {
        await supabase.auth.signOut();
        localStorage.removeItem('user_id');
        localStorage.removeItem('username');
        return { success: true, message: '로그아웃 됨' };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// 현재 로그인 정보 확인
async function getCurrentUser() {
    const { data, error } = await supabase.auth.getSession();
    return data.session?.user || null;
}

// 랭킹 조회
async function getRankings(limit = 10) {
    try {
        const { data, error } = await supabase
            .from('rankings')
            .select('*')
            .order('rank_date', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('랭킹 조회 실패:', error);
        return [];
    }
}

// 플레이어 통계 업데이트
async function updatePlayerStats(userId, stats) {
    try {
        const { error } = await supabase
            .from('player_stats')
            .update({
                sword_level: stats.swordLevel,
                gold: stats.gold,
                money: stats.money,
                cumulative_cost: stats.cumulativeCost,
                last_updated: new Date()
            })
            .eq('user_id', userId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('통계 업데이트 실패:', error);
        return { success: false };
    }
}

// GM 비밀번호 검증
async function validateGMPassword(inputPassword) {
    try {
        const { data, error } = await supabase
            .from('admin_settings')
            .select('setting_value')
            .eq('setting_key', 'gm_password_hash')
            .single();

        if (error) throw error;

        // 클라이언트에서는 간단한 검증만 (실제로는 서버에서 처리 권장)
        // bcryptjs 라이브러리 사용
        if (typeof bcryptjs !== 'undefined') {
            return await bcryptjs.compare(inputPassword, data.setting_value);
        } else {
            // bcryptjs 없으면 간단한 문자열 비교 (테스트용)
            return inputPassword === data.setting_value;
        }
    } catch (error) {
        console.error('GM 검증 실패:', error);
        return false;
    }
}

// 인벤토리 조회
async function getInventory(userId) {
    try {
        const { data, error } = await supabase
            .from('inventory')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('인벤토리 조회 실패:', error);
        return [];
    }
}

// 검 보관
async function addToInventory(userId, swordLevel, swordName = '검', rarity = 'common') {
    try {
        const { error } = await supabase
            .from('inventory')
            .insert([
                {
                    user_id: userId,
                    sword_level: swordLevel,
                    sword_name: swordName,
                    rarity: rarity,
                    in_use: false
                }
            ]);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('인벤토리 추가 실패:', error);
        return { success: false };
    }
}

// 배틀 기록
async function recordBattle(attackerId, defenderId, attackerLevel, defenderLevel, result, rewardGold) {
    try {
        const { error } = await supabase
            .from('battle_history')
            .insert([
                {
                    attacker_id: attackerId,
                    defender_id: defenderId,
                    attacker_level: attackerLevel,
                    defender_level: defenderLevel,
                    result: result,
                    reward_gold: rewardGold
                }
            ]);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('배틀 기록 실패:', error);
        return { success: false };
    }
}

// 룰렛 기록
async function recordRoulette(userId, betAmount, resultMultiplier, winAmount, resultNumber) {
    try {
        const { error } = await supabase
            .from('roulette_log')
            .insert([
                {
                    user_id: userId,
                    bet_amount: betAmount,
                    result_multiplier: resultMultiplier,
                    win_amount: winAmount,
                    result_number: resultNumber
                }
            ]);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('룰렛 기록 실패:', error);
        return { success: false };
    }
}
