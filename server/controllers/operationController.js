const Operation = require('../models/operationModel');
const Patient = require('../models/patientModel');

// @desc    Create a new operation
// @route   POST /api/operations
// @access  Private
exports.createOperation = async (req, res) => {
  try {
    const operation = await Operation.create(req.body);
    
    // Populate references
    const populatedOperation = await Operation.findById(operation._id)
      .populate('patient', 'name age gender')
      .populate('surgeons', 'name')
      .populate('assistingStaff', 'name');
    
    res.status(201).json({
      success: true,
      data: populatedOperation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// @desc    Get all operations
// @route   GET /api/operations
// @access  Private
exports.getOperations = async (req, res) => {
  try {
    // Initialize query
    let query = Operation.find()
      .populate('patient', 'name age gender tokenNumber')
      .populate('surgeons', 'name')
      .populate('assistingStaff', 'name');
    
    // Add filter options
    const { status, otNumber, date, priority } = req.query;
    
    // Filter by status
    if (status) {
      query = query.find({ status });
    }
    
    // Filter by OT number
    if (otNumber) {
      query = query.find({ otNumber });
    }
    
    // Filter by priority
    if (priority) {
      query = query.find({ priority });
    }
    
    // Filter by scheduled date
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query = query.find({
        scheduledDate: {
          $gte: startDate,
          $lte: endDate
        }
      });
    }
    
    // Sorting
    query = query.sort({ scheduledDate: 1 });
    
    // Execute query
    const operations = await query;
    
    res.status(200).json({
      success: true,
      count: operations.length,
      data: operations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// @desc    Get single operation
// @route   GET /api/operations/:id
// @access  Private
exports.getOperation = async (req, res) => {
  try {
    const operation = await Operation.findById(req.params.id)
      .populate('patient', 'name age gender tokenNumber')
      .populate('surgeons', 'name')
      .populate('assistingStaff', 'name');
    
    if (!operation) {
      return res.status(404).json({
        success: false,
        message: 'Operation not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: operation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// @desc    Update operation
// @route   PUT /api/operations/:id
// @access  Private
exports.updateOperation = async (req, res) => {
  try {
    const operation = await Operation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
      .populate('patient', 'name age gender tokenNumber')
      .populate('surgeons', 'name')
      .populate('assistingStaff', 'name');
    
    if (!operation) {
      return res.status(404).json({
        success: false,
        message: 'Operation not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: operation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// @desc    Delete operation
// @route   DELETE /api/operations/:id
// @access  Private
exports.deleteOperation = async (req, res) => {
  try {
    const operation = await Operation.findByIdAndDelete(req.params.id);
    
    if (!operation) {
      return res.status(404).json({
        success: false,
        message: 'Operation not found'
      });
    }
    
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

// @desc    Update operation status
// @route   PUT /api/operations/:id/status
// @access  Private
exports.updateOperationStatus = async (req, res) => {
  try {
    const { status, startTime, endTime } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status'
      });
    }
    
    const updateData = { status };
    
    // If operation is starting, record start time
    if (status === 'in-progress' && !startTime) {
      updateData.startTime = new Date();
    }
    
    // If operation is completed, record end time
    if (status === 'completed' && !endTime) {
      updateData.endTime = new Date();
    }
    
    const operation = await Operation.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    )
      .populate('patient', 'name age gender tokenNumber')
      .populate('surgeons', 'name')
      .populate('assistingStaff', 'name');
    
    if (!operation) {
      return res.status(404).json({
        success: false,
        message: 'Operation not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: operation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// @desc    Get OT schedule for dashboard display
// @route   GET /api/operations/schedule
// @access  Private
exports.getOperationSchedule = async (req, res) => {
  try {
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Find operations scheduled for today
    const operations = await Operation.find({
      scheduledDate: {
        $gte: today,
        $lt: tomorrow
      }
    })
      .populate('patient', 'name age gender tokenNumber')
      .populate('surgeons', 'name')
      .sort('scheduledDate');
    
    // Group by OT number and status
    const schedule = {};
    
    operations.forEach(op => {
      if (!schedule[op.otNumber]) {
        schedule[op.otNumber] = {
          scheduled: [],
          inProgress: null,
          completed: []
        };
      }
      
      if (op.status === 'in-progress') {
        schedule[op.otNumber].inProgress = op;
      } else if (op.status === 'scheduled') {
        schedule[op.otNumber].scheduled.push(op);
      } else if (op.status === 'completed') {
        schedule[op.otNumber].completed.push(op);
      }
    });
    
    res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};
