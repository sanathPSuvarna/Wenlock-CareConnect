const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/userModel');
const Department = require('../models/departmentModel');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Sample departments data to create if not exists
const departments = [
  {
    name: 'Cardiology',
    code: 'CARD',
    description: 'Heart and cardiovascular system',
    location: { floor: '3rd', wing: 'East' }
  },
  {
    name: 'Emergency',
    code: 'EMER',
    description: 'Emergency medical services',
    location: { floor: '1st', wing: 'Central' }
  },
  {
    name: 'Administration',
    code: 'ADMN',
    description: 'Hospital administration and management',
    location: { floor: 'Ground', wing: 'West' }
  },
  {
    name: 'General Medicine',
    code: 'GMED',
    description: 'General medical services',
    location: { floor: '2nd', wing: 'West' }
  },
  {
    name: 'Pediatrics',
    code: 'PEDS',
    description: 'Medical care for children',
    location: { floor: '4th', wing: 'East' }
  },
  {
    name: 'Surgery',
    code: 'SURG',
    description: 'Surgical procedures and care',
    location: { floor: '3rd', wing: 'West' }
  }
];

// Sample users data
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin'
    // No department for admin
  },
  {
    name: 'Dr. John Smith',
    email: 'john@example.com',
    password: 'password123',
    role: 'doctor',
    departmentName: 'Cardiology' // Will be replaced with an actual department ID
  },
  {
    name: 'Dr. Sarah Johnson',
    email: 'sarah@example.com',
    password: 'password123',
    role: 'doctor',
    departmentName: 'Surgery'
  },
  {
    name: 'Nurse Emma Wilson',
    email: 'emma@example.com',
    password: 'password123',
    role: 'nurse',
    departmentName: 'Emergency'
  },
  {
    name: 'Pharmacist Michael Brown',
    email: 'michael@example.com',
    password: 'password123',
    role: 'pharmacy',
    departmentName: 'Pharmacy'
  },
  {
    name: 'Receptionist Lisa Davis',
    email: 'lisa@example.com',
    password: 'password123',
    role: 'reception',
    departmentName: 'Administration'
  }
];

// Create departments and users
const seedData = async () => {
  try {
    // Clear existing data
    await Department.deleteMany({});
    await User.deleteMany({});
    console.log('Data cleared');

    // Create departments
    const createdDepartments = await Department.create(departments);
    console.log(`${createdDepartments.length} departments created`);

    // Map department names to their IDs for reference
    const departmentMap = {};
    createdDepartments.forEach(dept => {
      departmentMap[dept.name] = dept._id;
    });

    // Create users with proper department references
    const usersToCreate = users.map(user => {
      if (user.departmentName) {
        const deptId = departmentMap[user.departmentName];
        if (deptId) {
          user.department = deptId;
        }
        delete user.departmentName; // Remove the temp field
      }
      return user;
    });

    const createdUsers = await User.create(usersToCreate);
    console.log(`${createdUsers.length} users created`);
    
    // Log created users (without passwords)
    createdUsers.forEach(user => {
      console.log(`Created user: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
    });

    console.log('Database seeding completed!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedData();
