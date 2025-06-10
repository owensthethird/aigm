// src/workflow-test.ts
// A direct test script focused on creating a workflow with the n8n API

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

async function testWorkflowCreation() {
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
    const response = await axios({
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
  } catch (error) {
    console.error('❌ Error creating workflow:');
    
    if (axios.isAxiosError(error) && error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Error details:', error.response.data);
      console.error('Response headers:', error.response.headers);
    } else if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(String(error));
    }

    // If we got a 400 error, let's try to diagnose what might be missing
    if (axios.isAxiosError(error) && error.response?.status === 400) {
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
