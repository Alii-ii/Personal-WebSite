-- ============================================
-- AI Chat 建表 SQL
-- 在 Supabase SQL Editor 中执行
-- ============================================

-- 1. site_chat_conversations 表
CREATE TABLE site_chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT '新对话',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_site_chat_conversations_user ON site_chat_conversations(user_id);
CREATE INDEX idx_site_chat_conversations_updated ON site_chat_conversations(updated_at);

-- 复用已有的 update_updated_at() trigger function
CREATE TRIGGER site_chat_conversations_updated_at
  BEFORE UPDATE ON site_chat_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. site_chat_messages 表
CREATE TABLE site_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES site_chat_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL CHECK (char_length(content) >= 1),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_site_chat_messages_conversation ON site_chat_messages(conversation_id);
CREATE INDEX idx_site_chat_messages_user ON site_chat_messages(user_id);
CREATE INDEX idx_site_chat_messages_created ON site_chat_messages(created_at);

-- 用于每日限额计数的部分索引
CREATE INDEX idx_site_chat_messages_user_date ON site_chat_messages(user_id, created_at)
  WHERE role = 'user';

-- 3. RLS 策略 - site_chat_conversations
ALTER TABLE site_chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_conversations_select" ON site_chat_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "chat_conversations_insert" ON site_chat_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chat_conversations_update" ON site_chat_conversations
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chat_conversations_delete" ON site_chat_conversations
  FOR DELETE USING (auth.uid() = user_id);

-- 4. RLS 策略 - site_chat_messages
ALTER TABLE site_chat_messages ENABLE ROW LEVEL SECURITY;

-- 用户可以查看自己对话中的消息
CREATE POLICY "chat_messages_select" ON site_chat_messages
  FOR SELECT USING (auth.uid() = user_id);

-- 用户只能插入 role='user' 的消息（AI 回复由 service key 插入，绕过 RLS）
CREATE POLICY "chat_messages_insert" ON site_chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id AND role = 'user');

-- 消息不可编辑、不可单独删除（随会话级联删除）
