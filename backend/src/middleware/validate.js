const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: {
        statusCode: 400,
        message: 'Validation failed',
        details: errors.array().map(e => ({ field: e.path, message: e.msg })),
      }
    });
  }
  next();
};

module.exports = validate;
