/**
 * Git信息获取工具
 * 用于在运行时获取Git提交信息
 */

// 在构建时生成的时间戳文件
let buildTime = null;
let lastCommitDate = null;

// 尝试从构建时生成的文件中读取时间
try {
  // 这个文件会在构建时生成
  const buildInfo = require('../build-info.json');
  buildTime = buildInfo.buildTime;
  lastCommitDate = buildInfo.lastCommitDate;
} catch (error) {
  // 如果文件不存在，使用默认值（静默回退，避免开发时重复刷屏）
}

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}.${month}.${day}`;
};

const getBuildDate = () => {
  if (!buildTime) return null;

  const date = new Date(buildTime);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return formatDate(date);
};

/**
 * 获取最后提交日期
 * @returns {string} 格式化的日期字符串 (YYYY.M.D)
 */
export function getLastCommitDate() {
  const buildDate = getBuildDate();
  if (buildDate) {
    return buildDate;
  }

  if (lastCommitDate) {
    return lastCommitDate;
  }
  
  // 如果构建时信息不可用，尝试在客户端获取
  if (typeof window !== 'undefined') {
    // 在客户端，我们无法直接访问Git，所以返回一个默认值
    // 或者可以尝试从API获取
    return '2025.1.1'; // 默认值
  }
  
  // 最后的回退方案
  const now = new Date();
  return formatDate(now);
}

/**
 * 获取格式化的更新时间文本
 * @param {string} language - 语言代码 ('zh' 或 'en')
 * @returns {string} 格式化的更新时间文本
 */
export function getLastUpdatedText(language = 'zh') {
  const date = getLastCommitDate();
  return language === 'zh' ? `更新于 ${date}` : `Updated ${date}`;
}

/**
 * 从最后提交日期中提取年份
 * @returns {string} 年份字符串，如 '2026'
 */
export function getLastCommitYear() {
  const date = getLastCommitDate();
  // date 格式为 'YYYY.M.D'，取第一段
  return date.split('.')[0];
}
