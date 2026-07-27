'use strict';

/**
 * 本地开发服务器入口
 * 仅用于非 Vercel 环境（如本地 npm run dev / npm start），
 * 负责数据库检查、表结构同步并启动 HTTP 监听。
 *
 * @module backend/server
 */

require('dotenv').config();

const app = require('./app');
const { testConnection, ensureDatabase } = require('./config/db');
const { syncDatabase } = require('./models');

const PORT = process.env.PORT || 3000;

/**
 * 启动本地开发服务器
 * @returns {Promise<void>}
 */
async function start() {
  try {
    await ensureDatabase();
    await testConnection();
    console.log('数据库连接成功');

    await syncDatabase();

    app.listen(PORT, () => {
      console.log(`服务已启动: http://localhost:${PORT}`);
      console.log(`健康检查: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error('启动失败:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

module.exports = { start };
