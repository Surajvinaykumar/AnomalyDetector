import { AuthService } from '../services/authService';

async function createDefaultUser() {
  console.log('Creating default user...');
  
  try {
    const result = await AuthService.register('root', 'root@example.com', 'rootroot');
    if (result.success) {
      console.log('Default user created successfully');
    } else {
      if (result.message.includes('already exists')) {
        console.log('Default user already exists');
      } else {
        console.error('Failed to create default user:', result.message);
      }
    }
  } catch (error) {
    console.error('Error creating default user:', error);
  }
}

createDefaultUser();