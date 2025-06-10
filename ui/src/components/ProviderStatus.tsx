import React from 'react';
import StatusIndicator from './StatusIndicator';

export interface ProviderInfo {
  id: string;
  name: string;
  status: 'healthy' | 'unhealthy' | 'connecting' | 'disconnected';
  isActive: boolean;
  type: 'ollama' | 'lmstudio' | 'openai' | 'unknown';
}

interface ProviderStatusProps {
  providers: ProviderInfo[];
  onProviderSelect?: (providerId: string) => void;
}

/**
 * Component to display the status of AI providers and allow selection
 * Shows connection state using the color system from our design
 */
const ProviderStatus: React.FC<ProviderStatusProps> = ({ 
  providers = [],
  onProviderSelect
}) => {
  // Get active provider (if any)
  const activeProvider = providers.find(p => p.isActive);
  
  // Map provider status to status indicator type
  const getStatusType = (status: ProviderInfo['status']) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'connecting': return 'processing';
      case 'unhealthy': return 'error';
      default: return 'idle';
    }
  };

  // Get provider icon based on type
  const getProviderIcon = (type: ProviderInfo['type']) => {
    switch (type) {
      case 'ollama': return '🦙'; // Llama icon for Ollama
      case 'lmstudio': return '🧪'; // Lab flask for LM Studio
      case 'openai': return '✨'; // Sparkles for OpenAI
      default: return '🤖'; // Robot for unknown
    }
  };

  return (
    <div className="provider-status-container">
      <div className="provider-status-header">
        <h4>AI Providers</h4>
        {activeProvider && (
          <div className="active-provider">
            <span className="provider-label">Active:</span>
            <span className="provider-name">
              {getProviderIcon(activeProvider.type)}
              {activeProvider.name}
            </span>
            <StatusIndicator type={getStatusType(activeProvider.status)} size="small" />
          </div>
        )}
      </div>
      
      <div className="provider-list">
        {providers.length === 0 ? (
          <div className="no-providers">No AI providers configured</div>
        ) : (
          providers.map(provider => (
            <div 
              key={provider.id}
              className={`provider-item ${provider.isActive ? 'active' : ''}`}
              onClick={() => onProviderSelect && onProviderSelect(provider.id)}
            >
              <div className="provider-icon">{getProviderIcon(provider.type)}</div>
              <div className="provider-details">
                <div className="provider-name">{provider.name}</div>
                <div className="provider-type">{provider.type}</div>
              </div>
              <StatusIndicator type={getStatusType(provider.status)} size="small" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProviderStatus;
