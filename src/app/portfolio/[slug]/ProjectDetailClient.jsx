"use client";

import { useState } from 'react';
import ProjectDetail from '@/components/portfolio/ProjectDetail';

/**
 * L3 客户端外壳
 * 只负责读取 URL hash（L2 下钻时带上的 frameId），其余交互在 ProjectDetail
 * hash 不能在 Server Component 中读取，故单独拆一层
 *
 * 使用 useState 初始化函数同步读取 hash，确保 ProjectDetail 首次渲染时
 * 就拿到正确的 initialFrameId，避免先渲染 index=0 再异步纠正导致的偏移闪烁
 */
export default function ProjectDetailClient({ slug }) {
  const [initialFrameId] = useState(() => {
    if (typeof window === 'undefined') return null;
    const hash = window.location.hash?.slice(1);
    return hash ? decodeURIComponent(hash) : null;
  });
  /*

  */
  return <ProjectDetail slug={slug} initialFrameId={initialFrameId} />;
}
