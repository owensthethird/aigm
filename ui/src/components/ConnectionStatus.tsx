import React from 'react';
import { useApi } from '../contexts/ApiContext';
import StatusIndicator from './StatusIndicator';

/**
 * ConnectionStatus component for displaying API connection status
 * Used in the Header component to show connection status to the API
 */
const ConnectionStatus: React.FC = () => {
  const { isConnected, baseUrl } = useApi();
  
  return (
    <div className="connection-status">
      <StatusIndicator 
        type={isConnected ? 'success' : 'error'} 
        pulse={!isConnected} 
      />
      <span className="connection-label">
        {isConnected ? 'Connected' : 'Disconnected'}
      </span>
      <span className="connection-url" title={baseUrl}>
        {baseUrl.replace(/^https?:\/\//, '')}
      </span>
    </div>
  );
};

export default ConnectionStatus;
