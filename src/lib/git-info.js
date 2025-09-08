/**
 * Git信息获取工具
 * 用于在运行时获取Git提交信息
 */

// 在构建时生成的时间戳文件
let buildTime = null;

// 尝试从构建时生成的文件中读取时间
try {
  // 这个文件会在构建时生成
  const buildInfo = require('../build-info.json');
  buildTime = buildInfo.lastCommitDate;
} catch (error) {
  // 如果文件不存在，使用默认值
  console.warn('构建信息文件不存在，使用默认日期');
}

/**
 * 获取最后提交日期
 * @returns {string} 格式化的日期字符串 (YYYY.M.D)
 */
export function getLastCommitDate() {
  if (buildTime) {
    return buildTime;
  }
  
  // 如果构建时信息不可用，尝试在客户端获取
  if (typeof window !== 'undefined') {
    // 在客户端，我们无法直接访问Git，所以返回一个默认值
    // 或者可以尝试从API获取
    return '2025.1.1'; // 默认值
  }
  
  // 在服务端，尝试使用child_process（仅在Node.js环境中）
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    try {
      const { execSync } = require('child_process');
      const lastCommitDate = execSync('git log -1 --format=%ci', { 
        encoding: 'utf8',
        cwd: process.cwd()
      }).trim();
      
      const date = new Date(lastCommitDate);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      
      return `${year}.${month}.${day}`;
    } catch (error) {
      console.warn('无法获取Git信息:', error.message);
    }
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
