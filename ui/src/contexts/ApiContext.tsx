import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import axios, { AxiosInstance } from 'axios';

interface ApiContextType {
  apiClient: AxiosInstance;
  isConnected: boolean;
  apiKey: string;
  setApiKey: (key: string) => void;
  baseUrl: string;
  setBaseUrl: (url: string) => void;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

interface ApiProviderProps {
  children: ReactNode;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const [apiKey, setApiKey] = useState<string>(() => {
    // Try to get from localStorage first
    const savedKey = localStorage.getItem('aigm-api-key');
    return savedKey || '';
  });
  
  const [baseUrl, setBaseUrl] = useState<string>(() => {
    // Try to get from localStorage first
    const savedUrl = localStorage.getItem('aigm-base-url');
    return savedUrl || 'http://localhost:5678';
  });
  
  const [isConnected, setIsConnected] = useState<boolean>(false);
  
  // Create API client with axios
  const apiClient = axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': apiKey,
    },
  });
  
  // Save API key to localStorage when it changes
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('aigm-api-key', apiKey);
    }
  }, [apiKey]);
  
  // Save base URL to localStorage when it changes
  useEffect(() => {
    if (baseUrl) {
      localStorage.setItem('aigm-base-url', baseUrl);
    }
  }, [baseUrl]);
  
  // Check connection status when apiKey or baseUrl changes
  useEffect(() => {
    const checkConnection = async () => {
      if (!apiKey || !baseUrl) {
        setIsConnected(false);
        return;
      }
      
      try {
        const response = await apiClient.get('/api/v1/workflows');
        setIsConnected(response.status === 200);
      } catch (error) {
        console.error('API connection error:', error);
        setIsConnected(false);
      }
    };
    
    checkConnection();
  }, [apiKey, baseUrl, apiClient]);

  return (
    <ApiContext.Provider value={{
      apiClient,
      isConnected,
      apiKey,
      setApiKey,
      baseUrl,
      setBaseUrl
    }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};
