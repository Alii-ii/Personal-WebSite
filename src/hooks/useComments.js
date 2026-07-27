"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * 评论 CRUD Hook
 * 
 * 通过 target_path 查询和管理评论。
 * 评论查询自动 JOIN site_profiles 获取昵称和头像信息。
 * 
 * @param {string} targetPath - 评论目标路径（如 'gallery', 'gallery/20250910-180822'）
 * @returns {{
 *   comments: Array,
 *   count: number,
 *   isLoading: boolean,
 *   error: string|null,
 *   addComment: (content: string) => Promise<{error?: string}>,
 *   deleteComment: (commentId: string) => Promise<{error?: string}>,
 *   refresh: () => Promise<void>,
 * }}
 */
export function useComments(targetPath) {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 客户端限流：同一用户 1 分钟内最多 5 条
  const recentTimestamps = useRef([]);
  const RATE_LIMIT = 5;
  const RATE_WINDOW_MS = 60 * 1000;

  // 查询评论列表
  const fetchComments = useCallback(async () => {
    if (!targetPath) return;

    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('site_comments')
        .select('id, user_id, content, created_at, site_profiles(nickname, avatar_seed)')
        .eq('target_path', targetPath)
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Fetch comments error:', fetchError);
        setError('加载评论失败');
        return;
      }

      setComments(data || []);
    } catch (err) {
      console.error('Fetch comments error:', err);
      setError('加载评论失败');
    } finally {
      setIsLoading(false);
    }
  }, [targetPath]);

  // 初始化加载
  useEffect(() => {
    setIsLoading(true);
    fetchComments();
  }, [fetchComments]);

  // 新增评论
  const addComment = useCallback(async (content) => {
    const trimmed = content?.trim();
    if (!trimmed) {
      return { error: '评论内容不能为空' };
    }
    if (trimmed.length > 500) {
      return { error: '评论最多 500 字符' };
    }

    // 客户端限流检查
    const now = Date.now();
    recentTimestamps.current = recentTimestamps.current.filter(
      t => now - t < RATE_WINDOW_MS
    );
    if (recentTimestamps.current.length >= RATE_LIMIT) {
      return { error: '评论太频繁，请稍后再试' };
    }

    try {
      // 获取当前用户
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: '请先登录' };
      }

      const { data, error: insertError } = await supabase
        .from('site_comments')
        .insert({
          user_id: user.id,
          target_path: targetPath,
          content: trimmed,
        })
        .select('id, user_id, content, created_at, site_profiles(nickname, avatar_seed)')
        .single();

      if (insertError) {
        console.error('Insert comment error:', insertError);
        return { error: '发送失败，请重试' };
      }

      // 记录时间戳用于限流
      recentTimestamps.current.push(now);

      // 乐观更新：把新评论追加到列表
      setComments(prev => [...prev, data]);
      return {};
    } catch (err) {
      console.error('Add comment error:', err);
      return { error: '发送失败，请重试' };
    }
  }, [targetPath]);

  // 删除评论
  const deleteComment = useCallback(async (commentId) => {
    try {
      const { error: deleteError } = await supabase
        .from('site_comments')
        .delete()
        .eq('id', commentId);

      if (deleteError) {
        console.error('Delete comment error:', deleteError);
        return { error: '删除失败' };
      }

      // 乐观更新：从列表中移除
      setComments(prev => prev.filter(c => c.id !== commentId));
      return {};
    } catch (err) {
      console.error('Delete comment error:', err);
      return { error: '删除失败' };
    }
  }, []);

  return {
    comments,
    count: comments.length,
    isLoading,
    error,
    addComment,
    deleteComment,
    refresh: fetchComments,
  };
}
