const express = require('express');
const departmentController = require('../controllers/departmentController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Protect all routes
// router.use(authMiddleware.protect);

// Get department stats for dashboard
router.get('/stats', departmentController.getDepartmentStats);

// Department routes
router.route('/').get(departmentController.getDepartments);

router.route('/:id')
  .get(departmentController.getDepartment)
  .put(authMiddleware.authorize('admin'), departmentController.updateDepartment)
  .delete(authMiddleware.authorize('admin'), departmentController.deleteDepartment);

module.exports = router;
