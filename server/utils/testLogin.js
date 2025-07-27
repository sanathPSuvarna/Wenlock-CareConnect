const axios = require('axios');

// Define the API base URL
const API_URL = 'http://localhost:5000';

// Test login function
async function testLogin() {
  try {
    console.log('Testing login with admin credentials...');
    
    // Attempt to login with admin credentials
    const loginResponse = await axios.post(`${API_URL}/api/users/login`, {
      email: 'admin@example.com',
      password: 'password123'
    });
    
    console.log('Login successful!');
    console.log('User data:', {
      name: loginResponse.data.name,
      email: loginResponse.data.email,
      role: loginResponse.data.role,
      id: loginResponse.data._id
    });
    console.log('Token received:', loginResponse.data.token ? 'Yes' : 'No');
    
    // Now try to access a protected route
    if (loginResponse.data.token) {
      console.log('\nTesting protected route access...');
      
      const usersResponse = await axios.get(`${API_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${loginResponse.data.token}`
        }
      });
      
      console.log('Protected route access successful!');
      console.log(`Retrieved ${usersResponse.data.length} users from the system`);
    }
  } catch (error) {
    console.error('Error during login test:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testLogin();
