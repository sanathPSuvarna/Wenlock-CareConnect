const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
app.use(cors({
  origin: '*', 
}));
// Middleware
app.get("/test",(req,res)=>{
  return  res.status(200).json("Hello Sabath");
})
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Handle real-time patient updates
  socket.on('patientUpdate', (data) => {
    io.emit('patientUpdate', data);
  });
  
  // Handle real-time OT updates
  socket.on('otUpdate', (data) => {
    io.emit('otUpdate', data);
  });
  
  // Handle emergency alerts
  socket.on('emergencyAlert', (data) => {
    io.emit('emergencyAlert', data);
  });
  
  // Handle pharmacy inventory updates
  socket.on('inventoryUpdate', (data) => {
    io.emit('inventoryUpdate', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/operations', require('./routes/operationRoutes'));
app.use('/api/pharmacy', require('./routes/pharmacyRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build/index.html'));
  });
}

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
