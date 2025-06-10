"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
// src/config.ts
require("dotenv/config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Try to load configuration from n8n-config.json if available
let n8nConfigFile = {};
try {
    const configPath = path.join(process.cwd(), 'n8n-config.json');
    if (fs.existsSync(configPath)) {
        n8nConfigFile = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log('Loaded configuration from n8n-config.json');
    }
}
catch (error) {
    console.warn('Could not load n8n-config.json:', error instanceof Error ? error.message : String(error));
}
exports.config = {
    n8n: {
        baseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678',
        apiKey: process.env.N8N_API_KEY || (n8nConfigFile.n8n && n8nConfigFile.n8n.apiKey),
        // If you don't have API key, use basic auth instead:
        // username: process.env.N8N_USERNAME,
        // password: process.env.N8N_PASSWORD,
    },
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'n8n',
        user: process.env.DB_USER || 'n8n',
        password: process.env.DB_PASSWORD || '',
    },
};
