"use client";

import { useState } from 'react';
import Footer from '@/components/footer';
import IconTextButton from '@/components/icon-text-botton';
import ResumeAbilityItem from '@/components/resume/ResumeAbilityItem';
import ResumeEducationItem from '@/components/resume/ResumeEducationItem';
import ResumeExperienceItem from '@/components/resume/ResumeExperienceItem';
import ResumeNavSections from '@/components/resume/ResumeNavSections';
import DotGrid from '@/effects/DotGrid';
import { useThemeColors } from '@/hooks/useThemeColors';
import { MailIcon, ChatsIcon, FigmaIcon } from '@/public/icons';

/** 复制文本到剪贴板 */
const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    return true;
  } catch (err) {
    console.error('复制失败', err);
    return false;
  }
};

/** Sidebar 联系方式按钮组 */
function SidebarContactButtons() {
  const [copyStates, setCopyStates] = useState({ wechat: false, email: false });
  const [tooltipStates, setTooltipStates] = useState({ wechat: false, email: false });
  const [figmaHovered, setFigmaHovered] = useState(false);

  const handleCopySuccess = (type) => {
    setCopyStates(prev => ({ ...prev, [type]: true }));
    setTooltipStates(prev => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setCopyStates(prev => ({ ...prev, [type]: false }));
      setTooltipStates(prev => ({ ...prev, [type]: false }));
    }, 1000);
  };

  return (
    <div className="mt-4 flex flex-wrap gap-0.5">
      <IconTextButton
        key={`wechat-${copyStates.wechat}`}
        text=""
        icon={<ChatsIcon />}
        variant="ghost"
        size="md"
        tooltip={copyStates.wechat ? '已复制 ✓' : '复制微信号'}
        forceTooltipOpen={tooltipStates.wechat}
        onClick={async () => {
          const success = await copyToClipboard('13632359551');
          if (success) handleCopySuccess('wechat');
        }}
      />
      <IconTextButton
        key={`email-${copyStates.email}`}
        text=""
        icon={<MailIcon />}
        variant="ghost"
        size="md"
        tooltip={copyStates.email ? '已复制 ✓' : '复制邮箱'}
        forceTooltipOpen={tooltipStates.email}
        onClick={async () => {
          const success = await copyToClipboard('alii.wong@foxmail.com');
          if (success) handleCopySuccess('email');
        }}
      />
      <div
        onMouseEnter={() => setFigmaHovered(true)}
        onMouseLeave={() => setFigmaHovered(false)}
        className="figma-icon-wrapper"
        style={{ filter: figmaHovered ? 'none' : 'grayscale(1)', transition: 'filter 0.2s ease' }}
      >
        <IconTextButton
          text=""
          icon={<FigmaIcon />}
          variant="ghost"
          size="md"
          tooltip="Figma Portfolio"
          onClick={() => { window.open('https://www.figma.com/design/OsMjuOsAZiPIMPK0ztUVR0/Alii---UX-Portfolio-2024', '_blank'); }}
        />
      </div>
    </div>
  );
}

