import { AuthService } from '../services/authService';

async function testAuth() {
  console.log('Testing authentication flow...');
  
  // Test user registration
  console.log('Registering test user...');
  const registerResult = await AuthService.register('testuser', 'test@example.com', 'password123');
  console.log('Registration result:', registerResult);
  
  // Test user login
  console.log('Logging in test user...');
  const loginResult = await AuthService.login('testuser', 'password123');
  console.log('Login result:', loginResult);
  
  // Test invalid login
  console.log('Testing invalid login...');
  const invalidLoginResult = await AuthService.login('testuser', 'wrongpassword');
  console.log('Invalid login result:', invalidLoginResult);
}

testAuth();