/**
 * Git信息获取工具
 * 用于在运行时获取Git提交信息
 */

import buildInfo from '../build-info.json';

// 从构建时生成的文件中读取时间
const buildTime = buildInfo?.lastCommitDate || null;

/**
 * 获取最后提交日期
 * @returns {string} 格式化的日期字符串 (YYYY.M.D)
 */
export function getLastCommitDate() {
  if (buildTime) {
    return buildTime;
  }
  
  // 最后的回退方案
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  return `${year}.${month}.${day}`;
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
