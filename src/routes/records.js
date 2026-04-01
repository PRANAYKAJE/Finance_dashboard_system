const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');
const { authenticate } = require('../middleware/auth');
const { canView, canCreate, canUpdate, canDelete } = require('../middleware/authorize');
const { validate } = require('../middleware/validation');
const { createRecordsLimiter } = require('../middleware/rateLimiter');
const { recordValidation } = require('../utils/validationRules');

router.use(authenticate);

router.get('/',
  canView,
  recordValidation.query,
  validate,
  recordController.getRecords
);

router.get('/search',
  canView,
  recordController.searchRecords
);

router.get('/categories',
  canView,
  recordController.getCategories
);

router.get('/:id',
  canView,
  recordValidation.recordIdParam,
  validate,
  recordController.getRecordById
);

router.post('/',
  canCreate,
  createRecordsLimiter,
  recordValidation.create,
  validate,
  recordController.createRecord
);

router.put('/:id',
  canUpdate,
  recordValidation.recordIdParam,
  recordValidation.update,
  validate,
  recordController.updateRecord
);

router.delete('/:id',
  canDelete,
  recordValidation.recordIdParam,
  validate,
  recordController.deleteRecord
);

module.exports = router;
