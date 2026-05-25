require('dotenv').config();

const { app, server } = require('./app');
const config = require('./config');
const { sequelize } = require('./models');
const logger = require('./utils/logger');

const PORT = process.env.PORT || config.port || 10000;

const startServer = () => {
  server.listen(PORT, () => {
    logger.info(`Sentinel AI API running on port ${PORT}`, {
      environment: config.nodeEnv,
      port: PORT,
    });
  });
};

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connected successfully');

    if (process.env.DB_SYNC === 'true') {
      await sequelize.sync({ alter: false });
      logger.info('Database models synchronized');
    } else {
      logger.info('Database sync skipped (external migration)');
    }
  } catch (err) {
    logger.error('Database connection failed - server still running', {
      message: err.message,
      code: err.code,
      errno: err.errno,
    });
  }
};

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection', { message: err.message });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { message: err.message });
});

startServer();
connectDatabase();
