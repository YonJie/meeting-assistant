'use strict';

/**
 * Vercel Serverless Function 入口
 * 使用 serverless-http 包装现有 Express 应用，使 /api/* 请求复用后端路由
 *
 * @module api/index
 */

const serverless = require('serverless-http');
const app = require('../backend/app');

module.exports = serverless(app);
