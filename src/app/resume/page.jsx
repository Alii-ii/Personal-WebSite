"use client";

import Footer from '@/components/footer';
import ResumeEducationItem from '@/components/ResumeEducationItem';
import ResumeExperienceItem from '@/components/ResumeExperienceItem';
import ResumeNavSections from '@/components/ResumeNavSections';
import DotGrid from '@/effects/DotGrid';
import AnimatedContent from '@/effects/AnimatedContent';
import { useThemeColors } from '@/hooks/useThemeColors';

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
              <p>腾讯CDC校企合作</p>
              <p>服务设计(微专业)</p>
            </>
          }
        />
        <ResumeEducationItem
          time="2020.9 - 2024.6"
          content={
            <>
              <p>深圳大学</p>
              <p>视觉传达(双学位)</p>
            </>
          }
        />
        <ResumeEducationItem
          time="2019.9 - 2024.6"
          content={
            <>
              <p>深圳大学</p>
              <p>市场营销(本科)</p>
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
        company="美团-基础研发平台设计中心"
        time="2024.6 – 至今"
        description={
          <>
            <ul className="list-disc pl-5">
              <li>
                (Vibe Coding Tool) NoCode 从0到2 全局产品设计&前端开发：
                <br />
                ① 基于业务规划和快速的迭代节奏, 定义并维护合理的信息架构 & 核心交互路径
                <br />
                ② 参与上线产品前端开发, 组件化交付、自助设计验收、推动微交互优化落地
              </li>
            </ul>
            <ul className="list-disc pl-5">
              <li>
                (AI IDE) MCopilot → CapPaw 整体优化：提炼 AI native IDE 交互路径、整体改版重构、
                沉淀核心控件规范+跨主题通用配色方案
              </li>
            </ul>
            <ul className="list-disc pl-5">
              <li>设计部 AI Coding 学科建设: 活动网站开发、编写FAQ、演示分享、筹办兴趣小组</li>
            </ul>
          </>
        }
      />
    ),
  },
  {
    id: 'internship',
    title: '实习经历',
    content: (
      <ResumeExperienceItem
        position="交互设计"
        company="深圳思为科技有限公司"
        time="2022.7 – 1年6个月"
        summary="设计团队归属于 E轮融资房地产营销SaaS企业，服务于大型房企卖房获客场景。"
        description={
          <>
            <ul className="list-disc pl-5">
              <li>
                0-1产品形态探索：
                <br />
                ① <span className="text-green-stroke">深圳保障性租赁住房 C端租房 App体验设计</span>：
                3人对接团队中的 UX 角色，通过业务拆解、用户访谈、竞品分析，探索契合合作方和本团队优势的租房产品形态，
                做出差异化设计洞察，以调研结果支持团队沟通决策，以MVP提案支持汇报&合作。
                <br />
                ② <span className="text-green-stroke">介入购房旅程的 ChatGPT 应用探索</span>：
                结合购房者与置业顾问"触达-转化"的信息交互链路，初步构建"主动对话+找房卡+标签系统"的AI客服解决方案。
              </li>
            </ul>
            <ul className="list-disc pl-5">
              <li>
                日常设计需求：
                <br />
                ① <span className="text-green-stroke">移动端+网页工作台 KOL个人站 组件化设计</span>：
                内容付费场景的通用可配组件设计。
                <br />
                ② <span className="text-green-stroke">移动端 营销数据助手 改版迭代</span>：复杂数据字段的图表呈现与交互设计。
                <br />
                ③ <span className="text-green-stroke">CRM标品App 分支功能设计支持</span>：含抖音授权、个人名片模块。
              </li>
            </ul>
            <ul className="list-disc pl-5">
              <li>
                <span className="font-bold">维护设计系统</span>：结合业务更新与 figma design token 特性，
                整合旧版本 sketch 组件库，简化重构冗余组件、语义化命名，提高团队组件库的易用性和一致性，
                并推动前端资产与规范的更新落地。
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
          position="体验设计"
          company="深大学生事务中心 在线服务体验改版"
          time="2021.10 – 4个月"
          summary="【已落地】从校网难用的生活体验提出问题，以用研和走查的方法定义问题，用产品思维和设计能力构建解决方案，通过沟通与协作加入了学校部门、让想法落地。"
          description={
            <>
              <ul className="list-disc pl-5">
                <li>
                  <span className="font-bold">用户研究</span>：以<span className="text-green-stroke">可用性体验、组织焦点小组、投放问卷</span>的方法，
                  了解不同类型同学对在线校园服务的了解程度、使用痛点及需求预期。
                </li>
              </ul>
              <ul className="list-disc pl-5">
                <li>
                  <span className="font-bold">业务梳理</span>：<span className="text-green-stroke">页面走查</span>将校网100+功能服务收集聚类，
                  对校内类似的产品与组织进行<span className="text-green-stroke">竞品分析</span>，对服务供给侧的市场空缺形成如移动端支持、在线课程表等真实有效的机会洞察。
                </li>
              </ul>
              <ul className="list-disc pl-5">
                <li>
                  <span className="font-bold">产品设计</span>：<span className="text-green-stroke">优化网站信息架构、简化操作路径</span>，
                  构建移动端校网访问方案。
                </li>
              </ul>
            </>
          }
        />
        <ResumeExperienceItem
          position="UX/UI + 品牌设计"
          company="赛事组队-赛逢伯乐YourMatch"
          time="2021.4 – 7个月"
          summary={
            <>
              【已落地】从参赛难找好队友萌生创业想法，如今成为
              <span className="text-green-stroke">3k+公众号关注的校园服务组织</span>。
            </>
          }
          description={
            <>
              <ul className="list-disc pl-5">
                <li>
                  <span className="font-bold">产品设计</span>：参与团队讨论，构建并完善在线组队功能的交互逻辑和使用流程，
                  独立完成移动端产品设计，交付视觉定义、交互页面地图和组件规范。
                </li>
              </ul>
              <ul className="list-disc pl-5">
                <li>
                  <span className="font-bold">品牌&IP设计</span>：独立负责含标志、IP形象及延展物的全套品牌设计，并跟进印刷落地。
                </li>
              </ul>
            </>
          }
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
          activeColor={activeColor}
          highlightBoost={0.05}
          proximity={120}
          speedTrigger={80}
          shockRadius={200}
          shockStrength={3}
          maxSpeed={2000}
          resistance={800}
          returnDuration={1.2}
          className="opacity-70"
        />
      </div>

      <AnimatedContent
        direction="vertical"
        reverse={false}
        distance={80}
        duration={1.2}
        delay={0.4}
        immediate={true}
        flex={true}
        className="flex-1 w-full"
      >
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
              </div>
            }
          />
        </div>
      </AnimatedContent>

      <Footer isGallery={true} showGallerySubtitle={false} />
    </div>
  );
}
