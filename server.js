import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow JSON, CSV, XML, and log files
  const allowedExtensions = ['.json', '.csv', '.xml', '.log'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!allowedExtensions.includes(ext)) {
    return cb(null, false);
  }
  
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'anomaly_detector',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'anomaly_detector_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    
    // Basic validation
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    
    const client = await pool.connect();
    
    try {
      // Check if user already exists
      const existingUser = await client.query('SELECT id FROM users WHERE username = $1 OR email = $2', [username, email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'User with this username or email already exists' });
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
      return res.status(201).json({ message: 'User registered successfully', user });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const client = await pool.connect();
    
    try {
      // Find user
      const result = await client.query('SELECT id, username, email, password_hash, created_at, updated_at FROM users WHERE username = $1', [username]);
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const user = result.rows[0];
      
      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        process.env.JWT_SECRET || 'anomaly_detector_secret_key',
        { expiresIn: '24h' }
      );
      
      // Remove password_hash from user object
      const { password_hash, ...userWithoutPassword } = user;
      
      return res.status(200).json({ message: 'Login successful', token, user: userWithoutPassword });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload endpoint
app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
  try {
    // Check if any files were uploaded
    if (!req.file) {
      // Check if files were rejected due to file filter
      // When multer rejects a file due to fileFilter, req.file will be undefined
      // but the request may still contain files
      const files = req.files;
      if (req.file === undefined) {
        return res.status(400).json({ error: 'File type not allowed. Supported formats: JSON, CSV, XML, and log files.' });
      }
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // File validation
    const allowedExtensions = ['.json', '.csv', '.xml', '.log'];
    const ext = path.extname(req.file.originalname).toLowerCase();
    
    if (!allowedExtensions.includes(ext)) {
      return res.status(400).json({ error: 'File type not allowed. Supported formats: JSON, CSV, XML, and log files.' });
    }
    
    // Check file size
    if (req.file.size > 10 * 1024 * 1024) { // 10MB
      return res.status(400).json({ error: 'File size exceeds 10MB limit' });
    }
    
    // Read file content
    const content = fs.readFileSync(req.file.path, 'utf8');
    
    // Return file info and content
    return res.status(200).json({
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        content: content
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    return res.status(500).json({ error: 'File upload failed. Please try again.' });
  }
});

// Error handling for multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds 10MB limit' });
    }
  }
  
  if (error.message && error.message.includes('File type not allowed')) {
    return res.status(400).json({ error: 'File type not allowed. Supported formats: JSON, CSV, XML, and log files.' });
  }
  
  next(error);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});