// src/minimal-workflow-test.ts
// A minimal test script for workflow creation with only essential properties

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

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
    const response = await axios({
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
  } catch (error) {
    console.error('❌ Error creating workflow:');
    
    if (axios.isAxiosError(error) && error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Error details:', error.response.data);
    } else if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(String(error));
    }
  }
}

// Run the test
createMinimalWorkflow().catch(error => {
  console.error('Unhandled error:', error instanceof Error ? error.message : String(error));
});
