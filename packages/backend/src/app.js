const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const config = require('./config');
const { sequelize } = require('./models');
const { setupSocketHandlers } = require('./socket');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);

const allowedOrigins = config.nodeEnv === 'production'
  ? process.env.CORS_ORIGINS?.split(',') || ['https://smart-banking-powered-by-ai.onrender.com']
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8081'];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(compression());
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/devices', require('./routes/devices'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/admin', require('./routes/admin'));

app.get('/', (req, res) => {
  res.json({ service: 'Sentinel AI API', status: 'running', version: '1.0.0' });
});

app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    await sequelize.authenticate();
    dbStatus = 'connected';
  } catch (e) {
    dbStatus = `error: ${e.message}`;
  }
  res.json({
    status: 'ok',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  logger.error('Unhandled error', err);
  res.status(err.status || 500).json({
    error: config.nodeEnv === 'production' ? 'Internal server error' : err.message,
  });
});

setupSocketHandlers(io);

module.exports = { app, server, io };
