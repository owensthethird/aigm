// src/cli.ts
// Import the server initialization function
import { initServer } from './server';

// Start the server
console.log('Starting aiGM server...');
initServer().catch(error => {
  console.error('Failed to start server:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});