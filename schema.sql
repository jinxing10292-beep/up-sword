-- 기존 테이블 삭제 (있을 경우)
DROP TABLE IF EXISTS roulette_log CASCADE;
DROP TABLE IF EXISTS battle_history CASCADE;
DROP TABLE IF EXISTS rankings CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS player_stats CASCADE;
DROP TABLE IF EXISTS admin_settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- users 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  gold BIGINT DEFAULT 1000000,
  money INTEGER DEFAULT 0,
  sword_level INTEGER DEFAULT 0,
  cumulative_cost BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- player_stats 테이블
CREATE TABLE player_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  sword_level INTEGER DEFAULT 0,
  gold BIGINT DEFAULT 1000000,
  money INTEGER DEFAULT 0,
  cumulative_cost BIGINT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- inventory 테이블
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- battle_history 테이블
CREATE TABLE battle_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attacker_id UUID REFERENCES users(id),
  defender_id UUID REFERENCES users(id),
  attacker_level INTEGER,
  defender_level INTEGER,
  result VARCHAR(10),
  reward_gold BIGINT,
  battle_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- roulette_log 테이블
CREATE TABLE roulette_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bet_amount BIGINT NOT NULL,
  result_multiplier DECIMAL(4,2),
  win_amount BIGINT,
  result_number INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- admin_settings 테이블
CREATE TABLE admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(50) UNIQUE NOT NULL,
  setting_value VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GM 비밀번호 저장
INSERT INTO admin_settings (setting_key, setting_value) 
VALUES ('gm_password', 'admin1234');

-- 인덱스 생성
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_inventory_user ON inventory(user_id);
CREATE INDEX idx_battle_history_date ON battle_history(battle_date DESC);
CREATE INDEX idx_roulette_log_date ON roulette_log(created_at DESC);

-- RLS 비활성화 (개발 단계)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
