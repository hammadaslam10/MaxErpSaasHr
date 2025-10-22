const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing API...');
    
    // Test login
    const response = await axios.post('http://localhost:4001/auth/login', {
      email: 'john.doe@company.com',
      password: 'password123'
    });
    
    console.log('Login successful:', response.data);
    
    // Test with token
    const token = response.data.token;
    const leaveResponse = await axios.post('http://localhost:4001/leave/apply', {
      type: 'ANNUAL',
      startDate: '2024-02-15',
      endDate: '2024-02-16',
      reason: 'Test leave request'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Leave application successful:', leaveResponse.data);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testAPI();
