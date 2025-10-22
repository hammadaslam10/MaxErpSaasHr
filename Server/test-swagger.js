const axios = require('axios');

async function testAPI() {
  const baseURL = 'http://localhost:4001';
  
  try {
    console.log('🧪 Testing MaxERP API...\n');
    
    // Test 1: Login
    console.log('1. Testing login...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'john.doe@company.com',
      password: 'password123'
    });
    
    console.log('✅ Login successful!');
    console.log(`   User: ${loginResponse.data.user.name} (${loginResponse.data.user.role})`);
    console.log(`   Token: ${loginResponse.data.token.substring(0, 20)}...\n`);
    
    const token = loginResponse.data.token;
    
    // Test 2: Apply for leave
    console.log('2. Testing leave application...');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    const endDate = new Date(futureDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const leaveResponse = await axios.post(`${baseURL}/leave/apply`, {
      type: 'ANNUAL',
      startDate: futureDateStr,
      endDate: endDate,
      reason: 'API test leave request'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Leave application successful!');
    console.log(`   Request ID: ${leaveResponse.data.id}`);
    console.log(`   Status: ${leaveResponse.data.status}\n`);
    
    // Test 3: Login as manager
    console.log('3. Testing manager login...');
    const managerLoginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'mike.johnson@company.com',
      password: 'password123'
    });
    
    console.log('✅ Manager login successful!');
    console.log(`   Manager: ${managerLoginResponse.data.user.name}\n`);
    
    const managerToken = managerLoginResponse.data.token;
    
    // Test 4: Get pending requests
    console.log('4. Testing pending requests...');
    const pendingResponse = await axios.get(`${baseURL}/leave/pending`, {
      headers: {
        'Authorization': `Bearer ${managerToken}`
      }
    });
    
    console.log('✅ Pending requests retrieved!');
    console.log(`   Found ${pendingResponse.data.length} pending requests\n`);
    
    // Test 5: Approve request
    if (pendingResponse.data.length > 0) {
      console.log('5. Testing leave approval...');
      const requestId = pendingResponse.data[0].id;
      
      const approveResponse = await axios.put(`${baseURL}/leave/approve/${requestId}`, {
        status: 'APPROVED',
        comments: 'Approved via API test'
      }, {
        headers: {
          'Authorization': `Bearer ${managerToken}`
        }
      });
      
      console.log('✅ Leave request approved!');
      console.log(`   Status: ${approveResponse.data.status}\n`);
    }
    
    console.log('🎉 All API tests passed!');
    console.log('\n📚 API Documentation:');
    console.log(`   Swagger UI: http://localhost:4001/api/docs`);
    console.log(`   Alternative: http://localhost:4002/api/docs`);
    
  } catch (error) {
    console.error('❌ API Test failed:', error.response?.data || error.message);
  }
}

// Wait for server to start
setTimeout(testAPI, 10000);
