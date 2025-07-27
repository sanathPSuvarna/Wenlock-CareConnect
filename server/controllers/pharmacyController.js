const Medication = require('../models/medicationModel');

// @desc    Create a new medication
// @route   POST /api/pharmacy
// @access  Private
exports.createMedication = async (req, res) => {
  try {
    const medication = await Medication.create(req.body);
    
    res.status(201).json({
      success: true,
      data: medication
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// @desc    Get all medications
// @route   GET /api/pharmacy
// @access  Private
exports.getMedications = async (req, res) => {
  try {
    // Initialize query
    let query = Medication.find();
    
    // Add filter options
    const { category, name, lowStock, expired } = req.query;
    
    // Filter by category
    if (category) {
      query = query.find({ category });
    }
    
    // Search by name
    if (name) {
      query = query.find({
        $or: [
          { name: { $regex: name, $options: 'i' } },
          { genericName: { $regex: name, $options: 'i' } }
        ]
      });
    }
    
    // Filter low stock items
    if (lowStock === 'true') {
      query = query.find({
        $expr: { $lte: ['$currentStock', '$reorderLevel'] }
      });
    }
    
    // Filter expired items
    if (expired === 'true') {
      const today = new Date();
      query = query.find({ expiryDate: { $lt: today } });
    }
    
    // Sorting
    query = query.sort({ name: 1 });
    
    // Execute query
    const medications = await query;
    
    res.status(200).json({
      success: true,
      count: medications.length,
      data: medications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// @desc    Get single medication
// @route   GET /api/pharmacy/:id
// @access  Private
exports.getMedication = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    
    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: medication
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// @desc    Update medication
// @route   PUT /api/pharmacy/:id
// @access  Private
exports.updateMedication = async (req, res) => {
  try {
    const medication = await Medication.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: medication
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// @desc    Delete medication
// @route   DELETE /api/pharmacy/:id
// @access  Private
exports.deleteMedication = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    
    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }
    
    await medication.remove();
    
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

// @desc    Update medication stock
// @route   PUT /api/pharmacy/:id/stock
// @access  Private
exports.updateStock = async (req, res) => {
  try {
    const { quantity, action } = req.body;
    
    if (!quantity || !action) {
      return res.status(400).json({
        success: false,
        message: 'Please provide quantity and action (add or subtract)'
      });
    }
    
    const medication = await Medication.findById(req.params.id);
    
    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }
    
    if (action === 'add') {
      medication.currentStock += Number(quantity);
    } else if (action === 'subtract') {
      if (medication.currentStock < Number(quantity)) {
        return res.status(400).json({
          success: false,
          message: 'Not enough stock available'
        });
      }
      medication.currentStock -= Number(quantity);
    } else {
      return res.status(400).json({
        success: false,
        message: "Action must be either 'add' or 'subtract'"
      });
    }
    
    medication.updatedAt = Date.now();
    
    await medication.save();
    
    res.status(200).json({
      success: true,
      data: medication
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// @desc    Get inventory dashboard summary
// @route   GET /api/pharmacy/dashboard
// @access  Private
exports.getInventorySummary = async (req, res) => {
  try {
    // Total number of medications
    const totalCount = await Medication.countDocuments();
    
    // Low stock items
    const lowStockItems = await Medication.find({
      $expr: { $lte: ['$currentStock', '$reorderLevel'] }
    }).countDocuments();
    
    // Expired medications
    const today = new Date();
    const expiredItems = await Medication.find({
      expiryDate: { $lt: today }
    }).countDocuments();
    
    // Get medications by category
    const categoryData = await Medication.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Average stock value
    const stockValueData = await Medication.aggregate([
      {
        $project: {
          totalValue: { $multiply: ['$currentStock', '$unitPrice'] }
        }
      },
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$totalValue' },
          averageValue: { $avg: '$totalValue' }
        }
      }
    ]);
    
    const stockValue = stockValueData.length > 0 ? {
      total: stockValueData[0].totalValue,
      average: stockValueData[0].averageValue
    } : {
      total: 0,
      average: 0
    };
    
    res.status(200).json({
      success: true,
      data: {
        totalCount,
        lowStockItems,
        expiredItems,
        categoryData,
        stockValue
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
