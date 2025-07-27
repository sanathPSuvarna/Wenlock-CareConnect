const express = require('express');
const patientController = require('../controllers/patientController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(authMiddleware.protect);

// Patient queue by department
router.get('/queue/:departmentId', patientController.getDepartmentQueue);

// Patient routes
router.route('/')
  .post(patientController.createPatient)
  .get(patientController.getPatients);

router.route('/:id')
  .get(patientController.getPatient)
  .put(patientController.updatePatient)
  .delete(patientController.deletePatient);

router.put('/:id/status', patientController.updatePatientStatus);
router.post('/:id/prescriptions', patientController.addPrescription);

module.exports = router;
