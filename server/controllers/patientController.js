const Patient = require('../models/patientModel');
const Department = require('../models/departmentModel');

// @desc    Create a new patient
// @route   POST /api/patients
// @access  Private
exports.createPatient = async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    
    res.status(201).json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private
exports.getPatients = async (req, res) => {
  try {
    // Initialize query
    let query = Patient.find()
      .populate('department')
      .populate('doctor', 'name');
    
    // Add filter options
    const { department, doctor, status, emergency, date } = req.query;
    
    // Filter by department
    if (department) {
      query = query.find({ department });
    }
    
    // Filter by doctor
    if (doctor) {
      query = query.find({ doctor });
    }
    
    // Filter by status
    if (status) {
      query = query.find({ status });
    }
    
    // Filter by emergency status
    if (emergency) {
      query = query.find({ emergency: emergency === 'true' });
    }
    
    // Filter by appointment date
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query = query.find({
        appointmentDate: {
          $gte: startDate,
          $lte: endDate
        }
      });
    }
    
    // Sorting
    query = query.sort({ appointmentDate: 1 });
    
    // Execute query
    const patients = await query;
    
    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private
exports.getPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('department')
      .populate('doctor', 'name');
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private
exports.updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('department').populate('doctor', 'name');
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private
exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    await patient.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// @desc    Update patient status
// @route   PUT /api/patients/:id/status
// @access  Private
exports.updatePatientStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status'
      });
    }
    
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true
      }
    ).populate('department').populate('doctor', 'name');
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// @desc    Add prescription to patient
// @route   POST /api/patients/:id/prescriptions
// @access  Private
exports.addPrescription = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    patient.prescriptions.push(req.body);
    
    await patient.save();
    
    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// @desc    Get department queue
// @route   GET /api/patients/queue/:departmentId
// @access  Private
exports.getDepartmentQueue = async (req, res) => {
  try {
    const departmentId = req.params.departmentId;
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Find patients for this department with appointments today
    const patients = await Patient.find({
      department: departmentId,
      appointmentDate: {
        $gte: today,
        $lt: tomorrow
      }
    }).sort('appointmentDate').populate('doctor', 'name');
    
    // Group by status
    const waiting = patients.filter(p => p.status === 'waiting');
    const inConsultation = patients.filter(p => p.status === 'in-consultation');
    const completed = patients.filter(p => p.status === 'completed');
    const noShow = patients.filter(p => p.status === 'no-show');
    const rescheduled = patients.filter(p => p.status === 'rescheduled');
    
    res.status(200).json({
      success: true,
      data: {
        waiting,
        inConsultation,
        completed,
        noShow,
        rescheduled
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};
