"use strict";
// src/workflow-test.ts
// A direct test script focused on creating a workflow with the n8n API
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
async function testWorkflowCreation() {
    var _a;
    console.log('🔧 Testing workflow creation with n8n API...');
    // Load config
    const configPath = path.join(process.cwd(), 'n8n-config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const apiKey = config.n8n.apiKey;
    const baseUrl = config.n8n.baseUrl || 'http://localhost:5678';
    console.log(`🔌 Connecting to n8n at: ${baseUrl}`);
    // Create a simple test workflow - following n8n schema exactly
    const testWorkflow = {
        name: "aiGameMaster Test Workflow",
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
        // active: false, // Removed - this property is read-only according to the API error
        settings: {
            saveManualExecutions: true,
            callerPolicy: "workflowsFromSameOwner"
        },
        tags: ["test", "aiGameMaster"]
    };
    console.log('📝 Sending workflow creation request with data:');
    console.log(JSON.stringify(testWorkflow, null, 2));
    try {
        const response = await (0, axios_1.default)({
            method: 'POST',
            url: `${baseUrl}/api/v1/workflows`,
            headers: {
                'Content-Type': 'application/json',
                'X-N8N-API-KEY': apiKey
            },
            data: testWorkflow
        });
        console.log(`✅ Workflow created successfully! Status: ${response.status}`);
        console.log('Created workflow:', response.data);
    }
    catch (error) {
        console.error('❌ Error creating workflow:');
        if (axios_1.default.isAxiosError(error) && error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error('Error details:', error.response.data);
            console.error('Response headers:', error.response.headers);
        }
        else if (error instanceof Error) {
            console.error(error.message);
        }
        else {
            console.error(String(error));
        }
        // If we got a 400 error, let's try to diagnose what might be missing
        if (axios_1.default.isAxiosError(error) && ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 400) {
            console.log('\n🔍 DIAGNOSTIC INFORMATION:');
            console.log('Required workflow properties according to n8n documentation:');
            console.log('- name: string (provided)');
            console.log('- nodes: array (provided)');
            console.log('- connections: object (provided)');
            console.log('- settings: object (provided)');
            console.log('- active: boolean (provided)');
        }
    }
}
// Run the test
testWorkflowCreation().catch(error => {
    console.error('Unhandled error:', error instanceof Error ? error.message : String(error));
});
