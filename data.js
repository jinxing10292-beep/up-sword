// 강화 시스템 데이터
const ENHANCEMENT_DATA = [
    { stage: 0, name: '+0 → +1', success: 100, maintain: 0, break: 0, cost: 100 },
    { stage: 1, name: '+1 → +2', success: 95, maintain: 5, break: 0, cost: 500 },
    { stage: 2, name: '+2 → +3', success: 90, maintain: 10, break: 0, cost: 1000 },
    { stage: 3, name: '+3 → +4', success: 85, maintain: 15, break: 0, cost: 2500 },
    { stage: 4, name: '+4 → +5', success: 80, maintain: 20, break: 0, cost: 3000 },
    { stage: 5, name: '+5 → +6', success: 75, maintain: 25, break: 0, cost: 5000 },
    { stage: 6, name: '+6 → +7', success: 70, maintain: 30, break: 0, cost: 6500 },
    { stage: 7, name: '+7 → +8', success: 65, maintain: 35, break: 0, cost: 10000 },
    { stage: 8, name: '+8 → +9', success: 60, maintain: 40, break: 0, cost: 12500 },
    { stage: 9, name: '+9 → +10', success: 55, maintain: 45, break: 0, cost: 17500 },
    { stage: 10, name: '+10 → +11', success: 50, maintain: 45, break: 5, cost: 20000 },
    { stage: 11, name: '+11 → +12', success: 47, maintain: 47, break: 6, cost: 25000 },
    { stage: 12, name: '+12 → +13', success: 44, maintain: 49, break: 7, cost: 50000 },
    { stage: 13, name: '+13 → +14', success: 41, maintain: 51, break: 8, cost: 75000 },
    { stage: 14, name: '+14 → +15', success: 38, maintain: 53, break: 9, cost: 100000 },
    { stage: 15, name: '+15 → +16', success: 35, maintain: 55, break: 10, cost: 125000 },
    { stage: 16, name: '+16 → +17', success: 33, maintain: 56, break: 11, cost: 150000 },
    { stage: 17, name: '+17 → +18', success: 31, maintain: 57, break: 12, cost: 200000 },
    { stage: 18, name: '+18 → +19', success: 29, maintain: 58, break: 13, cost: 500000 },
    { stage: 19, name: '+19 → +20', success: 27, maintain: 59, break: 14, cost: 750000 },
    { stage: 20, name: '+20 → +21', success: 25, maintain: 55, break: 20, cost: 1000000 },
    { stage: 21, name: '+21 → +22', success: 21, maintain: 54, break: 25, cost: 2000000 },
    { stage: 22, name: '+22 → +23', success: 18, maintain: 52, break: 30, cost: 3500000 },
    { stage: 23, name: '+23 → +24', success: 14, maintain: 50, break: 36, cost: 5000000 },
    { stage: 24, name: '+24 → +25', success: 11, maintain: 47, break: 42, cost: 10000000 },
    { stage: 25, name: '+25 → +26', success: 10, maintain: 40, break: 50, cost: 50000000 },
    { stage: 26, name: '+26 → +27', success: 8, maintain: 34, break: 58, cost: 150000000 },
    { stage: 27, name: '+27 → +28', success: 5, maintain: 27, break: 68, cost: 500000000 },
    { stage: 28, name: '+28 → +29', success: 3, maintain: 17, break: 80, cost: 3000000000 },
    { stage: 29, name: '+29 → +30', success: 1, maintain: 0, break: 99, cost: 10000000000 },
];

// 게임 상태 저장 (localStorage 사용)
class GameState {
    constructor() {
        this.load();
    }

    load() {
        const saved = localStorage.getItem('swordGameState');
        if (saved) {
            const state = JSON.parse(saved);
            this.swordLevel = state.swordLevel || 0;
            this.gold = state.gold || 0;
            this.money = state.money || 0;
            this.cumulativeCost = state.cumulativeCost || 0;
            this.rankings = state.rankings || this.getDefaultRankings();
        } else {
            this.swordLevel = 0;
            this.gold = 1000000; // 초기 테스트 골드
            this.money = 0;
            this.cumulativeCost = 0;
            this.rankings = this.getDefaultRankings();
        }
    }

