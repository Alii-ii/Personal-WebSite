"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { SYSTEM_PROMPT } from '@/data/system-prompt';

const MAX_HISTORY_MESSAGES = 20;
const DAILY_LIMIT = 25;

/**
 * AI Chat Hook
 *
 * 管理对话会话、消息收发、SSE 流式接收和每日限额。
 *
 * @returns {{
 *   conversations: Array,
 *   currentConversation: Object|null,
 *   messages: Array,
 *   isLoadingConversations: boolean,
 *   isLoadingMessages: boolean,
 *   isStreaming: boolean,
 *   streamingContent: string,
 *   isRateLimited: boolean,
 *   rateLimitMessage: string|null,
 *   createConversation: () => Promise<Object>,
 *   selectConversation: (id: string) => Promise<void>,
 *   deleteConversation: (id: string) => Promise<void>,
 *   sendMessage: (content: string) => Promise<void>,
 *   refresh: () => Promise<void>,
 * }}
 */
export function useChat() {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState(null);

  // 用 ref 跟踪今日已发送消息数（避免闭包陈旧问题）
  const dailyCountRef = useRef(0);
  // abort controller for SSE
  const abortRef = useRef(null);

  // ─── 会话列表 ────────────────────────────────────

  const loadConversations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_chat_conversations')
        .select('id, title, created_at, updated_at')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Load conversations error:', error);
        return;
      }

      setConversations(data || []);
    } catch (err) {
      console.error('Load conversations error:', err);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  // 初始化加载
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // ─── 创建会话 ────────────────────────────────────

  const createConversation = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('site_chat_conversations')
      .insert({ user_id: user.id, title: '新对话' })
      .select()
      .single();

    if (error) {
      console.error('Create conversation error:', error);
      return null;
    }

    setConversations(prev => [data, ...prev]);
    setCurrentConversation(data);
    setMessages([]);
    return data;
  }, []);

  // ─── 选择会话 ────────────────────────────────────

  const selectConversation = useCallback(async (id) => {
    const conv = conversations.find(c => c.id === id);
    if (!conv) return;

    setCurrentConversation(conv);
    setIsLoadingMessages(true);
    setStreamingContent('');

    try {
      const { data, error } = await supabase
        .from('site_chat_messages')
        .select('id, role, content, created_at')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Load messages error:', error);
        return;
      }

      setMessages(data || []);
    } catch (err) {
      console.error('Load messages error:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [conversations]);

  // ─── 删除会话 ────────────────────────────────────

  const deleteConversation = useCallback(async (id) => {
    const { error } = await supabase
      .from('site_chat_conversations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete conversation error:', error);
      return;
    }

    setConversations(prev => prev.filter(c => c.id !== id));

    if (currentConversation?.id === id) {
      setCurrentConversation(null);
      setMessages([]);
    }
  }, [currentConversation]);

  // ─── 发送消息 ────────────────────────────────────

  const sendMessage = useCallback(async (content) => {
    const trimmed = content?.trim();
    if (!trimmed || isStreaming) return;

    // 限额检查（前端乐观）
    if (dailyCountRef.current >= DAILY_LIMIT) {
      setIsRateLimited(true);
      setRateLimitMessage('今天聊得够多啦，明天再来吧 ☕');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 确保有当前会话
    let convId = currentConversation?.id;
    if (!convId) {
      const newConv = await createConversation();
      if (!newConv) return;
      convId = newConv.id;
    }

    // 乐观渲染用户消息
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: trimmed,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);

    // 写入用户消息到 Supabase
    const { data: savedMsg, error: insertError } = await supabase
      .from('site_chat_messages')
      .insert({
        conversation_id: convId,
        user_id: user.id,
        role: 'user',
        content: trimmed,
      })
      .select('id, role, content, created_at')
      .single();

    if (insertError) {
      console.error('Insert message error:', insertError);
      // 回退乐观更新
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
      return;
    }

    // 替换临时消息为真实消息
    setMessages(prev => prev.map(m => m.id === tempUserMsg.id ? savedMsg : m));
    dailyCountRef.current += 1;

    // 更新会话标题（首条消息时）
    if (messages.length === 0) {
      const newTitle = trimmed.substring(0, 20) + (trimmed.length > 20 ? '...' : '');
      supabase
        .from('site_chat_conversations')
        .update({ title: newTitle })
        .eq('id', convId)
        .then(() => {
          setConversations(prev =>
            prev.map(c => c.id === convId ? { ...c, title: newTitle } : c)
          );
          setCurrentConversation(prev =>
            prev?.id === convId ? { ...prev, title: newTitle } : prev
          );
        });
    }

    // 构造历史上下文
    const allMessages = [...messages.filter(m => m.id !== tempUserMsg.id), savedMsg];
    const history = allMessages
      .slice(-MAX_HISTORY_MESSAGES)
      .map(m => ({ role: m.role, content: m.content }));

    // 获取 JWT
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    // 发起 SSE 请求
    setIsStreaming(true);
    setStreamingContent('');

    const abortController = new AbortController();
    abortRef.current = abortController;

    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          conversation_id: convId,
          message: trimmed,
          system_prompt: SYSTEM_PROMPT,
          history,
        }),
        signal: abortController.signal,
      });

      // 处理非流式错误响应
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));

        if (errData.error === 'rate_limit') {
          setIsRateLimited(true);
          setRateLimitMessage(errData.message || '今天聊得够多啦，明天再来吧 ☕');
        } else {
          // 添加一个错误提示消息
          setMessages(prev => [...prev, {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: errData.message || 'AI 暂时走神了，请稍后再试',
            created_at: new Date().toISOString(),
            _isError: true,
          }]);
        }

        setIsStreaming(false);
        return;
      }

      // 流式读取 SSE
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

          try {
            const parsed = JSON.parse(trimmedLine.slice(6));

            if (parsed.done) {
              // 流结束 — 将 streaming content 移入 messages
              setMessages(prev => [...prev, {
                id: parsed.message_id || `ai-${Date.now()}`,
                role: 'assistant',
                content: accumulated,
                created_at: new Date().toISOString(),
              }]);
              setStreamingContent('');
            } else if (parsed.content) {
              accumulated += parsed.content;
              setStreamingContent(accumulated);
            }
          } catch {
            // 忽略解析失败
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Chat SSE error:', err);
        setMessages(prev => [...prev, {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: '网络连接中断，请检查网络后重试',
          created_at: new Date().toISOString(),
          _isError: true,
        }]);
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [isStreaming, currentConversation, messages, createConversation]);

  // ─── 初始化每日计数 ─────────────────────────────

  useEffect(() => {
    async function initDailyCount() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const { count, error } = await supabase
        .from('site_chat_messages')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('role', 'user')
        .gte('created_at', today.toISOString());

      if (!error && count !== null) {
        dailyCountRef.current = count;
        if (count >= DAILY_LIMIT) {
          setIsRateLimited(true);
          setRateLimitMessage('今天聊得够多啦，明天再来吧 ☕');
        }
      }
    }

    initDailyCount();
  }, []);

  // ─── 刷新 ──────────────────────────────────────

  const refresh = useCallback(async () => {
    await loadConversations();
    if (currentConversation) {
      await selectConversation(currentConversation.id);
    }
  }, [loadConversations, currentConversation, selectConversation]);

  return {
    conversations,
    currentConversation,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    isStreaming,
    streamingContent,
    isRateLimited,
    rateLimitMessage,
    createConversation,
    selectConversation,
    deleteConversation,
    sendMessage,
    refresh,
  };
}
