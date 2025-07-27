const mongoose = require('mongoose');

const operationSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.ObjectId,
    ref: 'Patient',
    required: [true, 'Please add a patient']
  },
  otNumber: {
    type: String,
    required: [true, 'Please add an operation theater number']
  },
  surgeryType: {
    type: String,
    required: [true, 'Please add surgery type']
  },
  surgeons: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Please add at least one surgeon']
  }],
  assistingStaff: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  scheduledDate: {
    type: Date,
    required: [true, 'Please add a scheduled date']
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'postponed'],
    default: 'scheduled'
  },
  preOpNotes: {
    type: String
  },
  postOpNotes: {
    type: String
  },
  complications: {
    type: String
  },
  priority: {
    type: String,
    enum: ['normal', 'urgent', 'emergency'],
    default: 'normal'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Operation', operationSchema);
