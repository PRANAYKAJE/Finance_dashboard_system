const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { User, TokenBlacklist } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    try {
      const isBlacklisted = await TokenBlacklist.findOne({ token });
      if (isBlacklisted) {
        return res.status(401).json({
          success: false,
          message: 'Token has been revoked. Please login again.',
          code: 'TOKEN_REVOKED'
        });
      }

      const decoded = jwt.verify(token, config.jwt.secret, {
        algorithms: ['HS256']
      });
      
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found.',
          code: 'USER_NOT_FOUND'
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is inactive. Please contact administrator.',
          code: 'ACCOUNT_INACTIVE'
        });
      }

      req.user = user;
      req.userId = user._id;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please login again.',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token.',
          code: 'INVALID_TOKEN'
        });
      }
      
      throw jwtError;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed.',
      code: 'AUTH_ERROR'
    });
  }
};

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn, algorithm: 'HS256' }
  );
};

const revokeToken = async (token, userId) => {
  try {
    const decoded = jwt.decode(token);
    const expiresAt = decoded && decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    await TokenBlacklist.create({
      token,
      userId,
      expiresAt
    });
    return true;
  } catch (error) {
    console.error('Error revoking token:', error);
    return false;
  }
};

module.exports = {
  authenticate,
  generateToken,
  revokeToken
};
