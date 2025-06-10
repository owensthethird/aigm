// restart.js
// A simple script to automatically restart the server if it crashes
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting server with auto-restart...');

// Function to start the server
function startServer() {
  // Set NODE_ENV to development
  const env = { ...process.env, NODE_ENV: 'development' };
  
  // Spawn the server process
  const server = spawn('node', ['dist/cli.js'], { 
    stdio: 'inherit',
    env
  });
  
  console.log(`Server started with PID: ${server.pid}`);
  
  // Handle server exit
  server.on('exit', (code, signal) => {
    if (code !== 0) {
      console.log(`Server process exited with code ${code}`);
      console.log('Restarting server...');
      // Restart the server after a short delay
      setTimeout(startServer, 1000);
    } else {
      console.log('Server process exited normally');
      process.exit(0);
    }
  });
  
  // Handle errors
  server.on('error', (err) => {
    console.error('Failed to start server:', err);
    console.log('Restarting server...');
    // Restart the server after a short delay
    setTimeout(startServer, 1000);
  });
  
  // Handle process signals
  process.on('SIGINT', () => {
    console.log('Received SIGINT. Stopping server...');
    server.kill('SIGINT');
    // Give the server some time to shut down gracefully
    setTimeout(() => {
      console.log('Exiting restart script');
      process.exit(0);
    }, 2000);
  });
  
  process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Stopping server...');
    server.kill('SIGTERM');
    // Give the server some time to shut down gracefully
    setTimeout(() => {
      console.log('Exiting restart script');
      process.exit(0);
    }, 2000);
  });
}

// Start the server
startServer();
