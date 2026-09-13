require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db, initializeDatabase } = require('./database');

// Import route modules
const catsRouter = require('./routes/cats');
const transactionsRouter = require('./routes/transactions');
const transferRouter = require('./routes/transfer');

// Import middleware
const { defaultRateLimiter, transferRateLimiter } = require('./middleware/rateLimit');

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors({
  origin: NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Initialize database
initializeDatabase();

// Health check endpoint with database status
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = await new Promise((resolve, reject) => {
      db.get('SELECT 1', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve('connected');
        }
      });
    });

    // Get database statistics
    const catCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM cats', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    const transactionCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM transactions', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      database: {
        status: dbStatus,
        cats: catCount,
        transactions: transactionCount
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      error: 'Database connection failed',
      details: NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// API root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'MeowPay API is running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      cats: '/api/cats',
      transactions: '/api/transactions',
      transactionsStats: '/api/transactions/statistics',
      catTransactions: '/api/transactions/cat/:catId',
      transfer: '/api/transfer',
      transferValidate: '/api/transfer/validate',
      apiInfo: '/api/info'
    }
  });
});

// Mount API routes with specific rate limiting
app.use('/api/cats', defaultRateLimiter, catsRouter);
app.use('/api/transactions', defaultRateLimiter, transactionsRouter);
app.use('/api/transfer', transferRateLimiter, transferRouter);

// API info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'MeowPay API',
    version: '1.0.0',
    description: 'Digital wallet API for cats to transfer treats',
    environment: NODE_ENV,
    endpoints: {
      cats: {
        getAll: 'GET /api/cats',
        getById: 'GET /api/cats/:id',
        create: 'POST /api/cats'
      },
      transactions: {
        getAll: 'GET /api/transactions',
        getStatistics: 'GET /api/transactions/statistics',
        getByCat: 'GET /api/transactions/cat/:catId',
        getById: 'GET /api/transactions/:id'
      },
      transfer: {
        execute: 'POST /api/transfer',
        validate: 'POST /api/transfer/validate'
      }
    },
    documentation: '/api/docs',
    health: '/health',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  res.status(err.status || 500).json({
    error: NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    message: NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
    timestamp: new Date().toISOString(),
    ...(NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MeowPay API server is running on port ${PORT}`);
  console.log(`📝 Environment: ${NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  try {
    // Close database connection
    await new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✓ Database connection closed');
          resolve();
        }
      });
    });
    
    console.log('✓ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error during shutdown:', error.message);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});
