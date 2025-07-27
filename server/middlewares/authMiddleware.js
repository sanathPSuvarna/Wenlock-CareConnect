const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Middleware to protect routes
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
    }
    // console.log('Token:', token);
    // Check if no token
    if (!token) {
      return res.status(401).json({
        message: 'Not authorized to access this route, no token'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // console.log("dec"+decoded);
      
      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({
          message: 'Not authorized, user not found'
        });
      }
      
      next();
    } catch (error) {
      console.log(error)
      return res.status(401).json({
        message: 'Not authorized, invalid token'
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Server Error',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Not authorized, no user'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    
    next();
  };
};
