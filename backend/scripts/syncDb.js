'use strict';

/**
 * 独立执行数据库同步：npm run sync
 */
require('dotenv').config();

const { testConnection } = require('../config/db');
const { syncDatabase } = require('../models');

async function main() {
  try {
    await testConnection();
    console.log('数据库连接成功');
    await syncDatabase();
    process.exit(0);
  } catch (err) {
    console.error('数据库同步失败:', err.message);
    process.exit(1);
  }
}

main();
