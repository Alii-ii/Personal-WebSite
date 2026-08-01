"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { SYSTEM_PROMPT } from '@/data/system-prompt';

const MAX_HISTORY_MESSAGES = 20;
const DAILY_LIMIT = 25;
const CONFIGURED_CHAT_API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL;
const LOCAL_CHAT_API_URL = 'http://localhost:8788/api/chat';
const PRODUCTION_CHAT_API_URL = 'https://alii.work/api/chat';
const CHAT_API_URL = CONFIGURED_CHAT_API_URL
  || (process.env.NODE_ENV === 'development' ? LOCAL_CHAT_API_URL : '/api/chat');
const CHAT_API_FALLBACK_URL =
  !CONFIGURED_CHAT_API_URL && process.env.NODE_ENV === 'development'
    ? PRODUCTION_CHAT_API_URL
    : null;
const IS_RATE_LIMIT_DISABLED =
  process.env.NEXT_PUBLIC_CHAT_DISABLE_RATE_LIMIT === 'true';
const CHAT_RESPONSE_TIMEOUT_MS = 30000;
const CHAT_SETUP_TIMEOUT_MS = 10000;

function withTimeout(promise, timeoutMs, label) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${label}_timeout`)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

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
export function useChat(authUser = null, accessToken = null) {
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
  const currentConversationRef = useRef(null);
  const messagesRef = useRef([]);
  const isLoadingMessagesRef = useRef(false);

  // 同步到 ref，供 createConversation 判断「当前是否已是空对话」
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    isLoadingMessagesRef.current = isLoadingMessages;
  }, [isLoadingMessages]);

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

      const nextConversations = data || [];
      setConversations(nextConversations);

      // 当前 MVP 只展示一条对话：恢复最近会话，让用户刷新后可直接继续聊。
      if (!currentConversationRef.current && nextConversations.length > 0) {
        const latest = nextConversations[0];
        currentConversationRef.current = latest;
        setCurrentConversation(latest);
        setIsLoadingMessages(true);

        const { data: latestMessages, error: messageError } = await supabase
          .from('site_chat_messages')
          .select('id, role, content, created_at')
          .eq('conversation_id', latest.id)
          .order('created_at', { ascending: true });

        if (messageError) {
          console.error('Load latest messages error:', messageError);
        } else {
          setMessages(latestMessages || []);
        }
        setIsLoadingMessages(false);
      }
    } catch (err) {
      console.error('Load conversations error:', err);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  // 只在认证用户确定后初始化一次，避免 currentConversation 更新触发重复查询和重渲染。
  useEffect(() => {
    if (!authUser) {
      currentConversationRef.current = null;
      setConversations([]);
      setCurrentConversation(null);
      setMessages([]);
      setIsLoadingConversations(false);
      return;
    }

    loadConversations();
  }, [authUser?.id, loadConversations]);

  // ─── 创建会话 ────────────────────────────────────

  const createConversation = useCallback(async () => {
    if (!authUser) return null;

    // 当前已是空对话时复用，避免重复 insert 空 chat
    // 消息仍在加载时不复用，避免把「尚未拉回消息的旧会话」误判为空
    const current = currentConversationRef.current;
    if (current && !isLoadingMessagesRef.current && messagesRef.current.length === 0) {
      return current;
    }

    const { data, error } = await supabase
      .from('site_chat_conversations')
      .insert({ user_id: authUser.id, title: '新对话' })
      .select('id, title, created_at, updated_at')
      .limit(1);

    const conversation = data?.[0];
    if (error || !conversation) {
      console.error('Create conversation error:', error || 'No conversation returned');
      return null;
    }

    setConversations(prev => [conversation, ...prev]);
    currentConversationRef.current = conversation;
    setCurrentConversation(conversation);
    setMessages([]);
    return conversation;
  }, [authUser]);

  // ─── 选择会话 ────────────────────────────────────

  const selectConversation = useCallback(async (id) => {
    const conv = conversations.find(c => c.id === id);
    if (!conv) return;

    currentConversationRef.current = conv;
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
      currentConversationRef.current = null;
      setCurrentConversation(null);
      setMessages([]);
    }
  }, [currentConversation]);

  // ─── 发送消息 ────────────────────────────────────

  const sendMessage = useCallback(async (content) => {
    const trimmed = content?.trim();
    if (!trimmed || isStreaming) return;

    // 生产环境限额检查（前端乐观）；本地联调可通过环境变量关闭。
    if (!IS_RATE_LIMIT_DISABLED && dailyCountRef.current >= DAILY_LIMIT) {
      setIsRateLimited(true);
      setRateLimitMessage('chatRateLimited');
      return;
    }

    if (!authUser) {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        contentKey: 'chatSessionExpired',
        created_at: new Date().toISOString(),
        _isError: true,
      }]);
      return;
    }

    // 确保有当前会话
    let convId = currentConversation?.id;
    if (!convId) {
      const newConv = await withTimeout(
        createConversation(),
        CHAT_SETUP_TIMEOUT_MS,
        'conversation'
      ).catch((error) => {
        console.error('Create conversation timeout:', error);
        return null;
      });
      if (!newConv) {
        setMessages(prev => [...prev, {
          id: `error-${Date.now()}`,
          role: 'assistant',
          contentKey: 'chatConversationTimeout',
          created_at: new Date().toISOString(),
          _isError: true,
        }]);
        return;
      }
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
    let insertedMessages;
    let insertError;
    try {
      const insertResult = await withTimeout(
        supabase
          .from('site_chat_messages')
          .insert({
            conversation_id: convId,
            user_id: authUser.id,
            role: 'user',
            content: trimmed,
          })
          .select('id, role, content, created_at')
          .limit(1),
        CHAT_SETUP_TIMEOUT_MS,
        'message_insert'
      );
      insertedMessages = insertResult.data;
      insertError = insertResult.error;
    } catch (error) {
      insertError = error;
    }

    const savedMsg = insertedMessages?.[0];
    if (insertError || !savedMsg) {
      console.error('Insert message error:', insertError || 'No message returned');
      setMessages(prev => [
        ...prev.filter(m => m.id !== tempUserMsg.id),
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          contentKey: insertError?.message?.includes('timeout')
            ? 'chatMessageSaveTimeout'
            : 'chatMessageSaveFailed',
          created_at: new Date().toISOString(),
          _isError: true,
        },
      ]);
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
    const allMessages = [
      ...messages.filter(m => m.id !== tempUserMsg.id && !m._isError),
      savedMsg,
    ];
    const history = allMessages
      // 当前消息会由 API 作为 message 单独追加，history 不能重复携带。
      .slice(0, -1)
      .slice(-MAX_HISTORY_MESSAGES)
      .map(m => ({ role: m.role, content: m.content }));

    // 直接复用 AuthContext 已缓存的 token，发送链路不再等待 Supabase Auth 锁。
    if (!accessToken) {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        contentKey: 'chatSessionExpired',
        created_at: new Date().toISOString(),
        _isError: true,
      }]);
      return;
    }

    // 发起 SSE 请求
    setIsStreaming(true);
    setStreamingContent('');

    const abortController = new AbortController();
    abortRef.current = abortController;
    let receivedAssistantContent = '';
    let assistantMessageSaved = false;
    const saveReceivedAssistant = (messageId) => {
      if (!receivedAssistantContent || assistantMessageSaved) return;
      assistantMessageSaved = true;
      setMessages(prev => [...prev, {
        id: messageId || `ai-${Date.now()}`,
        role: 'assistant',
        content: receivedAssistantContent,
        created_at: new Date().toISOString(),
      }]);
    };
    let timeoutId = setTimeout(() => abortController.abort('response_timeout'), CHAT_RESPONSE_TIMEOUT_MS);
    const resetResponseTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => abortController.abort('response_timeout'), CHAT_RESPONSE_TIMEOUT_MS);
    };

    try {
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          conversation_id: convId,
          message: trimmed,
          system_prompt: SYSTEM_PROMPT,
          history,
        }),
        signal: abortController.signal,
      };

      let resp;
      try {
        resp = await fetch(CHAT_API_URL, requestOptions);
      } catch (error) {
        if (!CHAT_API_FALLBACK_URL || abortController.signal.aborted) throw error;
        resp = await fetch(CHAT_API_FALLBACK_URL, requestOptions);
      }

      // 处理非流式错误响应
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));

        if (errData.error === 'rate_limit') {
          setIsRateLimited(true);
          setRateLimitMessage('chatRateLimited');
        } else {
          // 添加一个错误提示消息
          setMessages(prev => [...prev, {
            id: `error-${Date.now()}`,
            role: 'assistant',
            contentKey: 'chatRequestFailed',
            created_at: new Date().toISOString(),
            _isError: true,
          }]);
        }

        setIsStreaming(false);
        return;
      }

      // 流式读取 SSE
      resetResponseTimeout();
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';
      let streamCompleted = false;

      readStream: while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        resetResponseTimeout();
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

          try {
            const parsed = JSON.parse(trimmedLine.slice(6));

            if (parsed.done) {
              // 收到业务完成标记后立即结束本地读取，不继续等待连接关闭。
              saveReceivedAssistant(parsed.message_id);
              if (parsed.error === 'persistence_failed') {
                setMessages(prev => [...prev, {
                  id: `error-${Date.now()}`,
                  role: 'assistant',
                  contentKey: 'chatResponseSaveFailed',
                  created_at: new Date().toISOString(),
                  _isError: true,
                }]);
              }
              setStreamingContent('');
              streamCompleted = true;
              break readStream;
            } else if (parsed.content) {
              accumulated += parsed.content;
              receivedAssistantContent = accumulated;
              setStreamingContent(accumulated);
            }
          } catch {
            // 忽略解析失败
          }
        }
      }

      if (!streamCompleted && accumulated) {
        // 部分代理会直接关闭流而不发送 done，仍需把已收到的 AI 文本固化到 messages。
        saveReceivedAssistant();
        setStreamingContent('');
      }

      if (streamCompleted) {
        await reader.cancel().catch(() => {});
      }
    } catch (err) {
      const isTimeout = abortController.signal.reason === 'response_timeout';
      saveReceivedAssistant();

      if (isTimeout || err.name !== 'AbortError') {
        console.error('Chat SSE error:', err);
        setMessages(prev => [...prev, {
          id: `error-${Date.now()}`,
          role: 'assistant',
          contentKey: isTimeout
            ? 'chatResponseTimeout'
            : 'chatNetworkInterrupted',
          created_at: new Date().toISOString(),
          _isError: true,
        }]);
      }
    } finally {
      clearTimeout(timeoutId);
      saveReceivedAssistant();
      setStreamingContent('');
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [isStreaming, currentConversation, messages, createConversation, authUser, accessToken]);

  // ─── 初始化每日计数 ─────────────────────────────

  useEffect(() => {
    if (IS_RATE_LIMIT_DISABLED) return;

    async function initDailyCount() {
      if (!authUser) return;

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const { count, error } = await supabase
        .from('site_chat_messages')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', authUser.id)
        .eq('role', 'user')
        .gte('created_at', today.toISOString());

      if (!error && count !== null) {
        dailyCountRef.current = count;
        if (count >= DAILY_LIMIT) {
          setIsRateLimited(true);
          setRateLimitMessage('chatRateLimited');
        }
      }
    }

    initDailyCount();
  }, [authUser?.id]);

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
