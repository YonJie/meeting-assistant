'use strict';

const path = require('path');
const { Sequelize } = require('sequelize');
const { Client } = require('pg');

// 优先加载 backend/.env，其次根目录 .env（Vercel 注入的环境变量不受影响）
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), override: true });

const DATABASE_URL = process.env.DATABASE_URL;

const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = Number(process.env.DB_PORT) || 5432;
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = String(process.env.DB_PASSWORD ?? '');
const DB_NAME = process.env.DB_NAME || 'meeting_db';
const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

/**
 * 规范化连接串：去掉部分 Node pg 客户端不兼容的 channel_binding=require
 * @param {string} url
 * @returns {string}
 */
function normalizeDatabaseUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.searchParams.get('channel_binding') === 'require') {
      parsed.searchParams.delete('channel_binding');
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * 构造 Sequelize 通用配置
 * @returns {object}
 */
function createCommonOptions() {
  return {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    pool: {
      max: IS_SERVERLESS ? 1 : 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      connectionTimeoutMillis: 10000,
    },
  };
}

/**
 * 创建 Sequelize 实例
 * 优先使用 DATABASE_URL（Vercel Marketplace Neon 等场景），
 * 否则回退到分散的 DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD。
 * @returns {import('sequelize').Sequelize}
 */
function createSequelize() {
  const common = createCommonOptions();

  if (DATABASE_URL) {
    return new Sequelize(normalizeDatabaseUrl(DATABASE_URL), {
      ...common,
      dialectOptions: {
        ...common.dialectOptions,
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    });
  }

  if (process.env.VERCEL) {
    throw new Error('生产环境缺少 DATABASE_URL，无法连接数据库');
  }

  return new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    ...common,
    host: DB_HOST,
    port: DB_PORT,
  });
}

const sequelize = createSequelize();

/**
 * 测试数据库连接
 * @returns {Promise<void>}
 */
async function testConnection() {
  await sequelize.authenticate();
}

/**
 * 如果目标数据库不存在，则自动创建（仅适用于本地开发环境）。
 * 在 Vercel Serverless / Neon 等托管数据库场景中不应调用此函数。
 * @returns {Promise<void>}
 */
async function ensureDatabase() {
  const client = new Client({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: 'postgres',
    connectionTimeoutMillis: 10000,
  });

  try {
    await client.connect();
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [DB_NAME]
    );
    if (result.rows.length === 0) {
      // PostgreSQL 不支持参数化 CREATE DATABASE，需使用已验证的标识符
      await client.query(`CREATE DATABASE "${DB_NAME}"`);
      console.log(`数据库 ${DB_NAME} 创建成功`);
    }
  } finally {
    await client.end();
  }
}

module.exports = { sequelize, testConnection, ensureDatabase };
