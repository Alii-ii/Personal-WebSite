"use client";

import { createContext, useContext, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

const AuthContext = createContext(null);

/**
 * Auth 状态全局 Provider
 * 
 * 包裹在 layout 层，让任何组件都能通过 useAuthContext() 访问认证状态。
 * 内部调用 useAuth()，只初始化一次。
 * 
 * 隐藏快捷键：
 * - 连按 3 次 Cmd/Ctrl → 站长登录
 * - 连按 3 次 Shift → 退出登录
 */
export function AuthProvider({ children }) {
  const auth = useAuth();

  const handleOwnerLogin = useCallback(async () => {
    if (auth.isAuthenticated) {
      console.log('✅ 已登录:', auth.profile?.nickname || 'unknown');
      return;
    }
    const result = await auth.signInWithEmail('alii.wong@foxmail.com', 'alii.wong');
    if (result.error) {
      console.error('❌ Owner login failed:', result.error);
    } else {
      console.log('✅ 登录成功:', result.profile?.nickname || '');
    }
  }, [auth.signInWithEmail, auth.isAuthenticated, auth.profile]);

  const handleLogout = useCallback(async () => {
    if (!auth.isAuthenticated) {
      console.log('ℹ️ 未登录');
      return;
    }
    await auth.signOut();
    console.log('👋 已退出');
  }, [auth.signOut, auth.isAuthenticated]);

  useEffect(() => {
    let metaPresses = 0;
    let lastMetaTime = 0;
    let shiftPresses = 0;
    let lastShiftTime = 0;
    const THRESHOLD = 500;

    const handleKeyUp = (e) => {
      if (e.key === 'Meta' || e.key === 'Control') {
        const now = Date.now();
        if (now - lastMetaTime > THRESHOLD) metaPresses = 0;
        metaPresses++;
        lastMetaTime = now;
        if (metaPresses >= 3) {
          metaPresses = 0;
          handleOwnerLogin();
        }
      } else if (e.key === 'Shift') {
        const now = Date.now();
        if (now - lastShiftTime > THRESHOLD) shiftPresses = 0;
        shiftPresses++;
        lastShiftTime = now;
        if (shiftPresses >= 3) {
          shiftPresses = 0;
          handleLogout();
        }
      }
    };

    const handleKeyDown = (e) => {
      if (e.key !== 'Meta' && e.key !== 'Control' && e.key !== 'Shift'
        && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
        metaPresses = 0;
        shiftPresses = 0;
      }
    };

    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleOwnerLogin, handleLogout]);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * 消费 AuthContext 的 Hook
 * @returns {ReturnType<typeof useAuth>}
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
