'use strict';

/**
 * 一次性数据库初始化脚本
 * 用于在 Vercel / Neon 等新环境中创建 meetings 表。
 * 运行前请确保 backend/.env 或根目录 .env 已配置 DATABASE_URL。
 *
 * 用法：
 *   node scripts/init-db.js
 *   npm run init-db
 */

const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
  quiet: true,
});
require('dotenv').config({
  path: path.resolve(__dirname, '../backend/.env'),
  override: true,
  quiet: true,
});

const { testConnection } = require('../backend/config/db');
const { syncDatabase } = require('../backend/models');

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('数据库初始化失败: 未找到 DATABASE_URL，请检查 backend/.env');
    process.exit(1);
  }

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
