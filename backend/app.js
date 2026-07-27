'use strict';

require('dotenv').config();

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const meetingRoutes = require('./routes/meetingRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();
const publicDir = path.join(__dirname, '../public');
const indexHtml = path.join(publicDir, 'index.html');
const hasFrontend = fs.existsSync(indexHtml);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/meetings', meetingRoutes);

/**
 * Vercel Express 场景下 / 会进入 Function，需显式托管 Vue 构建产物。
 * 本地未执行前端 build 时跳过，继续走 API 404。
 */
if (hasFrontend) {
  app.use(express.static(publicDir));
  app.get('/', (req, res) => {
    res.sendFile(indexHtml);
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
