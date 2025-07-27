const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medications: [{
    medication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medication',
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
    quantity: {
      type: Number,
      required: true
    },
    notes: {
      type: String
    },
    dispensed: {
      type: Boolean,
      default: false
    },
    dispensedAt: {
      type: Date
    },
    dispensedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'partial', 'dispensed', 'cancelled'],
    default: 'pending'
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
prescriptionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
