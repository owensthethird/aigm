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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/auth-test.ts
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const util = __importStar(require("util"));
async function testAuth() {
    var _a, _b;
    console.log('🔑 Testing n8n authentication methods...');
    // Load config from file
    let apiKey = '';
    let baseUrl = 'http://localhost:5678'; // Default n8n URL
    try {
        const configPath = path.join(process.cwd(), 'n8n-config.json');
        if (fs.existsSync(configPath)) {
            const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            console.log('Loaded n8n-config.json');
            if (configData.n8n && configData.n8n.apiKey) {
                apiKey = configData.n8n.apiKey;
                console.log('Found API key in config file');
                if (apiKey.length > 10) {
                    console.log(`API key (first 10 chars): ${apiKey.substring(0, 10)}...`);
                }
                else {
                    console.log(`API key: ${apiKey}`);
                }
            }
            if (configData.n8n && configData.n8n.baseUrl) {
                baseUrl = configData.n8n.baseUrl;
            }
        }
    }
    catch (error) {
        console.error('Error loading config:', error instanceof Error ? error.message : String(error));
    }
    if (!apiKey) {
        console.error('No API key found in config file');
        process.exit(1);
    }
    console.log(`Testing connection to n8n at: ${baseUrl}`);
    // Test different authentication methods
    const methods = [
        {
            name: 'X-N8N-API-KEY header',
            headers: { 'X-N8N-API-KEY': apiKey }
        },
        {
            name: 'Bearer token in Authorization header',
            headers: { 'Authorization': `Bearer ${apiKey}` }
        },
        {
            name: 'API key as query parameter',
            params: { apiKey }
        },
        {
            name: 'No authentication (baseline test)',
            headers: {}
        }
    ];
    const endpoints = [
        { path: '/healthz', name: 'Health endpoint' },
        { path: '/api/v1/workflows', name: 'Workflows endpoint' },
        { path: '/api/v1/users', name: 'Users endpoint' }
    ];
    for (const method of methods) {
        console.log(`\nTrying authentication method: ${method.name}`);
        for (const endpoint of endpoints) {
            try {
                const url = `${baseUrl}${endpoint.path}`;
                console.log(`Testing ${endpoint.name}: ${url}`);
                const response = await (0, axios_1.default)({
                    method: 'GET',
                    url,
                    headers: Object.assign({ 'Content-Type': 'application/json' }, (method.headers || {})),
                    params: method.params
                });
                console.log(`✅ SUCCESS with ${method.name} on ${endpoint.name}`);
                console.log(`Status: ${response.status}`);
                console.log('Response type:', typeof response.data);
                if (Array.isArray(response.data)) {
                    console.log(`Array length: ${response.data.length}`);
                }
                else if (typeof response.data === 'object' && response.data !== null) {
                    console.log(`Object keys: ${Object.keys(response.data).join(', ')}`);
                }
            }
            catch (error) {
                console.error(`❌ FAILED with ${method.name} on ${endpoint.name}:`);
                if (axios_1.default.isAxiosError(error)) {
                    console.error(`Status: ${((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) || 'unknown'}`);
                    console.error(`Message: ${error.message}`);
                    if ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) {
                        console.error('Error data:', error.response.data);
                    }
                }
                else {
                    console.error('Error:', error instanceof Error ? error.message : String(error));
                }
            }
        }
    }
}
// Custom console.log for better object display
const originalLog = console.log;
console.log = function (message, ...optionalParams) {
    if (typeof message === 'object' && message !== null) {
        process.stdout.write(util.inspect(message, { depth: 4, colors: true }) + '\n');
    }
    else {
        process.stdout.write(String(message) + '\n');
    }
    optionalParams.forEach(param => {
        if (typeof param === 'object' && param !== null) {
            process.stdout.write(util.inspect(param, { depth: 4, colors: true }) + '\n');
        }
        else {
            process.stdout.write(String(param) + '\n');
        }
    });
};
testAuth().catch(error => {
    console.error('Unhandled error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
});
