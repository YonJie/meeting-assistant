'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const meetingRoutes = require('./routes/meetingRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/meetings', meetingRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
