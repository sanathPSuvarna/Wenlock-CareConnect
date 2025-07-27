const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a medication name'],
    unique: true,
    trim: true
  },
  genericName: {
    type: String,
    required: [true, 'Please add a generic name']
  },
  category: {
    type: String,
    required: [true, 'Please add a category']
  },
  dosageForm: {
    type: String,
    required: [true, 'Please add a dosage form'],
    enum: ['tablet', 'capsule', 'injection', 'syrup', 'ointment', 'cream', 'drops', 'inhaler', 'other']
  },
  strength: {
    type: String,
    required: [true, 'Please add strength']
  },
  manufacturer: {
    type: String,
    required: [true, 'Please add a manufacturer']
  },
  currentStock: {
    type: Number,
    required: [true, 'Please add current stock'],
    min: [0, 'Stock cannot be negative']
  },
  reorderLevel: {
    type: Number,
    required: [true, 'Please add reorder level']
  },
  expiryDate: {
    type: Date,
    required: [true, 'Please add expiry date']
  },
  batchNumber: {
    type: String,
    required: [true, 'Please add batch number']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Please add unit price']
  },
  location: {
    type: String,
    required: [true, 'Please add storage location']
  },
  prescriptionRequired: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
medicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Medication', medicationSchema);
