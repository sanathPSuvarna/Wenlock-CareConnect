const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/userModel');
const Department = require('../models/departmentModel');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully');
    checkData();
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Check data in the database
async function checkData() {
  try {
    // Check departments
    const departments = await Department.find().select('name code location');
    console.log(`\n=== DEPARTMENTS (${departments.length}) ===`);
    
    if (departments.length === 0) {
      console.log('No departments found in the database');
    } else {
      departments.forEach((dept, index) => {
        console.log(`${index + 1}. ${dept.name} (${dept.code}), Location: ${dept.location.floor} floor, ${dept.location.wing} wing, ID: ${dept._id}`);
      });
    }
    
    // Check users
    const users = await User.find().select('name email role department').populate('department', 'name');
    console.log(`\n=== USERS (${users.length}) ===`);
    
    if (users.length === 0) {
      console.log('No users found in the database');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name}, Email: ${user.email}, Role: ${user.role}, Department: ${user.department ? user.department.name : 'N/A'}, ID: ${user._id}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking data:', error);
    process.exit(1);
  }
}
