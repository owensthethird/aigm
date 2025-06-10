import axios, { AxiosInstance } from 'axios';

/**
 * Service for interacting with the n8n API
 */
export class N8nService {
  private apiClient: AxiosInstance;
  
  constructor(baseUrl: string, apiKey: string) {
    this.apiClient = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': apiKey
      }
    });
  }

  /**
   * Get all workflows
   */
  async getWorkflows() {
    try {
      const response = await this.apiClient.get('/api/v1/workflows');
      return response.data;
    } catch (error) {
      console.error('Error getting workflows:', error);
      throw error;
    }
  }

  /**
   * Get a specific workflow by ID
   */
  async getWorkflowById(id: string) {
    try {
      const response = await this.apiClient.get(`/api/v1/workflows/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting workflow ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(workflow: any) {
    try {
      // Ensure workflow has empty settings object per n8n API requirements
      if (!workflow.settings) {
        workflow.settings = {};
      }
      
      // Remove active property if present (it's read-only)
      if (workflow.active !== undefined) {
        delete workflow.active;
      }
      
      const response = await this.apiClient.post('/api/v1/workflows', workflow);
      return response.data;
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  }

  /**
   * Update an existing workflow
   */
  async updateWorkflow(id: string, workflow: any) {
    try {
      // Remove active property if present (it's read-only)
      if (workflow.active !== undefined) {
        delete workflow.active;
      }
      
      const response = await this.apiClient.put(`/api/v1/workflows/${id}`, workflow);
      return response.data;
    } catch (error) {
      console.error(`Error updating workflow ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a workflow
   */
  async deleteWorkflow(id: string) {
    try {
      const response = await this.apiClient.delete(`/api/v1/workflows/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting workflow ${id}:`, error);
      throw error;
    }
  }

  /**
   * Activate a workflow
   */
  async activateWorkflow(id: string) {
    try {
      const response = await this.apiClient.post(`/api/v1/workflows/${id}/activate`);
      return response.data;
    } catch (error) {
      console.error(`Error activating workflow ${id}:`, error);
      throw error;
    }
  }

  /**
   * Deactivate a workflow
   */
  async deactivateWorkflow(id: string) {
    try {
      const response = await this.apiClient.post(`/api/v1/workflows/${id}/deactivate`);
      return response.data;
    } catch (error) {
      console.error(`Error deactivating workflow ${id}:`, error);
      throw error;
    }
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(id: string, data?: any) {
    try {
      const response = await this.apiClient.post(`/api/v1/workflows/${id}/execute`, data || {});
      return response.data;
    } catch (error) {
      console.error(`Error executing workflow ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get execution data
   */
  async getExecution(id: string) {
    try {
      const response = await this.apiClient.get(`/api/v1/executions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting execution ${id}:`, error);
      throw error;
    }
  }

  /**
   * Check API connectivity
   */
  async checkConnectivity() {
    try {
      const response = await this.apiClient.get('/api/v1/workflows', { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      console.error('Connectivity check failed:', error);
      return false;
    }
  }
}

/**
 * Create a hook instance of the n8n service
 */
export const useN8nService = (baseUrl: string, apiKey: string) => {
  return new N8nService(baseUrl, apiKey);
};
