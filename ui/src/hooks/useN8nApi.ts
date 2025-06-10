import { useState, useEffect, useCallback } from 'react';
import { useApi } from '../contexts/ApiContext';
import { N8nWorkflow, N8nExecution } from '../types/api.types';

/**
 * Custom hook for interacting with the n8n API
 */
export const useN8nApi = () => {
  const { apiClient, isConnected, baseUrl } = useApi();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all workflows
   */
  const getWorkflows = useCallback(async () => {
    if (!isConnected) {
      setError('Not connected to n8n API');
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/api/v1/workflows');
      setIsLoading(false);
      return response.data.data as N8nWorkflow[];
    } catch (err: any) {
      setError(err.message || 'Failed to fetch workflows');
      setIsLoading(false);
      return null;
    }
  }, [apiClient, isConnected]);

  /**
   * Fetch a specific workflow by ID
   */
  const getWorkflowById = useCallback(async (id: string) => {
    if (!isConnected) {
      setError('Not connected to n8n API');
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/api/v1/workflows/${id}`);
      setIsLoading(false);
      return response.data as N8nWorkflow;
    } catch (err: any) {
      setError(err.message || `Failed to fetch workflow ${id}`);
      setIsLoading(false);
      return null;
    }
  }, [apiClient, isConnected]);

  /**
   * Create a new workflow
   */
  const createWorkflow = useCallback(async (workflow: Partial<N8nWorkflow>) => {
    if (!isConnected) {
      setError('Not connected to n8n API');
      return null;
    }

    // Ensure workflow has empty settings object per n8n API requirements
    const workflowData = { ...workflow };
    if (!workflowData.settings) {
      workflowData.settings = {};
    }
    
    // Remove active property if present (it's read-only)
    if (workflowData.active !== undefined) {
      delete workflowData.active;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/api/v1/workflows', workflowData);
      setIsLoading(false);
      return response.data as N8nWorkflow;
    } catch (err: any) {
      setError(err.message || 'Failed to create workflow');
      setIsLoading(false);
      return null;
    }
  }, [apiClient, isConnected]);

  /**
   * Execute a workflow
   */
  const executeWorkflow = useCallback(async (workflowId: string, data?: any) => {
    if (!isConnected) {
      setError('Not connected to n8n API');
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post(`/api/v1/workflows/${workflowId}/execute`, data || {});
      setIsLoading(false);
      return response.data as N8nExecution;
    } catch (err: any) {
      setError(err.message || `Failed to execute workflow ${workflowId}`);
      setIsLoading(false);
      return null;
    }
  }, [apiClient, isConnected]);

  /**
   * Get execution data
   */
  const getExecution = useCallback(async (executionId: string) => {
    if (!isConnected) {
      setError('Not connected to n8n API');
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/api/v1/executions/${executionId}`);
      setIsLoading(false);
      return response.data as N8nExecution;
    } catch (err: any) {
      setError(err.message || `Failed to get execution ${executionId}`);
      setIsLoading(false);
      return null;
    }
  }, [apiClient, isConnected]);

  /**
   * Activate a workflow
   */
  const activateWorkflow = useCallback(async (workflowId: string) => {
    if (!isConnected) {
      setError('Not connected to n8n API');
      return false;
    }

    setIsLoading(true);
    setError(null);
    try {
      await apiClient.post(`/api/v1/workflows/${workflowId}/activate`);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || `Failed to activate workflow ${workflowId}`);
      setIsLoading(false);
      return false;
    }
  }, [apiClient, isConnected]);

  /**
   * Deactivate a workflow
   */
  const deactivateWorkflow = useCallback(async (workflowId: string) => {
    if (!isConnected) {
      setError('Not connected to n8n API');
      return false;
    }

    setIsLoading(true);
    setError(null);
    try {
      await apiClient.post(`/api/v1/workflows/${workflowId}/deactivate`);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || `Failed to deactivate workflow ${workflowId}`);
      setIsLoading(false);
      return false;
    }
  }, [apiClient, isConnected]);

  return {
    baseUrl,
    isConnected,
    isLoading,
    error,
    getWorkflows,
    getWorkflowById,
    createWorkflow,
    executeWorkflow,
    getExecution,
    activateWorkflow,
    deactivateWorkflow,
  };
};
