"use client";

import { useEffect, useState } from 'react';
import ProjectDetail from '@/components/portfolio/ProjectDetail';

/**
 * L3 客户端外壳
 * 只负责读取 URL hash（L2 下钻时带上的 frameId），其余交互在 ProjectDetail
 * hash 不能在 Server Component 中读取，故单独拆一层
 */
export default function ProjectDetailClient({ slug }) {
  const [initialFrameId, setInitialFrameId] = useState(null);

  useEffect(() => {
    const hash = window.location.hash?.slice(1);
    if (hash) setInitialFrameId(decodeURIComponent(hash));
  }, []);

  return <ProjectDetail slug={slug} initialFrameId={initialFrameId} />;
}
