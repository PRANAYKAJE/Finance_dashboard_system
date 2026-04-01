const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');
const { canViewSummary } = require('../middleware/authorize');
const { validate } = require('../middleware/validation');
const { recordValidation } = require('../utils/validationRules');

router.use(authenticate);

router.get('/summary',
  canViewSummary,
  recordValidation.summaryQuery,
  validate,
  dashboardController.getSummary
);

router.get('/categories',
  canViewSummary,
  dashboardController.getCategoryTotals
);

router.get('/recent',
  canViewSummary,
  dashboardController.getRecentActivity
);

router.get('/trends',
  canViewSummary,
  recordValidation.summaryQuery,
  validate,
  dashboardController.getTrends
);

router.get('/monthly',
  canViewSummary,
  dashboardController.getMonthlyStats
);

router.get('/',
  canViewSummary,
  dashboardController.getDashboardData
);

module.exports = router;
