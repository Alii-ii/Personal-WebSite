"use client";

// 项目导航 hook：管理项目数据、tab/页码状态，以及跨 tab、跨项目的前后翻页。
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getProjectBySlug,
  getProjectNeighbors,
  getProjectsByCategory,
  hasProjectPage,
} from '@/contexts/ProjectContext';

const getInitialSelection = (project, initialFrameId) => {
  if (!project) return { tabKey: null, index: 0 };

  const allFrames = project.frames || [];
  const targetFrame = initialFrameId
    ? allFrames.find((frame) => frame.id === initialFrameId)
    : null;
  const tabKey = targetFrame?.tab ?? project.tabs?.[0]?.key ?? null;
  const scopedFrames = tabKey ? allFrames.filter((frame) => frame.tab === tabKey) : allFrames;

  return {
    tabKey,
    index: targetFrame
      ? Math.max(0, scopedFrames.findIndex((frame) => frame.id === targetFrame.id))
      : 0,
  };
};

const getProjectEdgeFrameId = (targetSlug, edge) => {
  const targetProject = getProjectBySlug(targetSlug);
  if (!hasProjectPage(targetProject)) return null;

  const allFrames = targetProject.frames || [];
  const visibleTabs = (targetProject.tabs || []).filter((tab) =>
    allFrames.some((frame) => frame.tab === tab.key),
  );
  if (!visibleTabs.length) return allFrames[0]?.id ?? null;

  const targetTab = edge === 'end' ? visibleTabs[visibleTabs.length - 1] : visibleTabs[0];
  const scopedFrames = allFrames.filter((frame) => frame.tab === targetTab.key);
  if (!scopedFrames.length) return null;
  return edge === 'end' ? scopedFrames[scopedFrames.length - 1].id : scopedFrames[0].id;
};

export const useProjectNavigation = ({
  slug,
  initialFrameId,
  commentOpen,
  onCommentOpenChange,
}) => {
  const router = useRouter();
  const project = useMemo(() => getProjectBySlug(slug), [slug]);
  const groups = useMemo(() => getProjectsByCategory(), []);
  const neighbors = useMemo(() => getProjectNeighbors(slug), [slug]);
  const initialSelection = useMemo(
    () => getInitialSelection(project, initialFrameId),
    [project, initialFrameId],
  );

  const [activeTab, setActiveTab] = useState(initialSelection.tabKey);
  const [activeIndex, setActiveIndex] = useState(initialSelection.index);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setActiveTab(initialSelection.tabKey);
    setActiveIndex(initialSelection.index);
  }, [initialSelection.tabKey, initialSelection.index]);

  const visibleTabs = useMemo(() => {
    const allFrames = project?.frames || [];
    return (project?.tabs || []).filter((tab) =>
      allFrames.some((frame) => frame.tab === tab.key),
    );
  }, [project]);

  const frames = useMemo(() => {
    const allFrames = project?.frames || [];
    return activeTab ? allFrames.filter((frame) => frame.tab === activeTab) : allFrames;
  }, [project, activeTab]);

  const preloadUrls = useMemo(
    () =>
      (project?.frames || [])
        .filter((frame) => frame.type === 'prototype' && frame.url)
        .map((frame) => frame.url),
    [project],
  );

  const activeFrameId = frames[activeIndex]?.id ?? null;

  const latestStateRef = useRef({});
  latestStateRef.current = {
    activeIndex,
    activeTab,
    frames,
    visibleTabs,
    neighbors,
    allFrames: project?.frames || [],
  };

  const goProject = useCallback(
    (targetSlug, options = {}) => {
      if (!targetSlug || !hasProjectPage(getProjectBySlug(targetSlug))) return;

      const search = new URLSearchParams();
      if (options.frameId) search.set('frame', options.frameId);
      if (options.motionDir) search.set('enterDir', options.motionDir);
      if (commentOpen) search.set('comments', 'open');
      const query = search.toString() ? `?${search.toString()}` : '';
      router.push(`/portfolio/${targetSlug}${query}`);
    },
    [commentOpen, router],
  );

  const goPrevPage = useCallback(() => {
    const state = latestStateRef.current;
    if (state.activeIndex > 0) {
      setActiveIndex((previous) => previous - 1);
      return;
    }

    const tabIndex = state.visibleTabs.findIndex((tab) => tab.key === state.activeTab);
    if (tabIndex > 0) {
      const previousTab = state.visibleTabs[tabIndex - 1].key;
      const previousFrames = state.allFrames.filter((frame) => frame.tab === previousTab);
      setActiveTab(previousTab);
      setActiveIndex(previousFrames.length - 1);
      return;
    }

    const previousSlug = state.neighbors?.prev?.slug;
    if (previousSlug) {
      goProject(previousSlug, { frameId: getProjectEdgeFrameId(previousSlug, 'end') });
    }
  }, [goProject]);

  const goNextPage = useCallback(() => {
    const state = latestStateRef.current;
    if (state.activeIndex < state.frames.length - 1) {
      setActiveIndex((previous) => previous + 1);
      return;
    }

    const tabIndex = state.visibleTabs.findIndex((tab) => tab.key === state.activeTab);
    if (tabIndex < state.visibleTabs.length - 1) {
      setActiveTab(state.visibleTabs[tabIndex + 1].key);
      setActiveIndex(0);
      return;
    }

    const nextSlug = state.neighbors?.next?.slug;
    if (nextSlug) {
      goProject(nextSlug, { frameId: getProjectEdgeFrameId(nextSlug, 'start') });
    }
  }, [goProject]);

  const changeTab = useCallback((tabKey) => {
    setActiveTab(tabKey);
    setActiveIndex(0);
  }, []);

  const goBack = useCallback(() => router.push('/portfolio'), [router]);
  const setCommentOpen = useCallback(
    (nextValue) => {
      const next =
        typeof nextValue === 'function'
          ? nextValue(commentOpen)
          : nextValue;
      onCommentOpenChange(Boolean(next));
    },
    [commentOpen, onCommentOpenChange],
  );
  const toggleComment = useCallback(
    () => onCommentOpenChange(!commentOpen),
    [commentOpen, onCommentOpenChange],
  );

  return {
    project,
    groups,
    neighbors,
    frames,
    visibleTabs,
    preloadUrls,
    activeTab,
    activeIndex,
    activeFrameId,
    menuOpen,
    commentOpen,
    setActiveIndex,
    setMenuOpen,
    setCommentOpen,
    changeTab,
    goProject,
    goPrevPage,
    goNextPage,
    goBack,
    toggleComment,
  };
};
