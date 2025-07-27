const Department = require('../models/departmentModel');
const Patient = require('../models/patientModel');

// @desc    Create a new department
// @route   POST /api/departments
// @access  Private/Admin
exports.createDepartment = async (req, res) => {
  try {
    const department = await Department.create(req.body);
    
    res.status(201).json({
      success: true,
      data: department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().populate('headDoctor', 'name email');
    
    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};


exports.getDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id).populate('headDoctor', 'name email');
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// @desc    Update department
exports.updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('headDoctor', 'name email');
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};


exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    // Check if patients are associated with this department
    const patientCount = await Patient.countDocuments({ department: req.params.id });
    
    if (patientCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department because it has ${patientCount} patients associated with it`
      });
    }
    
    await department.remove();
    
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


exports.getDepartmentStats = async (req, res) => {
  try {
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Aggregate department stats
    const stats = await Department.aggregate([
      {
        $lookup: {
          from: 'patients',
          localField: '_id',
          foreignField: 'department',
          as: 'patients'
        }
      },
      {
        $project: {
          name: 1,
          code: 1,
          location: 1,
          totalPatientsToday: {
            $size: {
              $filter: {
                input: '$patients',
                as: 'patient',
                cond: {
                  $and: [
                    { $gte: ['$$patient.appointmentDate', today] },
                    { $lt: ['$$patient.appointmentDate', tomorrow] }
                  ]
                }
              }
            }
          },
          waitingPatients: {
            $size: {
              $filter: {
                input: '$patients',
                as: 'patient',
                cond: {
                  $and: [
                    { $gte: ['$$patient.appointmentDate', today] },
                    { $lt: ['$$patient.appointmentDate', tomorrow] },
                    { $eq: ['$$patient.status', 'waiting'] }
                  ]
                }
              }
            }
          },
          completedPatients: {
            $size: {
              $filter: {
                input: '$patients',
                as: 'patient',
                cond: {
                  $and: [
                    { $gte: ['$$patient.appointmentDate', today] },
                    { $lt: ['$$patient.appointmentDate', tomorrow] },
                    { $eq: ['$$patient.status', 'completed'] }
                  ]
                }
              }
            }
          },
          emergencyPatients: {
            $size: {
              $filter: {
                input: '$patients',
                as: 'patient',
                cond: {
                  $and: [
                    { $gte: ['$$patient.appointmentDate', today] },
                    { $lt: ['$$patient.appointmentDate', tomorrow] },
                    { $eq: ['$$patient.emergency', true] }
                  ]
                }
              }
            }
          }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};
