import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';

async function testAPI() {
  try {
    console.log('Testing API endpoints...\n');
    
    // Test admin health
    console.log('1. Testing admin health endpoint...');
    const healthResponse = await fetch(`${API_BASE}/admin/health`);
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);
    console.log('Status:', healthResponse.status);
    console.log('');
    
    // Test users endpoint
    console.log('2. Testing users endpoint...');
    const usersResponse = await fetch(`${API_BASE}/admin/users`);
    const usersData = await usersResponse.json();
    console.log('Users count:', usersData.users?.length || 0);
    console.log('Status:', usersResponse.status);
    
    if (usersData.users && usersData.users.length > 0) {
      const firstUser = usersData.users[0];
      console.log('First user ID:', firstUser._id || firstUser.id);
      console.log('First user name:', firstUser.name);
      console.log('First user role:', firstUser.role);
      console.log('');
      
      // Test individual user endpoint
      const userId = firstUser._id || firstUser.id;
      console.log(`3. Testing individual user endpoint for ID: ${userId}...`);
      const userResponse = await fetch(`${API_BASE}/admin/users/${userId}`);
      const userData = await userResponse.json();
      console.log('User detail status:', userResponse.status);
      console.log('User detail success:', userData.success);
      
      if (userData.user) {
        console.log('User found:', userData.user.name);
        console.log('User role:', userData.user.role);
      } else {
        console.log('User not found or error:', userData);
      }
    } else {
      console.log('No users found. Please run the seeding script first.');
    }
    
  } catch (error) {
    console.error('API test error:', error.message);
    console.log('\nMake sure the backend server is running on port 3000');
    console.log('You can start it with: npm run dev');
  }
}

testAPI();