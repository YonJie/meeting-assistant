'use strict';

const { sequelize } = require('../config/db');
const Meeting = require('./Meeting')(sequelize);

/**
 * 同步数据库表结构（开发调试用，alter 会根据 Model 自动调整列）
 * @returns {Promise<void>}
 */
async function syncDatabase() {
  await sequelize.sync({ force: false, alter: true });
  console.log('数据库表结构同步完成');
}

module.exports = {
  sequelize,
  Meeting,
  syncDatabase,
};
