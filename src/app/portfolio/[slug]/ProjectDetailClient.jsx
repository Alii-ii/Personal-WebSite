"use client";

import { useEffect, useState } from 'react';
import ProjectDetail from '@/components/portfolio/ProjectDetail';

/**
 * L3 客户端外壳
 * 只负责读取 URL 中的 frame 定位参数，其余交互在 ProjectDetail。
 * query 不会触发浏览器原生锚点滚动，比 hash 更适合这里的受控定位。
 */
export default function ProjectDetailClient({ slug }) {
  const [initialFrameId, setInitialFrameId] = useState(null);
  const [initialEnterDir, setInitialEnterDir] = useState(null);
  const [commentOpen, setCommentOpen] = useState(false);

  useEffect(() => {
    // 兼容 query/hash 两种定位参数，优先 query（新逻辑）。
    const readFromLocation = () => {
      const query = new URLSearchParams(window.location.search);
      const queryFrame = query.get('frame');
      const queryEnterDir = query.get('enterDir');
      const queryComments = query.get('comments');
      const hash = window.location.hash?.slice(1);
      const hashFrame = hash ? decodeURIComponent(hash) : null;
      setInitialFrameId(queryFrame || hashFrame || null);
      setInitialEnterDir(queryEnterDir === 'next' || queryEnterDir === 'prev' ? queryEnterDir : null);
      if (queryComments === 'open') setCommentOpen(true);
    };

    readFromLocation();
    window.addEventListener('hashchange', readFromLocation);
    window.addEventListener('popstate', readFromLocation);
    return () => {
      window.removeEventListener('hashchange', readFromLocation);
      window.removeEventListener('popstate', readFromLocation);
    };
  }, [slug]);

  return (
    <ProjectDetail
      key={`${slug}:${initialFrameId || ''}:${initialEnterDir || ''}`}
      slug={slug}
      initialFrameId={initialFrameId}
      initialEnterDir={initialEnterDir}
      commentOpen={commentOpen}
      onCommentOpenChange={setCommentOpen}
    />
  );
}
