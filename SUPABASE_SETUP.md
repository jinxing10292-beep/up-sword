# Supabase 테이블 설계

## 1. users 테이블
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 2. player_stats 테이블 (플레이어 게임 상태)
```sql
CREATE TABLE player_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sword_level INTEGER DEFAULT 0,
  gold BIGINT DEFAULT 1000000,
  money INTEGER DEFAULT 0,
  cumulative_cost BIGINT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);
```

## 3. inventory 테이블 (보관함)
```sql
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sword_level INTEGER NOT NULL,
  sword_name VARCHAR(100),
  rarity VARCHAR(20), -- common, uncommon, rare, epic, legendary
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  in_use BOOLEAN DEFAULT FALSE
);
```

## 4. rankings 테이블 (랭킹 스냅샷)
```sql
CREATE TABLE rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  username VARCHAR(50) NOT NULL,
  sword_level INTEGER,
  cumulative_cost BIGINT,
  rank_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rankings_date ON rankings(rank_date DESC);
```

## 5. battle_history 테이블 (배틀 기록)
```sql
CREATE TABLE battle_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attacker_id UUID REFERENCES users(id),
  defender_id UUID REFERENCES users(id),
  attacker_level INTEGER,
  defender_level INTEGER,
  result VARCHAR(10), -- win, lose, draw
  reward_gold BIGINT,
  battle_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 6. roulette_log 테이블 (룰렛 기록)
```sql
CREATE TABLE roulette_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bet_amount BIGINT NOT NULL,
  result_multiplier DECIMAL(4,2),
  win_amount BIGINT,
  result_number INTEGER, -- 1-46
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 7. admin_settings 테이블 (GM 비밀번호)
```sql
CREATE TABLE admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(50) UNIQUE NOT NULL,
  setting_value VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 초기 데이터
INSERT INTO admin_settings (setting_key, setting_value) 
VALUES ('gm_password_hash', 'bcrypt_hashed_password_here');
```

## GM 비밀번호 검증 방법
1. Supabase admin_settings에서 `gm_password_hash` 조회
2. 클라이언트에서 입력한 비밀번호를 bcrypt로 해싱
3. 저장된 hash와 비교

Node.js bcrypt 예제:
```javascript
const bcrypt = require('bcrypt');

// 비밀번호 해싱 (처음 저장할 때)
const hashedPassword = await bcrypt.hash('your_gm_password', 10);
// admin_settings에 저장

// 검증 (로그인 시)
const isMatch = await bcrypt.compare(inputPassword, storedHash);
```

## RLS (Row Level Security) 설정

```sql
-- users 테이블 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- player_stats 테이블 RLS
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can read own stats" ON player_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Players can update own stats" ON player_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- inventory 테이블 RLS
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can read own inventory" ON inventory
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Players can manage own inventory" ON inventory
  FOR INSERT, UPDATE, DELETE USING (auth.uid() = user_id);
```

## 마이그레이션 적용 순서
1. users 테이블 생성
2. player_stats, inventory, battle_history, roulette_log 생성
3. rankings 테이블 생성
4. admin_settings 테이블 생성
5. RLS 정책 적용
