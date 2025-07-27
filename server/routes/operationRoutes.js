const express = require('express');
const operationController = require('../controllers/operationController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(authMiddleware.protect);

// Get OT schedule for dashboard
router.get('/schedule', operationController.getOperationSchedule);

// Operation routes
router.route('/')
  .post(operationController.createOperation)
  .get(operationController.getOperations);

router.route('/:id')
  .get(operationController.getOperation)
  .put(operationController.updateOperation)
  .delete(operationController.deleteOperation);

router.put('/:id/status', operationController.updateOperationStatus);

module.exports = router;
