'use strict';

const { sequelize } = require('../config/db');
const Meeting = require('./Meeting')(sequelize);

/**
 * 同步数据库表结构
 * 默认在 development 环境使用 alter 自动对齐列；生产/初始化场景建议显式传入 { alter: false }。
 *
 * @param {object} [options={}] - 同步选项
 * @param {boolean} [options.alter] - 是否启用 alter，默认由 NODE_ENV 决定
 * @returns {Promise<void>}
 */
async function syncDatabase(options = {}) {
  const shouldAlter = options.alter ?? process.env.NODE_ENV === 'development';
  await sequelize.sync({ force: false, alter: shouldAlter });
  console.log('数据库表结构同步完成');
}

module.exports = {
  sequelize,
  Meeting,
  syncDatabase,
};
