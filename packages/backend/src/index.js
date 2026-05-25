require('dotenv').config();

const { server } = require('./app');
const config = require('./config');
const { sequelize } = require('./models');
const logger = require('./utils/logger');

const start = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connected successfully');

    if (process.env.DB_SYNC === 'true') {
      await sequelize.sync({ alter: false });
      logger.info('Database models synchronized');
    } else {
      logger.info('Database sync skipped (external migration)');
    }

    server.listen(config.port, () => {
      logger.info(`Sentinel AI API running on port ${config.port}`, {
        environment: config.nodeEnv,
        port: config.port,
      });
    });
  } catch (err) {
    logger.error('Failed to start server', err);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection', err);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', err);
  process.exit(1);
});

start();
