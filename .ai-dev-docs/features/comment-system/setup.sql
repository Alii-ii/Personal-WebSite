-- ============================================
-- Comment System - Supabase Setup SQL
-- 在 Supabase Dashboard → SQL Editor 中执行
-- ============================================

-- 1. 创建 updated_at 触发器函数（如果不存在）
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. 创建 site_profiles 表
CREATE TABLE site_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL CHECK (char_length(nickname) >= 1 AND char_length(nickname) <= 20),
  avatar_seed TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER site_profiles_updated_at
  BEFORE UPDATE ON site_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3. 创建 site_comments 表
CREATE TABLE site_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_path TEXT NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 500),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_site_comments_target ON site_comments(target_path);
CREATE INDEX idx_site_comments_user ON site_comments(user_id);
CREATE INDEX idx_site_comments_created ON site_comments(created_at);

-- 4. 添加 site_comments → site_profiles 的外键（用于 Supabase 自动 JOIN）
ALTER TABLE site_comments
  ADD CONSTRAINT fk_site_comments_profile
  FOREIGN KEY (user_id) REFERENCES site_profiles(id) ON DELETE CASCADE;

-- 5. RLS 策略 - site_profiles
ALTER TABLE site_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_profiles_select" ON site_profiles
  FOR SELECT USING (true);

CREATE POLICY "site_profiles_insert" ON site_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "site_profiles_update" ON site_profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 6. RLS 策略 - site_comments
ALTER TABLE site_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_comments_select" ON site_comments
  FOR SELECT USING (true);

CREATE POLICY "site_comments_insert" ON site_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "site_comments_delete" ON site_comments
  FOR DELETE USING (auth.uid() = user_id);
