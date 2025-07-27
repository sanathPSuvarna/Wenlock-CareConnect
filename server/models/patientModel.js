const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  age: {
    type: Number,
    required: [true, 'Please add age']
  },
  gender: {
    type: String,
    required: [true, 'Please add gender'],
    enum: ['male', 'female', 'other']
  },
  contactNumber: {
    type: String,
    required: [true, 'Please add a contact number']
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  department: {
    type: mongoose.Schema.ObjectId,
    ref: 'Department',
    required: [true, 'Please add a department']
  },
  doctor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Please add an appointment date']
  },
  status: {
    type: String,
    enum: ['waiting', 'in-consultation', 'completed', 'no-show', 'rescheduled'],
    default: 'waiting'
  },
  tokenNumber: {
    type: String
  },
  notes: {
    type: String
  },
  emergency: {
    type: Boolean,
    default: false
  },
  medicalHistory: {
    type: String
  },
  prescriptions: [{
    medication: {
      type: String,
      required: true
    },
    dosage: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    notes: String,
    prescribed: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate simple token number based on department
patientSchema.pre('save', async function(next) {
  if (!this.tokenNumber) {
    const Department = mongoose.model('Department');
    const department = await Department.findById(this.department);
    
    // Count all patients in the same department to generate sequential number
    const patientCount = await mongoose.model('Patient').countDocuments({
      department: this.department
    }) + 1;
    
    // Simple format: DEPT-001
    const deptCode = department.code || department.name.substring(0, 3).toUpperCase();
    this.tokenNumber = `${deptCode}-${patientCount.toString().padStart(3, '0')}`;
    
    // Add emergency prefix if it's an emergency case
    if (this.emergency) {
      this.tokenNumber = `E-${this.tokenNumber}`;
    }
  }
  
  next();
});

module.exports = mongoose.model('Patient', patientSchema);
