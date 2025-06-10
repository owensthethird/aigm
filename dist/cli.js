"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/cli.ts
// Import the server initialization function
const server_1 = require("./server");
// Start the server
console.log('Starting aiGM server...');
(0, server_1.initServer)().catch(error => {
    console.error('Failed to start server:', error instanceof Error ? error.message : String(error));
    process.exit(1);
});
