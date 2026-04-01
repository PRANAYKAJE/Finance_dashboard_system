const rateLimit = require('express-rate-limit');
const config = require('../config/config');

const standardLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const createRecordsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: 'Too many record creation requests, please slow down.',
    code: 'CREATE_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  standardLimiter,
  authLimiter,
  createRecordsLimiter
};
