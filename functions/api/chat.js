/**
 * Cloudflare Pages Function — AI Chat Proxy
 *
 * POST /api/chat
 *
 * 职责：
 * 1. 验证 Supabase JWT
 * 2. 查询每日消息限额
 * 3. 调用 DeepSeek API（streaming）
 * 4. SSE 流式返回前端
 * 5. 流结束后将 AI 回复写入 Supabase
 */

const DAILY_LIMIT = 25;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';

/**
 * 验证 Supabase JWT 并提取 user_id
 */
async function verifyJWT(authHeader, supabaseUrl, supabaseServiceKey) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Missing or invalid Authorization header' };
  }

  const token = authHeader.replace('Bearer ', '');

  // 用 service key 调用 Supabase Auth API 验证 token
  const resp = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'apikey': supabaseServiceKey,
    },
  });

  if (!resp.ok) {
    return { error: 'Invalid or expired token' };
  }

  const user = await resp.json();
  return { userId: user.id, token };
}

/**
 * 查询用户今日消息计数
 */
async function getDailyMessageCount(supabaseUrl, supabaseApiKey, accessToken, userId) {
  // 获取今天零点（UTC）
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const url = new URL(`${supabaseUrl}/rest/v1/site_chat_messages`);
  url.searchParams.set('select', 'id');
  url.searchParams.set('user_id', `eq.${userId}`);
  url.searchParams.set('role', 'eq.user');
  url.searchParams.set('created_at', `gte.${todayISO}`);

  const resp = await fetch(url.toString(), {
    headers: {
      'apikey': supabaseApiKey,
      'Authorization': `Bearer ${accessToken}`,
      'Prefer': 'count=exact',
      'Range-Unit': 'items',
      'Range': '0-0',
    },
  });

  // Supabase 返回 Content-Range header: 0-0/N
  const contentRange = resp.headers.get('Content-Range');
  if (contentRange) {
    const match = contentRange.match(/\/(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
  }

  // fallback: 计算返回的数据长度
  const data = await resp.json();
  return Array.isArray(data) ? data.length : 0;
}

/**
 * 将 AI 回复写入 Supabase
 */
async function saveAssistantMessage(supabaseUrl, supabaseServiceKey, conversationId, userId, content) {
  const resp = await fetch(`${supabaseUrl}/rest/v1/site_chat_messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      conversation_id: conversationId,
      user_id: userId,
      role: 'assistant',
      content,
    }),
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    console.error('Failed to save assistant message:', errorText);
    throw new Error(`Failed to save assistant message (${resp.status})`);
  }

  return resp;
}

/**
 * 更新会话的 updated_at
 */
async function touchConversation(supabaseUrl, supabaseServiceKey, conversationId) {
  await fetch(`${supabaseUrl}/rest/v1/site_chat_conversations?id=eq.${conversationId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
    },
    body: JSON.stringify({ updated_at: new Date().toISOString() }),
  });
}

/**
 * 主处理函数
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // 环境变量
  const DEEPSEEK_API_KEY = env.DEEPSEEK_API_KEY;
  const SUPABASE_URL = env.SUPABASE_URL || 'https://iebesloxnjjrbrwkyhpu.supabase.co';
  const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_KEY;
  const SUPABASE_API_KEY = env.SUPABASE_ANON_KEY || SUPABASE_SERVICE_KEY;
  const IS_RATE_LIMIT_DISABLED = env.DISABLE_CHAT_RATE_LIMIT === 'true';

  if (!DEEPSEEK_API_KEY || !SUPABASE_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'server_error', message: '服务配置不完整' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  // 1. 验证 JWT
  const authResult = await verifyJWT(
    request.headers.get('Authorization'),
    SUPABASE_URL,
    SUPABASE_API_KEY
  );

  if (authResult.error) {
    return new Response(
      JSON.stringify({ error: 'auth_error', message: '请先登录' }),
      { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  const { userId, token: accessToken } = authResult;

  // 2. 解析请求体
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'bad_request', message: '无效的请求格式' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  const { conversation_id, message, system_prompt, history = [] } = body;

  if (!conversation_id || !message || !system_prompt) {
    return new Response(
      JSON.stringify({ error: 'bad_request', message: '缺少必要参数' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  // 3. 生产环境限额检查；本地联调可通过环境变量关闭。
  if (!IS_RATE_LIMIT_DISABLED) {
    const dailyCount = await getDailyMessageCount(
      SUPABASE_URL,
      SUPABASE_API_KEY,
      accessToken,
      userId
    );

    if (dailyCount >= DAILY_LIMIT) {
      return new Response(
        JSON.stringify({ error: 'rate_limit', message: '今天聊得够多啦，明天再来吧 ☕' }),
        { status: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
  }

  // 4. 拼装 DeepSeek 请求
  const messages = [
    { role: 'system', content: system_prompt },
    ...history,
    { role: 'user', content: message },
  ];

  let deepseekResp;
  try {
    deepseekResp = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages,
        stream: true,
        temperature: 0.8,
        max_tokens: 1024,
      }),
    });
  } catch (err) {
    const upstreamError = err instanceof Error ? err.name : 'UnknownError';
    console.error('DeepSeek API network error:', upstreamError);
    return new Response(
      JSON.stringify({
        error: 'deepseek_network_error',
        upstream_error: upstreamError,
        message: 'Alii 走神了，晚点再来试试吧…',
      }),
      { status: 502, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  if (!deepseekResp.ok) {
    console.error('DeepSeek API HTTP error:', deepseekResp.status);
    await deepseekResp.body?.cancel();
    return new Response(
      JSON.stringify({
        error: 'deepseek_http_error',
        upstream_status: deepseekResp.status,
        message: 'Alii 走神了，晚点再来试试吧…',
      }),
      { status: 502, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  // 5. SSE 流式转发
  let fullResponse = '';

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  // 后台处理流
  const streamPromise = (async () => {
    const reader = deepseekResp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let upstreamCompleted = false;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const data = trimmed.slice(6);
          if (data === '[DONE]') {
            // 等模型回复持久化完成后再通知前端结束，避免前端取消读取时中断写库。
            upstreamCompleted = true;
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullResponse += delta;
              await writer.write(
                encoder.encode(`data: ${JSON.stringify({ content: delta, done: false })}\n\n`)
              );
            }
          } catch {
            // 忽略解析失败的行
          }
        }
      }
    } catch (err) {
      console.error('Stream processing error:', err);
    } finally {
      // 6. 先保存 AI 回复，再发送完成标记。前端收到 done 后会取消读取，
      // 因此持久化必须发生在 done 之前，不能放到 writer.close() 之后。
      let persistenceError = null;
      if (fullResponse) {
        if (!SUPABASE_SERVICE_KEY) {
          persistenceError = new Error('SUPABASE_SERVICE_KEY is missing');
          console.error('Assistant message persistence error:', persistenceError);
        } else {
          try {
            await saveAssistantMessage(
              SUPABASE_URL,
              SUPABASE_SERVICE_KEY,
              conversation_id,
              userId,
              fullResponse
            );
            await touchConversation(SUPABASE_URL, SUPABASE_SERVICE_KEY, conversation_id);
          } catch (error) {
            persistenceError = error;
            console.error('Assistant message persistence error:', error);
          }
        }
      }

      if (upstreamCompleted) {
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({
            content: '',
            done: true,
            persisted: !persistenceError,
            error: persistenceError ? 'persistence_failed' : undefined,
          })}\n\n`)
        );
      }
      await writer.close();
    }
  })();

  // 不等待 streamPromise 完成，让 CF Workers 在后台处理
  context.waitUntil(streamPromise);

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      ...corsHeaders,
    },
  });
}

/**
 * 处理 CORS preflight
 */
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
