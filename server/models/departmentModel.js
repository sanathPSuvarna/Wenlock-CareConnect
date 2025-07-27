const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a department name'],
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Please add a department code'],
    unique: true,
    trim: true,
    maxlength: [5, 'Code cannot be more than 5 characters']
  },
  description: {
    type: String
  },
  location: {
    floor: {
      type: String,
      required: true
    },
    wing: {
      type: String,
      required: true
    }
  },
  headDoctor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  contactExtension: {
    type: String
  },
  operatingHours: {
    start: {
      type: String,
      default: '09:00'
    },
    end: {
      type: String,
      default: '17:00'
    }
  },
  maxDailyAppointments: {
    type: Number,
    default: 50
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Department', departmentSchema);
