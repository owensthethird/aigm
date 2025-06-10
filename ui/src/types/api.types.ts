/**
 * Type definitions for n8n API interactions
 */

export interface N8nWorkflow {
  id?: string;
  name: string;
  active?: boolean;
  nodes: N8nNode[];
  connections: N8nConnections;
  settings?: Record<string, any>;
  tags?: string[];
  pinData?: Record<string, any>;
  staticData?: Record<string, any>;
  versionId?: string;
}

export interface N8nNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters?: Record<string, any>;
  credentials?: Record<string, any>;
  disabled?: boolean;
  notes?: string;
  continueOnFail?: boolean;
  alwaysOutputData?: boolean;
}

export interface N8nConnections {
  [key: string]: {
    [key: string]: [
      {
        node: string;
        type: string;
        index: number;
      }
    ];
  };
}

export interface N8nExecution {
  id: string;
  finished?: boolean;
  mode: string;
  retryOf?: string;
  retrySuccessId?: string;
  startedAt: string;
  stoppedAt?: string;
  workflowData: N8nWorkflow;
  workflowId: string;
  data?: Record<string, any>;
  status?: 'running' | 'success' | 'error' | 'crashed' | 'canceled' | 'waiting';
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  timestamp?: number;
}
