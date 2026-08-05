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
  const [likesByComment, setLikesByComment] = useState({});
  const [likedCommentIds, setLikedCommentIds] = useState(() => new Set());
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
      const replyPathPrefix = `${targetPath}/comments/`;
      const { data, error: fetchError } = await supabase
        .from('site_comments')
        .select('id, user_id, target_path, content, created_at, site_profiles(nickname, avatar_seed)')
        .or(`target_path.eq.${targetPath},target_path.like.${replyPathPrefix}%`)
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Fetch comments error:', fetchError);
        setError('commentLoadFailed');
        return;
      }

      const nextComments = data || [];
      setComments(nextComments);

      const commentIds = nextComments.map((comment) => comment.id);
      if (!commentIds.length) {
        setLikesByComment({});
        setLikedCommentIds(new Set());
        return;
      }

      const [{ data: likes, error: likesError }, { data: { user } }] = await Promise.all([
        supabase
          .from('site_comment_likes')
          .select('comment_id, user_id')
          .in('comment_id', commentIds),
        supabase.auth.getUser(),
      ]);

      if (likesError) {
        console.error('Fetch comment likes error:', likesError);
        setLikesByComment({});
        setLikedCommentIds(new Set());
        return;
      }

      const counts = {};
      const likedIds = new Set();
      (likes || []).forEach((like) => {
        counts[like.comment_id] = (counts[like.comment_id] || 0) + 1;
        if (user?.id === like.user_id) likedIds.add(like.comment_id);
      });
      setLikesByComment(counts);
      setLikedCommentIds(likedIds);
    } catch (err) {
      console.error('Fetch comments error:', err);
      setError('commentLoadFailed');
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
  const addComment = useCallback(async (content, options = {}) => {
    const trimmed = content?.trim();
    if (!trimmed) {
      return { errorCode: 'commentEmptyError' };
    }
    if (trimmed.length > 500) {
      return { errorCode: 'commentTooLong' };
    }

    // 客户端限流检查
    const now = Date.now();
    recentTimestamps.current = recentTimestamps.current.filter(
      t => now - t < RATE_WINDOW_MS
    );
    if (recentTimestamps.current.length >= RATE_LIMIT) {
      return { errorCode: 'commentRateLimited' };
    }

    try {
      // 获取当前用户
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { errorCode: 'commentSignInRequired' };
      }

      const { parentId, replyToId } = options;
      const commentTargetPath = parentId
        ? `${targetPath}/comments/${parentId}${replyToId ? `/${replyToId}` : ''}`
        : targetPath;
      const { data, error: insertError } = await supabase
        .from('site_comments')
        .insert({
          user_id: user.id,
          target_path: commentTargetPath,
          content: trimmed,
        })
        .select('id, user_id, target_path, content, created_at, site_profiles(nickname, avatar_seed)')
        .single();

      if (insertError) {
        console.error('Insert comment error:', insertError);
        return { errorCode: 'commentSendFailed' };
      }

      // 记录时间戳用于限流
      recentTimestamps.current.push(now);

      // 乐观更新：把新评论追加到列表
      setComments(prev => [...prev, data]);
      return {};
    } catch (err) {
      console.error('Add comment error:', err);
      return { errorCode: 'commentSendFailed' };
    }
  }, [targetPath]);

  const toggleLike = useCallback(async (commentId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { errorCode: 'commentSignInRequired' };

    const wasLiked = likedCommentIds.has(commentId);
    setLikedCommentIds((previous) => {
      const next = new Set(previous);
      if (wasLiked) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
    setLikesByComment((previous) => ({
      ...previous,
      [commentId]: Math.max(0, (previous[commentId] || 0) + (wasLiked ? -1 : 1)),
    }));

    const query = supabase.from('site_comment_likes');
    const { error: likeError } = wasLiked
      ? await query.delete().eq('comment_id', commentId).eq('user_id', user.id)
      : await query.insert({ comment_id: commentId, user_id: user.id });

    if (likeError) {
      console.error('Toggle comment like error:', likeError);
      setLikedCommentIds((previous) => {
        const next = new Set(previous);
        if (wasLiked) next.add(commentId);
        else next.delete(commentId);
        return next;
      });
      setLikesByComment((previous) => ({
        ...previous,
        [commentId]: Math.max(0, (previous[commentId] || 0) + (wasLiked ? 1 : -1)),
      }));
      return { errorCode: 'commentLikeFailed' };
    }

    return {};
  }, [likedCommentIds]);

  // 删除评论：根评论删除时先删除自己拥有的二级回复，再删除根评论。
  // RLS 仍是最终权限边界；若回复属于其他用户，数据库会拒绝，避免产生静默孤儿数据。
  const deleteComment = useCallback(async (commentId) => {
    try {
      const rootPath = `${targetPath}/comments/${commentId}`;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { errorCode: 'commentSignInRequired' };

      const { data: replies, error: replyLookupError } = await supabase
        .from('site_comments')
        .select('id, user_id, target_path')
        .like('target_path', `${rootPath}%`);

      if (replyLookupError) {
        console.error('Lookup comment replies error:', replyLookupError);
        return { errorCode: 'commentDeleteFailed' };
      }

      if (replies?.some((comment) => comment.user_id !== user.id)) {
        return { errorCode: 'commentDeleteHasReplies' };
      }

      if (replies?.length) {
        const replyIds = replies.map((comment) => comment.id);
        const { error: replyDeleteError } = await supabase
          .from('site_comments')
          .delete()
          .in('id', replyIds);

        if (replyDeleteError) {
          console.error('Delete comment replies error:', replyDeleteError);
          return { errorCode: 'commentDeleteFailed' };
        }
      }

      const { error: deleteError } = await supabase
        .from('site_comments')
        .delete()
        .eq('id', commentId);

      if (deleteError) {
        console.error('Delete comment error:', deleteError);
        return { errorCode: 'commentDeleteFailed' };
      }

      setComments((previous) => previous.filter((comment) => (
        comment.id !== commentId && !comment.target_path?.startsWith(rootPath)
      )));
      return {};
    } catch (err) {
      console.error('Delete comment error:', err);
      return { errorCode: 'commentDeleteFailed' };
    }
  }, [targetPath]);

  return {
    comments,
    likesByComment,
    likedCommentIds,
    count: comments.length,
    isLoading,
    error,
    addComment,
    deleteComment,
    toggleLike,
    refresh: fetchComments,
  };
}
