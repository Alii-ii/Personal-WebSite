-- Comment likes migration
-- 在 Supabase Dashboard → SQL Editor 中执行一次

CREATE TABLE IF NOT EXISTS site_comment_likes (
  comment_id UUID NOT NULL REFERENCES site_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_site_comment_likes_user
  ON site_comment_likes(user_id);

CREATE INDEX IF NOT EXISTS idx_site_comment_likes_comment
  ON site_comment_likes(comment_id);

ALTER TABLE site_comment_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_comment_likes_select" ON site_comment_likes;
CREATE POLICY "site_comment_likes_select" ON site_comment_likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "site_comment_likes_insert" ON site_comment_likes;
CREATE POLICY "site_comment_likes_insert" ON site_comment_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "site_comment_likes_delete" ON site_comment_likes;
CREATE POLICY "site_comment_likes_delete" ON site_comment_likes
  FOR DELETE USING (auth.uid() = user_id);
