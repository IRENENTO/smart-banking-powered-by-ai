const logger = require('../services/logger');

const errorHandler = (err, req, res, next) => {
    logger.error('Unhandled error', {
        method: req.method,
        path: req.path,
        statusCode: err.statusCode || 500,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });

    // Default error
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Server Error';

    // Handle specific error types
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    } else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation error: ' + err.message;
    } else if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
    }

    // Return JSON error response
    res.status(statusCode).json({
        error: {
            statusCode,
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
};

module.exports = errorHandler;
