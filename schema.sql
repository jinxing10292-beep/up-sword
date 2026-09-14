CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sword_level INTEGER NOT NULL,
  sword_name VARCHAR(100),
  rarity VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  in_use BOOLEAN DEFAULT FALSE
);

CREATE TABLE rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  username VARCHAR(50) NOT NULL,
  sword_level INTEGER,
  cumulative_cost BIGINT,
  rank_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rankings_date ON rankings(rank_date DESC);

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

CREATE TABLE roulette_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bet_amount BIGINT NOT NULL,
  result_multiplier DECIMAL(4,2),
  win_amount BIGINT,
  result_number INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(50) UNIQUE NOT NULL,
  setting_value VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO admin_settings (setting_key, setting_value) 
VALUES ('gm_password_hash', 'bcrypt_hashed_password_here');

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can read own stats" ON player_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Players can update own stats" ON player_stats
  FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can read own inventory" ON inventory
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Players can manage own inventory" ON inventory
  FOR INSERT, UPDATE, DELETE
  USING (auth.uid() = user_id);
