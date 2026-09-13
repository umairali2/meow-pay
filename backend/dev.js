/**
 * Development Startup Script for MeowPay Backend
 * This script provides enhanced development experience with hot reloading and monitoring
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting MeowPay Backend in Development Mode...');
console.log('='.repeat(50));

// Function to start the server
function startServer() {
  const serverPath = path.join(__dirname, 'server.js');
  const server = spawn('node', [serverPath], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });

  server.on('error', (error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

  server.on('exit', (code) => {
    console.log(`Server exited with code ${code}`);
    process.exit(code);
  });

  return server;
}

// Function to initialize database if needed
async function initializeDatabase() {
  console.log('📊 Checking database status...');
  
  const { exec } = require('child_process');
  
  return new Promise((resolve) => {
    exec('node init-db.js', { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        console.log('Database initialization skipped (may already exist)');
      } else {
        console.log('✅ Database initialized successfully');
      }
      resolve();
    });
  });
}

// Main startup function
async function main() {
  try {
    // Initialize database
    await initializeDatabase();

    // Start server
    console.log('🎯 Starting API server...');
    const server = startServer();

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down development server...');
      server.kill('SIGINT');
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down development server...');
      server.kill('SIGTERM');
    });

    console.log('✅ Development environment ready');
    console.log('📝 API Documentation: http://localhost:3001/api/info');
    console.log('🏥 Health Check: http://localhost:3001/health');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('Failed to start development environment:', error);
    process.exit(1);
  }
}

// Run startup
main();
