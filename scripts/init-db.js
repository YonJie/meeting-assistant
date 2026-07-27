'use strict';

/**
 * 一次性数据库初始化脚本
 * 用于在 Vercel / Neon 等新环境中创建 meetings 表。
 * 运行前请确保本地 .env 或 .env.local 已配置 DATABASE_URL。
 *
 * 用法：
 *   node scripts/init-db.js
 */

require('dotenv').config();

const { testConnection } = require('../backend/config/db');
const { syncDatabase } = require('../backend/models');

async function main() {
  try {
    await testConnection();
    console.log('数据库连接成功');

    // 初始化表结构，生产环境禁用 alter
    await syncDatabase({ alter: false });
    console.log('数据库表结构初始化完成');

    process.exit(0);
  } catch (err) {
    console.error('数据库初始化失败:', err.message);
    process.exit(1);
  }
}

main();
