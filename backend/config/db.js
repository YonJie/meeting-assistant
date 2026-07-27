"use strict";

require("dotenv").config();
const { Sequelize } = require("sequelize");
const { Client } = require("pg");

const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_PORT = Number(process.env.DB_PORT) || 5432;
const DB_USER = process.env.DB_USER || "postgres";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "meeting_db";

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "postgres",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  define: {
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

/**
 * 测试数据库连接
 * @returns {Promise<void>}
 */
async function testConnection() {
  await sequelize.authenticate();
}

/**
 * 如果目标数据库不存在，则自动创建
 * @returns {Promise<void>}
 */
async function ensureDatabase() {
  const client = new Client({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: "postgres",
  });

  try {
    await client.connect();
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
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
