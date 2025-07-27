const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Auth routes
router.post('/login', userController.loginUser);
router.post('/register', userController.registerUser); // Public registration endpoint

// User routes
router.route('/')
  .post(authMiddleware.protect, authMiddleware.authorize('admin'), userController.registerUser)
  .get(authMiddleware.protect, authMiddleware.authorize('admin'), userController.getUsers);

router.route('/profile')
  .get(authMiddleware.protect, userController.getUserProfile)
  .put(authMiddleware.protect, userController.updateUserProfile);

router.route('/:id')
  .get(authMiddleware.protect, authMiddleware.authorize('admin'), userController.getUserById)
  .put(authMiddleware.protect, authMiddleware.authorize('admin'), userController.updateUser)
  .delete(authMiddleware.protect, authMiddleware.authorize('admin'), userController.deleteUser);

module.exports = router;
