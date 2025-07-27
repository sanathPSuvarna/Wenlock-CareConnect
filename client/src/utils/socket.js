import { io } from 'socket.io-client';

// Create a socket connection to the server
const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Event handlers
const socketEvents = {
  connect: (callback) => {
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      if (callback) callback(socket);
    });
  },
  
  disconnect: (callback) => {
    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (callback) callback(reason);
    });
  },
  
  error: (callback) => {
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      if (callback) callback(error);
    });
  },
  
  // Patient updates
  patientUpdated: (callback) => {
    socket.on('patient_updated', (data) => {
      if (callback) callback(data);
    });
  },
  
  // Operation theater updates
  otStatusUpdated: (callback) => {
    socket.on('ot_status_updated', (data) => {
      if (callback) callback(data);
    });
  },
  
  // Emergency alerts
  emergencyAlert: (callback) => {
    socket.on('emergency_alert', (data) => {
      if (callback) callback(data);
    });
  },
  
  // Medication availability updates
  medicationUpdated: (callback) => {
    socket.on('medication_updated', (data) => {
      if (callback) callback(data);
    });
  },

  // Department updates
  departmentUpdated: (callback) => {
    socket.on('department_updated', (data) => {
      if (callback) callback(data);
    });
  },

  // Custom event listener
  on: (event, callback) => {
    socket.on(event, (data) => {
      if (callback) callback(data);
    });
  },
};

// Socket emitters
const socketEmitters = {
  // Connect to the socket server
  connect: (token) => {
    if (token) {
      socket.auth = { token };
    }
    socket.connect();
  },
  
  // Disconnect from the socket server
  disconnect: () => {
    socket.disconnect();
  },

  // Update patient status
  updatePatient: (patient) => {
    socket.emit('update_patient', patient);
  },

  // Update OT status
  updateOTStatus: (data) => {
    socket.emit('update_ot_status', data);
  },

  // Send emergency alert
  sendEmergencyAlert: (data) => {
    socket.emit('send_emergency_alert', data);
  },

  // Update medication availability
  updateMedication: (medication) => {
    socket.emit('update_medication', medication);
  },

  // Custom event emitter
  emit: (event, data) => {
    socket.emit(event, data);
  },
};

const socketService = {
  socket,
  events: socketEvents,
  emitters: socketEmitters,
};

export default socketService;
