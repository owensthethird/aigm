// src/auth-test.ts
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

async function testAuth(): Promise<void> {
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
        } else {
          console.log(`API key: ${apiKey}`);
        }
      }

      if (configData.n8n && configData.n8n.baseUrl) {
        baseUrl = configData.n8n.baseUrl;
      }
    }
  } catch (error) {
    console.error('Error loading config:', error instanceof Error ? error.message : String(error));
  }

  if (!apiKey) {
    console.error('No API key found in config file');
    process.exit(1);
  }

  console.log(`Testing connection to n8n at: ${baseUrl}`);

  // Define interface for authentication methods
  interface AuthMethod {
    name: string;
    headers?: Record<string, string>;
    params?: Record<string, string>;
  }
  
  // Test different authentication methods
  const methods: AuthMethod[] = [
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
        
        const response = await axios({
          method: 'GET',
          url,
          headers: {
            'Content-Type': 'application/json',
            ...(method.headers || {})
          },
          params: method.params
        });
        
        console.log(`✅ SUCCESS with ${method.name} on ${endpoint.name}`);
        console.log(`Status: ${response.status}`);
        console.log('Response type:', typeof response.data);
        
        if (Array.isArray(response.data)) {
          console.log(`Array length: ${response.data.length}`);
        } else if (typeof response.data === 'object' && response.data !== null) {
          console.log(`Object keys: ${Object.keys(response.data).join(', ')}`);
        }
        
      } catch (error) {
        console.error(`❌ FAILED with ${method.name} on ${endpoint.name}:`);
        
        if (axios.isAxiosError(error)) {
          console.error(`Status: ${error.response?.status || 'unknown'}`);
          console.error(`Message: ${error.message}`);
          if (error.response?.data) {
            console.error('Error data:', error.response.data);
          }
        } else {
          console.error('Error:', error instanceof Error ? error.message : String(error));
        }
      }
    }
  }
}

// Custom console.log for better object display
const originalLog = console.log;
console.log = function(message?: any, ...optionalParams: any[]): void {
  if (typeof message === 'object' && message !== null) {
    process.stdout.write(util.inspect(message, { depth: 4, colors: true }) + '\n');
  } else {
    process.stdout.write(String(message) + '\n');
  }
  optionalParams.forEach(param => {
    if (typeof param === 'object' && param !== null) {
      process.stdout.write(util.inspect(param, { depth: 4, colors: true }) + '\n');
    } else {
      process.stdout.write(String(param) + '\n');
    }
  });
};

testAuth().catch(error => {
  console.error('Unhandled error:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
