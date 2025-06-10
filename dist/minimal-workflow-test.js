"use strict";
// src/minimal-workflow-test.ts
// A minimal test script for workflow creation with only essential properties
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
async function createMinimalWorkflow() {
    console.log('🔧 Testing minimal workflow creation with n8n API...');
    // Load config
    const configPath = path.join(process.cwd(), 'n8n-config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const apiKey = config.n8n.apiKey;
    const baseUrl = config.n8n.baseUrl || 'http://localhost:5678';
    // Create an absolute minimal workflow with only required fields
    const minimalWorkflow = {
        name: "aiGameMaster",
        nodes: [
            {
                "id": "Start",
                "name": "Start",
                "type": "n8n-nodes-base.start",
                "position": [100, 300],
                "parameters": {}
            }
        ],
        connections: {},
        // Using empty settings object since API is strict about allowed properties
        settings: {}
    };
    console.log('📝 Sending minimal workflow creation request with data:');
    console.log(JSON.stringify(minimalWorkflow, null, 2));
    try {
        const response = await (0, axios_1.default)({
            method: 'POST',
            url: `${baseUrl}/api/v1/workflows`,
            headers: {
                'Content-Type': 'application/json',
                'X-N8N-API-KEY': apiKey
            },
            data: minimalWorkflow
        });
        console.log(`✅ Workflow created successfully! Status: ${response.status}`);
        console.log('Created workflow ID:', response.data.id);
        console.log('Workflow name:', response.data.name);
    }
    catch (error) {
        console.error('❌ Error creating workflow:');
        if (axios_1.default.isAxiosError(error) && error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error('Error details:', error.response.data);
        }
        else if (error instanceof Error) {
            console.error(error.message);
        }
        else {
            console.error(String(error));
        }
    }
}
// Run the test
createMinimalWorkflow().catch(error => {
    console.error('Unhandled error:', error instanceof Error ? error.message : String(error));
});
