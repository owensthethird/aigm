import React from 'react';

// Define StatusType to match what's used in GameStateContext
export type StatusType = 'active' | 'processing' | 'success' | 'warning' | 'error' | 'idle' | 'paused';

export interface StatusIndicatorProps {
  type?: StatusType;
  label?: string;
  pulse?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Visual indicator for system status with color gradients and animations based on state
 */
function StatusIndicator(props: StatusIndicatorProps) {
  const {
    type,
    label,
    pulse = false,
    size = 'medium',
    className = ''
  } = props;
  
  // Use status from props
  const statusType = type || 'idle';
  
  // Default label based on type if not provided
  const statusLabel = label || (
    statusType === 'active' ? 'Active' :
    statusType === 'processing' ? 'Processing' :
    statusType === 'success' ? 'Success' :
    statusType === 'warning' ? 'Warning' :
    statusType === 'error' ? 'Error' :
    statusType === 'paused' ? 'Paused' :
    'Idle'
  );
  
  return (
    <div className={`status-indicator-container ${className} size-${size}`}>
      <div 
        className={`status-indicator gradient-${statusType} ${pulse ? 'pulse' : ''}`}
        aria-hidden="true"
      ></div>
      {label !== undefined && (
        <span className="status-label">{statusLabel}</span>
      )}
    </div>
  );
}

export default StatusIndicator;