/** 履历区块配置：id、标题、内容 */
const RESUME_SECTIONS = [
  {
    id: 'education',
    title: '教育背景',
    content: (
      <div className="flex flex-wrap gap-8">
        <ResumeEducationItem
          time="2022.2 - 2023.2"
          content={
            <>
              <p><span className="font-bold">服务设计</span> 微专业</p>
              <p className="font-regular text-[14px] md:text-[16px] text-tertiary">腾讯 CDC 校企合作</p>
            </>
          }
        />
        <ResumeEducationItem
          time="2020.9 - 2024.6"
          content={
            <>
              <p><span className="font-bold">视觉传达</span> 双学位</p>
              <p className="font-regular text-[14px] md:text-[16px] text-tertiary">深圳大学</p>
            </>
          }
        />
        <ResumeEducationItem
          time="2019.9 - 2024.6"
          content={
            <>
              <p><span className="font-bold">市场营销</span> 本科</p>
              <p className="font-regular text-[14px] md:text-[16px] text-tertiary">深圳大学</p>
            </>
          }
        />
      </div>
    ),
  },
  {
    id: 'work',
    title: '工作经历',
    content: (
      <ResumeExperienceItem
        position="体验设计"
        tags={[]}
        company="美团·基础研发平台设计中心"
        time="2024.6 – 至今(2年+)"
        summary="业务团队 ~100 人，工程师文化驱动、迭代节奏快、创业团队氛围。"
        description={
          <>
            {/* 主产品设计 | NoCode */}
            <div className="flex items-center gap-2 mt-1 mb-0.5">
              <span className="px-2 py-0.5 text-[12px] font-regular rounded border border-tertiary/30 text-tertiary bg-tertiary/5 whitespace-nowrap">主产品设计</span>
              <span className="font-bold text-main opacity-80">(对话生成应用) NoCode</span>
              <span className="px-2 py-0.5 text-[12px] font-regular rounded border border-green-stroke/40 text-green-stroke bg-green-stroke/5 whitespace-nowrap">Web</span>
            </div>
            <ul className="list-disc pl-5">
              <li>
                <span className="font-bold">0 → 2.x 全链路产品设计：</span>
                随着迭代定义并维护合理的<span className="text-green-stroke">信息架构 & 交互路径</span>，负责 10+ 核心模块设计(部署/版本/可视化编辑/数据库/权限/域名/Git导入等)，历经 对外发布、移动端适配、国际化适配 等产品阶段
              </li>
              <li>
                <span className="font-bold">主导 Design Mode 原创模块 0-1 上线：</span>
                针对"前端精调不便"痛点，验证可视化代码编辑器业务价值，被多个自家产品复用
              </li>
            </ul>

            {/* 产品设计 1/2 | AI Coding Agent 产品线 */}
            <div className="flex items-center gap-2 mt-3 mb-0.5">
              <span className="px-2 py-0.5 text-[12px] font-regular rounded border border-tertiary/30 text-tertiary bg-tertiary/5 whitespace-nowrap">产品设计 1/2</span>
              <span className="font-bold text-main opacity-80">AI Coding Agent 产品线</span>
              <span className="px-2 py-0.5 text-[12px] font-regular rounded border border-green-stroke/40 text-green-stroke bg-green-stroke/5 whitespace-nowrap">Desktop</span>
            </div>
            <ul className="list-disc pl-5">
              <li><span className="font-bold">CatDesk ADE：</span>Agent Teams / Dynamic Workflow / 全局快捷操作 及各交互优化</li>
              <li><span className="font-bold">CatPaw IDE：</span>inline Chat / Diff & Accept 节点 / Spec Mode / Dark Mode 等</li>
            </ul>

            {/* 设计工程师 | 内部工程实践 */}
            <div className="flex items-center gap-2 mt-3 mb-0.5">
              <span className="px-2 py-0.5 text-[12px] font-regular rounded border border-tertiary/30 text-tertiary bg-tertiary/5 whitespace-nowrap">设计工程师</span>
              <span className="font-bold text-main opacity-80">内部工程实践</span>
            </div>
            <ul className="list-disc pl-5">
              <li>
                <span className="font-bold">多产品/多仓/多环境</span> 中通过真实 PR 推进交付：在既有功能框架上优化样式/交互，抽象并复用前台组件，自建分支 → 改动调试 → 自测+PR → CR+QA → 跟版上线(30+)
              </li>
              <li>
                <span className="font-bold">运营性网站开发：</span>(独立)设计部 AI Coding 作品征集、(合作)PDE 成长中心
              </li>
              <li>
                <span className="font-bold">独立产品开发 Cursor for Documentation：</span>探索复杂交互+真实技术逻辑的实现上限
              </li>
            </ul>

            {/* 课程讲师 | 课程分享与组织建设 */}
            <div className="flex items-center gap-2 mt-3 mb-0.5">
              <span className="px-2 py-0.5 text-[12px] font-regular rounded border border-tertiary/30 text-tertiary bg-tertiary/5 whitespace-nowrap">课程讲师</span>
              <span className="font-bold text-main opacity-80">课程分享与组织建设</span>
            </div>
            <ul className="list-disc pl-5">
              <li>
                <span className="font-bold">课程/文章分享：</span>直播 UV 峰值 700+ / 均值 200+ / 文档 PV 2300+
                <br />
                《AI Coding 入门概览》《工程化设计思维》《Spec Coding 与工程师协作艺术》等
              </li>
              <li>
                发起 & 运营 "设计师 AI Coding 兴趣小组" 覆盖 40%+ 内部设计师(共 600+人)
              </li>
            </ul>
          </>
        }
      />
    ),
  },
  // {
  //   id: 'abilities',
  //   title: '核心能力',
  //   content: (
  //     <div className="flex flex-col gap-4">
  //       <ResumeAbilityItem
  //         icon="🛠"
  //         title="Craft & Build"
  //         subtitle="0-1 产品构建"
  //         description="擅长在没有标准答案的场景定义产品方案。NoCode 平台从概念到上线全程主导，独立完成 10+ 核心模块的产品设计（内外月活峰值 10W+）；CatDesk Agent Teams 在行业无参照时建立交互范式。代码能力服务于设计落地——在真实多仓多环境中与 RD 协作，提交 Production Ready 的 UI/UX 优化代码。Side Project VibeWriting（AI 文档工作台）实现设计稿与代码 100% 对齐，已上线 inline diff + inline chat 交互，原生支持 CLI 及 Agent 使用场景。"
  //       />
  //       <ResumeAbilityItem
  //         icon="🧠"
  //         title="逻辑与抽象"
  //         subtitle="复杂系统建模"
  //         description="代码组件化治理思维、设计稿极度代码友好；擅长给复杂业务&技术逻辑建模和可视化（权限系统、多状态工作流、版本管理）。自学能力强，能快速进入新技术领域理解底层逻辑。"
  //       />
  //       <ResumeAbilityItem
  //         icon="🚀"
  //         title="Ownership"
  //         subtitle="全环节闭环"
  //         description="主动且全环节闭环：从需求定义→方案设计→原型交付→前端开发→设计验收。角色边界开放，更适配小团队、快速迭代节奏。Web 端 + 桌面端多环境调试开发能力。"
  //       />
  //     </div>
  //   ),
  // },
  {
    id: 'internship',
    title: '实习经历',
    content: (
      <ResumeExperienceItem
        position="交互设计"
        tags={['Mobile']}
        company="深圳思为科技有限公司"
        time="2022.7 – 1年6个月"
        summary="设计团队归属于 E轮融资 房地产营销 SaaS 企业，服务 大型房企 卖房获客 场景。"
        description={
          <>
            <ul className="list-disc pl-5">
              <li>
                <span className="font-bold">0-1 产品形态探索：</span>
                <br />
                ① <span className="text-green-stroke">深圳保租房 C端 App 体验设计</span>：3人团队 UX 角色，以设计提案支持协作沟通
                <br />
                ② <span className="text-green-stroke">购房咨询场景的 ChatGPT 应用探索</span>："主动对话+找房卡+标签系统" AI 客服方案
              </li>
            </ul>
            <ul className="list-disc pl-5">
              <li>
                <span className="font-bold">重构 & 维护设计系统：</span>Sketch → Figma
                <br />
                独立完成移动端/Web端组件库的更新工作, 简化冗余组件、Token 语义化
              </li>
            </ul>
            <ul className="list-disc pl-5">
              <li>
                <span className="font-bold">日常设计需求：</span>C端 App 个人主页 / 数据分析 等模块
              </li>
            </ul>
          </>
        }
      />
    ),
  },
  {
    id: 'projects',
    title: '项目经历',
    content: (
      <div className="flex flex-col gap-8">
        <ResumeExperienceItem
          position=""
          tags={['Mobile']}
          company="深圳大学学生事务中心 移动端"
          time="2021.10"
          summary="【已上线】整合校网100+功能服务, 向学校部门提案, 推动移动端网站服务 0-1 落地。"
        />
        <ResumeExperienceItem
          position=""
          tags={['Mobile']}
          company="一袋临食 OneDrop"
          time="2021.7"
          summary="【已上线】设计合伙人, 临期食品 O2O 创业项目，本地生活服务 全流程界面设计。"
        />
        <ResumeExperienceItem
          position=""
          tags={['Mobile']}
          company="赛逢伯乐 YourMatch"
          time="2021.4"
          summary="【已上线】设计合伙人, 校内交友组队资讯平台，3k+ 公众号关注的校园服务团队。"
        />
      </div>
    ),
  },
];

