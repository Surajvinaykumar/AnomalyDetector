import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { AuthService } from './src/services/authService';
import pool from './src/config/db';

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
    // Only allow syslog files
    if (!file.originalname.endsWith('.log')) {
      return cb(new Error('Only .log files are allowed'), '');
    }
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Authentication middleware
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  const result = await AuthService.verifyToken(token);
  if (!result.valid) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
  
  req.user = result.user;
  next();
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
    
    const result = await AuthService.register(username, email, password);
    
    if (result.success) {
      return res.status(201).json({ message: result.message, user: result.user });
    } else {
      return res.status(400).json({ error: result.message });
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
    
    const result = await AuthService.login(username, password);
    
    if (result.success) {
      return res.status(200).json({ message: result.message, token: result.token, user: result.user });
    } else {
      return res.status(401).json({ error: result.message });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // File validation
    if (!req.file.originalname.endsWith('.log')) {
      return res.status(400).json({ error: 'Only .log files are allowed' });
    }
    
    // Check file size
    if (req.file.size > 10 * 1024 * 1024) { // 10MB
      return res.status(400).json({ error: 'File size exceeds 10MB limit' });
    }
    
    // Read file content
    const fs = require('fs');
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
    return res.status(500).json({ error: 'File upload failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});