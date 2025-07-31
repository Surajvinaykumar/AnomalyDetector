import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'anomaly_detector_secret_key';

interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export class AuthService {
  static async register(username: string, email: string, password: string): Promise<{ success: boolean; message: string; user?: Omit<User, 'password_hash'> }> {
    const client = await pool.connect();
    
    try {
      // Check if user already exists
      const existingUser = await client.query('SELECT id FROM users WHERE username = $1 OR email = $2', [username, email]);
      if (existingUser.rows.length > 0) {
        return { success: false, message: 'User with this username or email already exists' };
      }
      
      // Hash password
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);
      
      // Insert new user
      const result = await client.query(
        'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at, updated_at',
        [username, email, password_hash]
      );
      
      const user = result.rows[0];
      return { success: true, message: 'User registered successfully', user };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed' };
    } finally {
      client.release();
    }
  }
  
  static async login(username: string, password: string): Promise<{ success: boolean; message: string; token?: string; user?: Omit<User, 'password_hash'> }> {
    const client = await pool.connect();
    
    try {
      // Find user
      const result = await client.query('SELECT id, username, email, password_hash, created_at, updated_at FROM users WHERE username = $1', [username]);
      if (result.rows.length === 0) {
        return { success: false, message: 'Invalid credentials' };
      }
      
      const user = result.rows[0];
      
      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return { success: false, message: 'Invalid credentials' };
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Remove password_hash from user object
      const { password_hash, ...userWithoutPassword } = user;
      
      return { success: true, message: 'Login successful', token, user: userWithoutPassword };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    } finally {
      client.release();
    }
  }
  
  static async verifyToken(token: string): Promise<{ valid: boolean; user?: any }> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return { valid: true, user: decoded };
    } catch (error) {
      return { valid: false };
    }
  }
}