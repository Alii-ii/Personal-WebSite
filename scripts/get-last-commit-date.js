#!/usr/bin/env node

/**
 * 获取最后一次Git提交的日期
 * 用于在构建时自动更新网站的更新时间
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getLastCommitDate() {
  try {
    // 获取最后一次提交的日期（ISO格式）
    const lastCommitDate = execSync('git log -1 --format=%ci', { 
      encoding: 'utf8',
      cwd: process.cwd()
    }).trim();
    
    // 转换为YYYY.M.D格式
    const date = new Date(lastCommitDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 月份从0开始，需要+1
    const day = date.getDate();
    
    return `${year}.${month}.${day}`;
  } catch (error) {
    console.warn('无法获取Git提交日期，使用当前日期:', error.message);
    // 如果Git命令失败，使用当前日期
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    return `${year}.${month}.${day}`;
  }
}

function updateLanguageContext() {
  const lastUpdateDate = getLastCommitDate();
  const languageContextPath = path.join(__dirname, '../src/contexts/LanguageContext.js');
  
  try {
    let content = fs.readFileSync(languageContextPath, 'utf8');
    
    // 更新中文版本的lastUpdated
    content = content.replace(
      /lastUpdated: "更新于 \d{4}\.\d{1,2}\.\d{1,2}"/,
      `lastUpdated: "更新于 ${lastUpdateDate}"`
    );
    
    // 更新英文版本的lastUpdated
    content = content.replace(
      /lastUpdated: "Updated \d{4}\.\d{1,2}\.\d{1,2}"/,
      `lastUpdated: "Updated ${lastUpdateDate}"`
    );
    
    fs.writeFileSync(languageContextPath, content, 'utf8');
    console.log(`✅ 已更新LanguageContext中的日期为: ${lastUpdateDate}`);
  } catch (error) {
    console.error('❌ 更新LanguageContext失败:', error.message);
    process.exit(1);
  }
}

function generateBuildInfo() {
  const lastUpdateDate = getLastCommitDate();
  const buildInfo = {
    lastCommitDate: lastUpdateDate,
    buildTime: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  };
  
  const buildInfoPath = path.join(__dirname, '../src/build-info.json');
  
  try {
    fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2), 'utf8');
    console.log(`✅ 已生成构建信息文件: ${buildInfoPath}`);
  } catch (error) {
    console.error('❌ 生成构建信息文件失败:', error.message);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  updateLanguageContext();
  generateBuildInfo();
}

module.exports = { getLastCommitDate, updateLanguageContext };
