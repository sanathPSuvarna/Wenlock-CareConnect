const express = require('express');
const pharmacyController = require('../controllers/pharmacyController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(authMiddleware.protect);

// Get dashboard summary - all authenticated users can view
router.get('/dashboard', pharmacyController.getInventorySummary);

// Pharmacy routes
router.route('/')
  .post(authMiddleware.authorize('admin', 'pharmacy'), pharmacyController.createMedication)
  .get(pharmacyController.getMedications);

router.route('/:id')
  .get(pharmacyController.getMedication)
  .put(authMiddleware.authorize('admin', 'pharmacy'), pharmacyController.updateMedication)
  .delete(authMiddleware.authorize('admin', 'pharmacy'), pharmacyController.deleteMedication);

// Only pharmacy staff and admins can update stock
router.put('/:id/stock', authMiddleware.authorize('admin', 'pharmacy'), pharmacyController.updateStock);

module.exports = router;
