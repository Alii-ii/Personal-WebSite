-- ============================================
-- Migration: nickname 唯一约束 + 站长账号 profile
-- 在 Supabase Dashboard → SQL Editor 中执行
-- ============================================

-- 1. 给 nickname 加 UNIQUE 约束（应用层查重 + DB 兜底）
ALTER TABLE site_profiles
  ADD CONSTRAINT site_profiles_nickname_unique UNIQUE (nickname);

-- 2. 站长 profile 预置
--    先在 Dashboard → Authentication → Users → Add User 创建邮箱账号：
--    Email: alii.wong@foxmail.com
--    Password: （你自己设一个）
--    勾选 Auto Confirm User
--
--    创建完成后，从用户列表复制该用户的 UUID，替换下面的占位符：

-- INSERT INTO site_profiles (id, nickname, avatar_seed)
-- VALUES ('替换为你的UUID', 'Alii', '替换为你的UUID');
