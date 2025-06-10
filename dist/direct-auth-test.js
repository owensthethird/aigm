"use strict";
// src/direct-auth-test.ts
// A simplified test script that focuses solely on the X-N8N-API-KEY header authentication
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const util = __importStar(require("util"));
async function testDirectAuth() {
    console.log('🔑 Testing n8n API authentication with X-N8N-API-KEY header only...');
    // Load the API key and baseUrl from config
    const configPath = path.join(process.cwd(), 'n8n-config.json');
    console.log(`Reading config from: ${configPath}`);
    if (!fs.existsSync(configPath)) {
        console.error(`Config file not found: ${configPath}`);
        return;
    }
    const configContent = fs.readFileSync(configPath, 'utf8');
    console.log(`Config file content: ${configContent.length} characters`);
    const config = JSON.parse(configContent);
    console.log('Parsed config:', util.inspect(config, { depth: null }));
    if (!config.n8n || !config.n8n.apiKey) {
        console.error('API key not found in config');
        return;
    }
    const apiKey = config.n8n.apiKey;
    const baseUrl = config.n8n.baseUrl || 'http://localhost:5678';
    console.log(`🔌 Connecting to n8n at: ${baseUrl}`);
    console.log(`🔑 Using API key: ${apiKey.substring(0, 10)}...`);
    // Testing specific endpoints with only X-N8N-API-KEY header
    const endpoints = [
        { path: '/healthz', name: 'Health endpoint' },
        { path: '/api/v1/workflows', name: 'Workflows endpoint' },
        { path: '/api/v1/users', name: 'Users endpoint' }
    ];
    for (const endpoint of endpoints) {
        try {
            console.log(`\n📡 Testing ${endpoint.name}: ${baseUrl}${endpoint.path}`);
            console.log('🔑 Using X-N8N-API-KEY header');
            console.log('Request headers:', {
                'Content-Type': 'application/json',
                'X-N8N-API-KEY': `${apiKey.substring(0, 3)}...${apiKey.substring(apiKey.length - 3)}`
            });
            const response = await (0, axios_1.default)({
                method: 'GET',
                url: `${baseUrl}${endpoint.path}`,
                headers: {
                    'Content-Type': 'application/json',
                    'X-N8N-API-KEY': apiKey.trim() // Ensure no whitespace in API key
                },
                validateStatus: status => true // Return response regardless of status code
            });
            console.log('Response headers:', response.headers);
            console.log(`🔢 Status code: ${response.status}`);
            if (response.status >= 200 && response.status < 300) {
                console.log('✅ SUCCESS!');
                console.log('Response data type:', typeof response.data);
                if (Array.isArray(response.data)) {
                    console.log(`Array length: ${response.data.length}`);
                    if (response.data.length > 0) {
                        console.log('First item sample:', JSON.stringify(response.data[0]).substring(0, 100) + '...');
                    }
                }
                else if (typeof response.data === 'object' && response.data !== null) {
                    console.log('Object keys:', Object.keys(response.data).join(', '));
                }
            }
            else {
                console.log('❌ FAILED!');
                console.log('Error response:', response.data);
            }
        }
        catch (error) {
            console.error(`❌ Request failed for ${endpoint.name}:`);
            // Handle Axios errors with proper type checking
            if (axios_1.default.isAxiosError(error) && error.response) {
                console.error('Error message:', error.message);
                console.error('Error status:', error.response.status);
                console.error('Error data:', error.response.data);
            }
            else if (error instanceof Error) {
                console.error('Error message:', error.message);
            }
            else {
                console.error('Unknown error:', String(error));
            }
        }
    }
}
// Enhance console.log to better display objects
const originalLog = console.log;
console.log = function (message, ...optionalParams) {
    if (typeof message === 'object' && message !== null) {
        originalLog(util.inspect(message, { depth: 3, colors: true }));
    }
    else {
        originalLog(message);
    }
    optionalParams.forEach(param => {
        if (typeof param === 'object' && param !== null) {
            originalLog(util.inspect(param, { depth: 3, colors: true }));
        }
        else {
            originalLog(param);
        }
    });
};
// Run the test
testDirectAuth().catch(error => {
    console.error('Unhandled error:', error instanceof Error ? error.message : String(error));
});
