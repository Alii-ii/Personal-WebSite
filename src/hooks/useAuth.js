"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * 认证 + Profile 管理 Hook
 * 
 * 支持两种登录方式：
 * - 访客：signInAnonymously() 匿名登录 + 昵称
 * - 站长：signInWithEmail() 邮箱密码登录（隐藏入口，快捷键唤出）
 * 
 * 配合 site_profiles 表存储昵称信息。
 * 
 * @returns {{
 *   user: object|null,          - Supabase Auth user 对象
 *   profile: object|null,       - { nickname, avatar_seed }
 *   isLoading: boolean,         - 初始化中
 *   isAuthenticated: boolean,   - 已有 Auth session
 *   hasProfile: boolean,        - 已设置昵称
 *   signIn: (nickname: string) => Promise<{error?: string}>,
 *   signInWithEmail: (email: string, password: string) => Promise<{error?: string}>,
 *   updateNickname: (nickname: string) => Promise<{error?: string}>,
 *   signOut: () => Promise<void>,
 * }}
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 查询 profile
  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('site_profiles')
      .select('nickname, avatar_seed')
      .eq('id', userId)
      .limit(1);

    if (error) {
      console.error('Failed to fetch profile:', error);
      return null;
    }
    return data?.[0] || null;
  }, []);

  // 初始化：恢复 session + 监听 auth 变化
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (mounted && currentUser) {
          setUser(currentUser);
          const p = await fetchProfile(currentUser.id);
          if (mounted) setProfile(p);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    init();

    // 监听 auth 状态变化（登录/登出/token 刷新）
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          const p = await fetchProfile(session.user.id);
          if (mounted) setProfile(p);
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // 检查昵称是否已被占用
  const checkNicknameAvailable = useCallback(async (nickname, excludeUserId = null) => {
    let query = supabase
      .from('site_profiles')
      .select('id')
      .eq('nickname', nickname);

    if (excludeUserId) {
      query = query.neq('id', excludeUserId);
    }

    const { data } = await query.limit(1);
    return !data || data.length === 0;
  }, []);

  // 匿名登录 + 创建 profile
  const signIn = useCallback(async (nickname) => {
    const trimmed = nickname?.trim();
    if (!trimmed || trimmed.length > 20) {
      return { error: '昵称需要 1-20 个字符' };
    }

    // 昵称查重
    const available = await checkNicknameAvailable(trimmed);
    if (!available) {
      return { error: '该昵称已被使用' };
    }

    try {
      // 1. 匿名登录
      const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
      if (authError) {
        return { error: '登录失败，请重试' };
      }

      const userId = authData.user.id;

      // 2. 创建 profile
      const { error: profileError } = await supabase
        .from('site_profiles')
        .insert({
          id: userId,
          nickname: trimmed,
          avatar_seed: userId,
        });

      if (profileError) {
        console.error('Create profile error:', profileError);
        // UNIQUE 约束冲突 (23505) 也返回友好提示
        if (profileError.code === '23505') {
          return { error: '该昵称已被使用' };
        }
        return { error: '创建个人信息失败' };
      }

      // 3. 更新本地状态
      setUser(authData.user);
      setProfile({ nickname: trimmed, avatar_seed: userId });
      return {};
    } catch (err) {
      console.error('Sign in error:', err);
      return { error: '登录失败，请重试' };
    }
  }, [checkNicknameAvailable]);

  // 更新昵称
  const updateNickname = useCallback(async (nickname) => {
    const trimmed = nickname?.trim();
    if (!trimmed || trimmed.length > 20) {
      return { error: '昵称需要 1-20 个字符' };
    }

    if (!user) {
      return { error: '请先登录' };
    }

    // 昵称查重（排除自己）
    const available = await checkNicknameAvailable(trimmed, user.id);
    if (!available) {
      return { error: '该昵称已被使用' };
    }

    try {
      const { error } = await supabase
        .from('site_profiles')
        .update({ nickname: trimmed })
        .eq('id', user.id);

      if (error) {
        console.error('Update nickname error:', error);
        if (error.code === '23505') {
          return { error: '该昵称已被使用' };
        }
        return { error: '更新失败' };
      }

      setProfile(prev => prev ? { ...prev, nickname: trimmed } : null);
      return {};
    } catch (err) {
      console.error('Update nickname error:', err);
      return { error: '更新失败' };
    }
  }, [user, checkNicknameAvailable]);

  // 邮箱登录（站长专用）
  const signInWithEmail = useCallback(async (email, password) => {
    if (!email || !password) {
      return { error: '请输入邮箱和密码' };
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return { error: '邮箱或密码错误' };
      }

      const userId = authData.user.id;

      // 查询已有 profile（站长账号在 Dashboard 提前创建好 profile）
      const existingProfile = await fetchProfile(userId);

      if (existingProfile) {
        setUser(authData.user);
        setProfile(existingProfile);
        return { profile: existingProfile };
      }

      // 首次邮箱登录如果没有 profile，自动创建（role 默认 visitor，站长需在 DB 手动改）
      const { error: profileError } = await supabase
        .from('site_profiles')
        .insert({
          id: userId,
          nickname: email.split('@')[0],
          avatar_seed: userId,
        });

      if (profileError) {
        console.error('Create profile for email user:', profileError);
        // 不阻断登录，profile 可以之后补
      }

      setUser(authData.user);
      const p = await fetchProfile(userId);
      setProfile(p);
      return { profile: p };
    } catch (err) {
      console.error('Email sign in error:', err);
      return { error: '登录失败，请重试' };
    }
  }, [fetchProfile]);

  // 登出
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  return {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    hasProfile: !!profile,
    signIn,
    signInWithEmail,
    updateNickname,
    signOut,
  };
}
