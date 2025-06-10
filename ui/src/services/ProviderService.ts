import axios from 'axios';
import { ProviderInfo } from '../components/ProviderStatus';

/**
 * Service for managing AI provider connections and statuses
 */
class ProviderService {
  private static instance: ProviderService;
  private baseUrl: string = 'http://localhost:3000/api';

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ProviderService {
    if (!ProviderService.instance) {
      ProviderService.instance = new ProviderService();
    }
    return ProviderService.instance;
  }

  /**
   * Set the base URL for API requests
   */
  public setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  /**
   * Get list of available providers
   */
  public async getProviders(): Promise<ProviderInfo[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/providers`);
      return response.data;
    } catch (error) {
      console.error('Error fetching providers:', error);
      // Return empty array if API fails
      return [];
    }
  }

  /**
   * Get detailed status for a specific provider
   * @param providerId Provider ID to check
   */
  public async getProviderStatus(providerId: string): Promise<ProviderInfo> {
    try {
      const response = await axios.get(`${this.baseUrl}/providers/${providerId}/status`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching status for provider ${providerId}:`, error);
      throw error;
    }
  }

  /**
   * Set active provider for AI responses
   * @param providerId Provider ID to activate
   */
  public async setActiveProvider(providerId: string): Promise<boolean> {
    try {
      const response = await axios.post(`${this.baseUrl}/providers/active`, { providerId });
      return response.status === 200;
    } catch (error) {
      console.error('Error setting active provider:', error);
      throw error;
    }
  }

  /**
   * Test connection to a provider
   * @param providerId Provider ID to test
   */
  public async testProvider(providerId: string): Promise<{success: boolean; message: string}> {
    try {
      const response = await axios.post(`${this.baseUrl}/providers/${providerId}/test`);
      return response.data;
    } catch (error) {
      console.error(`Error testing provider ${providerId}:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export default ProviderService;
