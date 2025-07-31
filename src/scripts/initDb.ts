import pool from '../config/db';

async function initDb() {
  const client = await pool.connect();
  
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Database initialized successfully');
    
    // Create default user
    console.log('Creating default user...');
    const { AuthService } = await import('../services/authService');
    const registerResult = await AuthService.register('root', 'root@example.com', 'rootroot');
    if (registerResult.success) {
      console.log('Default user created successfully');
    } else {
      if (registerResult.message.includes('already exists')) {
        console.log('Default user already exists');
      } else {
        console.error('Failed to create default user:', registerResult.message);
      }
    }
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    await pool.end();
  }
}

initDb();