const logger = {
  info: (message, data = {}) => {
    console.log(JSON.stringify({ level: 'info', message, timestamp: new Date().toISOString(), ...data }));
  },
  warn: (message, data = {}) => {
    console.warn(JSON.stringify({ level: 'warn', message, timestamp: new Date().toISOString(), ...data }));
  },
  error: (message, error = {}) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error.message || error,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    }));
  },
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(JSON.stringify({ level: 'debug', message, timestamp: new Date().toISOString(), ...data }));
    }
  },
};

module.exports = logger;
