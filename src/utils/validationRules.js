const { body, param, query } = require('express-validator');

const userValidation = {
  register: [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail()
      .trim(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/\d/)
      .withMessage('Password must contain at least one number'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ max: 100 })
      .withMessage('Name cannot exceed 100 characters')
  ],

  login: [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail()
      .trim(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  update: [
    body('email')
      .optional()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail()
      .trim(),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Name must be between 1 and 100 characters'),
    body('role')
      .optional()
      .isIn(['viewer', 'analyst', 'admin'])
      .withMessage('Role must be viewer, analyst, or admin'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean')
  ],

  updatePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long')
      .matches(/\d/)
      .withMessage('New password must contain at least one number')
  ],

  userIdParam: [
    param('id')
      .isMongoId()
      .withMessage('Invalid user ID format')
  ]
};

const recordValidation = {
  create: [
    body('amount')
      .isNumeric()
      .withMessage('Amount must be a number')
      .custom(value => value >= 0)
      .withMessage('Amount cannot be negative'),
    body('type')
      .isIn(['income', 'expense'])
      .withMessage('Type must be either income or expense'),
    body('category')
      .trim()
      .notEmpty()
      .withMessage('Category is required')
      .isLength({ max: 50 })
      .withMessage('Category cannot exceed 50 characters'),
    body('date')
      .optional()
      .isISO8601()
      .withMessage('Date must be a valid ISO 8601 date'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Description cannot exceed 200 characters')
  ],

  update: [
    body('amount')
      .optional()
      .isNumeric()
      .withMessage('Amount must be a number')
      .custom(value => value >= 0)
      .withMessage('Amount cannot be negative'),
    body('type')
      .optional()
      .isIn(['income', 'expense'])
      .withMessage('Type must be either income or expense'),
    body('category')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Category must be between 1 and 50 characters'),
    body('date')
      .optional()
      .isISO8601()
      .withMessage('Date must be a valid ISO 8601 date'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Description cannot exceed 200 characters')
  ],

  recordIdParam: [
    param('id')
      .isMongoId()
      .withMessage('Invalid record ID format')
  ],

  query: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('type')
      .optional()
      .isIn(['income', 'expense'])
      .withMessage('Type must be either income or expense'),
    query('category')
      .optional()
      .trim(),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date'),
    query('sortBy')
      .optional()
      .isIn(['date', 'amount', 'createdAt'])
      .withMessage('SortBy must be date, amount, or createdAt'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('SortOrder must be asc or desc')
  ],

  summaryQuery: [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date'),
    query('groupBy')
      .optional()
      .isIn(['day', 'week', 'month', 'year'])
      .withMessage('GroupBy must be day, week, month, or year')
  ]
};

module.exports = {
  userValidation,
  recordValidation
};
