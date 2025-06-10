// src/n8n-client.ts
import axios, { AxiosInstance } from 'axios';

export interface N8nConfig {
  baseUrl: string;
  apiKey?: string;
  username?: string;
  password?: string;
}

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any;
  settings?: any;
  createdAt: string;
  updatedAt: string;
}

export interface N8nExecution {
  id: string;
  workflowId: string;
  mode: string;
  retryOf?: string;
  status: 'success' | 'error' | 'canceled' | 'running' | 'waiting';
  startedAt: string;
  stoppedAt?: string;
  data?: any;
}

export class N8nClient {
  private client: AxiosInstance;

  constructor(config: N8nConfig) {
    console.log(`Connecting to n8n API at ${config.baseUrl}`);
    this.client = axios.create({
      baseURL: `${config.baseUrl}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Set up lightweight request logging
    this.client.interceptors.request.use(request => {
      const endpoint = request.url || '';
      const method = request.method?.toUpperCase() || 'GET';
      console.log(`🔄 ${method} ${endpoint}`);
      return request;
    });
    
    // Set up concise response/error logging
    this.client.interceptors.response.use(
      response => {
        console.log(`✅ Status: ${response.status}`);
        return response;
      },
      error => {
        if (axios.isAxiosError(error) && error.response) {
          console.error(`❌ Error: ${error.response.status} - ${error.response.data?.message || error.message}`);
        } else if (error instanceof Error) {
          console.error(`❌ Error: ${error.message}`);
        } else {
          console.error('❌ Unknown error occurred');
        }
        return Promise.reject(error);
      }
    );
    
    // Always use X-N8N-API-KEY header - this is the preferred and working auth method
    if (config.apiKey) {
      console.log('🔑 Using API key authentication');
      this.client.defaults.headers.common['X-N8N-API-KEY'] = config.apiKey.trim();
    } else {
      console.error('⚠️ No API key provided - authentication will fail!');
    }
  }

  // Workflow Management
  async getWorkflows(): Promise<N8nWorkflow[]> {
    const response = await this.client.get('/workflows');
    return response.data.data;
  }

  async getWorkflow(id: string): Promise<N8nWorkflow> {
    const response = await this.client.get(`/workflows/${id}`);
    return response.data;
  }

  async createWorkflow(workflow: Partial<N8nWorkflow>): Promise<N8nWorkflow> {
    const response = await this.client.post('/workflows', workflow);
    return response.data;
  }

  async updateWorkflow(id: string, workflow: Partial<N8nWorkflow>): Promise<N8nWorkflow> {
    const response = await this.client.patch(`/workflows/${id}`, workflow);
    return response.data;
  }

  async deleteWorkflow(id: string): Promise<void> {
    await this.client.delete(`/workflows/${id}`);
  }

  async activateWorkflow(id: string): Promise<void> {
    await this.client.post(`/workflows/${id}/activate`);
  }

  async deactivateWorkflow(id: string): Promise<void> {
    await this.client.post(`/workflows/${id}/deactivate`);
  }

  // Execution Management
  async getExecutions(workflowId?: string, limit: number = 100): Promise<N8nExecution[]> {
    const params: any = { limit };
    if (workflowId) params.workflowId = workflowId;
    
    const response = await this.client.get('/executions', { params });
    return response.data.data;
  }

  async getExecution(id: string, includeData: boolean = false): Promise<N8nExecution> {
    const params = includeData ? { includeData: 'true' } : {};
    const response = await this.client.get(`/executions/${id}`, { params });
    return response.data;
  }

  async deleteExecution(id: string): Promise<void> {
    await this.client.delete(`/executions/${id}`);
  }

  async retryExecution(id: string): Promise<N8nExecution> {
    const response = await this.client.post(`/executions/${id}/retry`);
    return response.data;
  }

  // Webhook Management
  async executeWebhook(webhookPath: string, data: any, method: string = 'POST'): Promise<any> {
    const response = await this.client.request({
      method,
      url: `/webhook/${webhookPath}`,
      data,
    });
    return response.data;
  }

  // Health Check
  async getHealth(): Promise<{ status: string }> {
    try {
      const healthEndpoint = `${this.client.defaults.baseURL?.replace('/api/v1', '')}/healthz`;
      console.log(`Checking health endpoint: ${healthEndpoint}`);
      const response = await axios.get(healthEndpoint);
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
}