import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';

import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { connectDB } from './config/database';
import { createFolders } from './utils/createFolders';

import apiRoutes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS
app.use(cors());
app.set('trust proxy', true);

// Compression
app.use(
  compression({
    filter: (req, res) => {
      if (req.path && req.path.includes('/sitemap') && req.path.endsWith('.gz')) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create upload folders
createFolders();

// Serve static files
app.use('/public', express.static('public'));

// Serve uploads with CORS headers
app.use(
  '/uploads',
  (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    );
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');

    if (req.path.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      res.header('Cache-Control', 'public, max-age=31536000'); // 1 year
    }

    next();
  },
  express.static('uploads')
);

// Blog uploads with CORS headers
app.get('/uploads/blog/:filename', (req, res) => {
  const filename = req.params.filename;

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cache-Control', 'public, max-age=31536000');

  res.sendFile(path.join(__dirname, '../uploads', 'blog', filename), err => {
    if (err) {
      res.status(404).json({ error: 'Image not found' });
    }
  });
});

// Author uploads with CORS headers
app.get('/uploads/authors/:filename', (req, res) => {
  const filename = req.params.filename;

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cache-Control', 'public, max-age=31536000');

  res.sendFile(path.join(__dirname, '../uploads', 'authors', filename), err => {
    if (err) {
      res.status(404).json({ error: 'Image not found' });
    }
  });
});

// API routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Metricmint Digital Backend API' });
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;