    save() {
        localStorage.setItem('swordGameState', JSON.stringify({
            swordLevel: this.swordLevel,
            gold: this.gold,
            money: this.money,
            cumulativeCost: this.cumulativeCost,
            rankings: this.rankings
        }));
    }

    getDefaultRankings() {
        return [
            { rank: 1, name: '플레이어', level: 0, gold: 0 },
            { rank: 2, name: '플레이어', level: 0, gold: 0 },
            { rank: 3, name: '플레이어', level: 0, gold: 0 },
            { rank: 4, name: '플레이어', level: 0, gold: 0 },
            { rank: 5, name: '플레이어', level: 0, gold: 0 },
            { rank: 6, name: '플레이어', level: 0, gold: 0 },
            { rank: 7, name: '플레이어', level: 0, gold: 0 },
            { rank: 8, name: '플레이어', level: 0, gold: 0 },
            { rank: 9, name: '플레이어', level: 0, gold: 0 },
            { rank: 10, name: '플레이어', level: 0, gold: 0 },
        ];
    }

    // 강화 시도
    attemptEnhance() {
        if (this.swordLevel >= 30) return { result: 'maxLevel', message: '이미 최대 강화 단계입니다!' };
        
        const enhanceData = ENHANCEMENT_DATA[this.swordLevel];
        if (this.gold < enhanceData.cost) {
            return { result: 'noGold', message: '골드가 부족합니다!' };
        }

        const random = Math.random() * 100;
        this.gold -= enhanceData.cost;
        this.cumulativeCost += enhanceData.cost;

        let result = 'maintain'; // 기본값: 유지
        let message = '';

        if (random < enhanceData.success) {
            result = 'success';
            this.swordLevel++;
            message = `성공! 검이 +${this.swordLevel}로 강화되었습니다!`;
        } else if (random < enhanceData.success + enhanceData.maintain) {
            result = 'maintain';
            message = `유지! 검의 강화 단계가 유지되었습니다.`;
        } else {
            // 파괴 판정
            if (this.swordLevel >= 10) {
                // +10 이상: 한 단계 하락
                result = 'break';
                this.swordLevel--;
                message = `파괴! 검이 +${this.swordLevel}로 하락했습니다!`;
            } else {
                // +10 미만: 파괴 불가능, 유지로 처리
                result = 'maintain';
                message = `실패! 하지만 이 단계에서는 파괴되지 않았습니다.`;
            }
        }

        this.save();
        return { result, message };
    }

