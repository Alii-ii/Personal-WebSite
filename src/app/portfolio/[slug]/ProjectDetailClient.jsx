"use client";

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProjectDetail from '@/components/portfolio/ProjectDetail';

/**
 * L3 客户端外壳
 * 只负责读取 URL 中的 frame 定位参数，其余交互在 ProjectDetail。
 * query 不会触发浏览器原生锚点滚动，比 hash 更适合这里的受控定位。
 */
export default function ProjectDetailClient({ slug }) {
  const searchParams = useSearchParams();
  const frameFromQuery = searchParams.get('frame');
  const [frameFromHash, setFrameFromHash] = useState(null);

  useEffect(() => {
    // 兼容旧 hash 链接；新逻辑优先使用 query 参数，避免原生锚点跳转干扰布局。
    const readHash = () => {
      const hash = window.location.hash?.slice(1);
      setFrameFromHash(hash ? decodeURIComponent(hash) : null);
    };

    readHash();
    window.addEventListener('hashchange', readHash);
    return () => window.removeEventListener('hashchange', readHash);
  }, [slug]);

  const initialFrameId = useMemo(() => frameFromQuery || frameFromHash, [frameFromQuery, frameFromHash]);

  return (
    <ProjectDetail
      key={`${slug}:${initialFrameId || ''}`}
      slug={slug}
      initialFrameId={initialFrameId}
    />
  );
}
