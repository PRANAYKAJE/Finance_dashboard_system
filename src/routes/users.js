const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validation');
const { userValidation } = require('../utils/validationRules');

router.use(authenticate);

router.get('/',
  authorize('admin'),
  userController.getAllUsers
);

router.get('/stats',
  authorize('admin'),
  userController.getUserStats
);

router.get('/:id',
  authorize('admin'),
  userValidation.userIdParam,
  validate,
  userController.getUserById
);

router.put('/:id',
  authorize('admin'),
  userValidation.userIdParam,
  userValidation.update,
  validate,
  userController.updateUser
);

router.delete('/:id',
  authorize('admin'),
  userValidation.userIdParam,
  validate,
  userController.deleteUser
);

module.exports = router;