    // 룰렛 스핀
    spin(betAmount) {
        if (this.gold < betAmount) {
            return { result: 'noGold', message: '골드가 부족합니다!' };
        }

        // 1-46 룰렛 (46칸)
        const rouletteResults = [
            { multiplier: 2, label: '2배', num: 1 },
            { multiplier: 0, label: '꽝', num: 2 },
            { multiplier: 5, label: '5배', num: 3 },
            { multiplier: 1, label: '1배', num: 4 },
            { multiplier: 3, label: '3배', num: 5 },
            { multiplier: 0, label: '꽝', num: 6 },
            { multiplier: 10, label: '10배', num: 7 },
            { multiplier: 0.5, label: '0.5배', num: 8 },
            { multiplier: 1.5, label: '1.5배', num: 9 },
            { multiplier: 0, label: '꽝', num: 10 },
            { multiplier: 4, label: '4배', num: 11 },
            { multiplier: 0.3, label: '0.3배', num: 12 },
            { multiplier: 2.5, label: '2.5배', num: 13 },
            { multiplier: 0, label: '꽝', num: 14 },
            { multiplier: 6, label: '6배', num: 15 },
            { multiplier: 0.7, label: '0.7배', num: 16 },
            { multiplier: 3.5, label: '3.5배', num: 17 },
            { multiplier: 0, label: '꽝', num: 18 },
            { multiplier: 8, label: '8배', num: 19 },
            { multiplier: 0.2, label: '0.2배', num: 20 },
            { multiplier: 1.2, label: '1.2배', num: 21 },
            { multiplier: 0, label: '꽝', num: 22 },
            { multiplier: 7, label: '7배', num: 23 },
            { multiplier: 0.4, label: '0.4배', num: 24 },
            { multiplier: 2.2, label: '2.2배', num: 25 },
            { multiplier: 0, label: '꽝', num: 26 },
            { multiplier: 9, label: '9배', num: 27 },
            { multiplier: 0.6, label: '0.6배', num: 28 },
            { multiplier: 1.8, label: '1.8배', num: 29 },
            { multiplier: 0, label: '꽝', num: 30 },
            { multiplier: 5.5, label: '5.5배', num: 31 },
            { multiplier: 0.5, label: '0.5배', num: 32 },
            { multiplier: 3.2, label: '3.2배', num: 33 },
            { multiplier: 0, label: '꽝', num: 34 },
            { multiplier: 11, label: '11배', num: 35 },
            { multiplier: 0.1, label: '0.1배', num: 36 },
            { multiplier: 2.8, label: '2.8배', num: 37 },
            { multiplier: 0, label: '꽝', num: 38 },
            { multiplier: 6.5, label: '6.5배', num: 39 },
            { multiplier: 0.8, label: '0.8배', num: 40 },
            { multiplier: 4.2, label: '4.2배', num: 41 },
            { multiplier: 0, label: '꽝', num: 42 },
            { multiplier: 12, label: '12배', num: 43 },
            { multiplier: 0.9, label: '0.9배', num: 44 },
            { multiplier: 1.1, label: '1.1배', num: 45 },
            { multiplier: 0, label: '꽝', num: 46 },
        ];

        const spinResult = Math.floor(Math.random() * rouletteResults.length);
        const result = rouletteResults[spinResult];

        this.gold -= betAmount;

        let winAmount = 0;
        let message = '';

        if (result.multiplier === 0) {
            message = `꽝! (${result.num}번) 베팅한 골드를 잃었습니다.`;
            winAmount = 0;
        } else {
            winAmount = Math.floor(betAmount * result.multiplier);
            this.gold += winAmount;
            message = `${result.label}! (${result.num}번) ${winAmount}G을 획득했습니다!`;
        }

        this.save();
        return { 
            result: 'completed', 
            message, 
            winAmount, 
            multiplier: result.label,
            spinIndex: spinResult 
        };
    }

    // 골드 추가 (테스트/GM용)
    addGold(amount) {
        this.gold += amount;
        this.save();
    }

    // 판매가격 계산 (+13이상부터만 이득)
    getSellPrice(level) {
        if (level < 0) return 0;
        if (level > 30) return 0;
        
        let price = 0;
        for (let i = 0; i < level; i++) {
            price += ENHANCEMENT_DATA[i].cost;
        }
        
        // +13 기준점: 누적비용 = 판매가 (손익 0)
        // +12까지는 손해, +13부터 이득
        return Math.floor(price * 0.95); // 수수료 5%
    }

    // 검 판매
    sellSword() {
        if (this.swordLevel === 0) {
            return { result: 'noSword', message: '판매할 검이 없습니다!' };
        }
        
        const sellPrice = this.getSellPrice(this.swordLevel);
        this.gold += sellPrice;
        this.cumulativeCost = 0;
        this.swordLevel = 0;
        this.save();
        
        return { result: 'success', message: `검을 ${formatNumber(sellPrice)}G에 판매했습니다!`, sellPrice };
    }

    // 랭킹 업데이트
    updateRanking() {
        // 현재 플레이어를 랭킹에 추가
        const playerRank = {
            name: '플레이어',
            level: this.swordLevel,
            gold: this.cumulativeCost
        };

        // 랭킹 정렬 (강화 레벨 > 누적 비용)
        this.rankings = this.rankings.map((r, idx) => ({ ...r, rank: idx + 1 }));
        
        let inserted = false;
        for (let i = 0; i < this.rankings.length; i++) {
            if (this.swordLevel > this.rankings[i].level || 
                (this.swordLevel === this.rankings[i].level && this.cumulativeCost > this.rankings[i].gold)) {
                this.rankings.splice(i, 0, playerRank);
                this.rankings.pop(); // 11번째 제거
                inserted = true;
                break;
            }
        }

        // 랭킹 재정렬
        this.rankings.forEach((r, idx) => r.rank = idx + 1);
        this.save();
    }
}

// 게임 상태 전역 인스턴스
const gameState = new GameState();
