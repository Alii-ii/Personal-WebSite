import ProjectDetailClient from './ProjectDetailClient';
import { getAllProjectSlugs } from '@/contexts/ProjectContext';
import { Suspense } from 'react';

/**
 * 静态导出要求动态路由必须预生成全部路径
 * 注意：该函数不能出现在 "use client" 文件中，因此本文件保持 Server Component，
 * 交互逻辑下沉到 ProjectDetailClient
 */
export async function generateStaticParams() {
  return getAllProjectSlugs().map((slug) => ({ slug }));
}

/**
 * 作品集 L3 页面 - 项目详情
 * @param {Object} props
 * @param {Promise<{slug: string}>} props.params - Next 15 中 params 为 Promise
 */
export default async function ProjectPage({ params }) {
  const { slug } = await params;
  return (
    <Suspense fallback={null}>
      <ProjectDetailClient slug={slug} />
    </Suspense>
  );
}
