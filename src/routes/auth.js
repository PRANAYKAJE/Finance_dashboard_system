const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');
const { userValidation } = require('../utils/validationRules');

router.post('/register', 
  authLimiter,
  userValidation.register,
  validate,
  authController.register
);

router.post('/login',
  authLimiter,
  userValidation.login,
  validate,
  authController.login
);

router.get('/profile',
  authenticate,
  authController.getProfile
);

router.put('/password',
  authenticate,
  userValidation.updatePassword,
  validate,
  authController.updatePassword
);

router.post('/logout',
  authenticate,
  authController.logout
);

module.exports = router;
