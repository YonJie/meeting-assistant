'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { testConnection, ensureDatabase } = require('./config/db');
const { syncDatabase } = require('./models');
const meetingRoutes = require('./routes/meetingRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/meetings', meetingRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

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

start();

module.exports = app;