/**
 * Resume 页面 - 个人履历展示
 * 参考 Figma 设计，保持结构与视觉层级一致
 */
export default function ResumePage() {
  const { baseColor, activeColor } = useThemeColors();

  return (
    <div className="min-h-screen w-full flex flex-col relative bg-bg pb-32 md:pb-40">
      <div className="absolute inset-0 z-0">
        <DotGrid
          dotSize={3}
          gap={18}
          baseColor={baseColor}
          activeColor={baseColor}
          highlightBoost={0}
          proximity={0}
          speedTrigger={Infinity}
          shockRadius={0}
          shockStrength={0}
          maxSpeed={0}
          resistance={800}
          returnDuration={1.2}
          className="opacity-70"
        />
      </div>

      <div className="flex-1 w-full">
        <div className="relative z-10 w-full flex justify-center px-6 md:px-16 py-12 md:py-[80px]">

          <ResumeNavSections
            sections={RESUME_SECTIONS}
            sidebar={
              <div className="flex flex-col gap-3">
                <h1 className="font-Ding text-[48px] md:text-[64px] leading-none text-main opacity-80">
                  黄奕礼
                </h1>
                <p className="font-Ding text-[20px] md:text-[24px] leading-none text-main opacity-80">
                  Alii / 阿礼
                </p>
                <p className="font-regular text-[14px] md:text-[16px] leading-[1.6] text-tertiary mt-2">
                  AI 工具产品设计师，擅长在 0-1 场景构建产品方案并以代码交付
                </p>
                <SidebarContactButtons />
              </div>
            }
          />
        </div>
      </div>

      <Footer isGallery={true} showGallerySubtitle={false} className="pt-0" maskHeight="160px" />
    </div>
  );
}
