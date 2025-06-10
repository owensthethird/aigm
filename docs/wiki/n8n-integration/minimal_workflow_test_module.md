# Minimal Workflow Test Module (`src/minimal-workflow-test.ts`)

This document provides detailed documentation for the `minimal-workflow-test` module, a utility script designed for testing the creation of n8n workflows with only the absolutely essential properties. It serves as a focused test to ensure that the basic workflow creation API is functioning correctly.

## Overview

The `minimal-workflow-test.ts` script aims to verify the most fundamental workflow creation capability by sending a minimal workflow definition to the n8n API. This helps in quickly diagnosing issues related to core workflow creation without involving complex node structures or settings.

## `createMinimalWorkflow()` Function

```typescript
async function createMinimalWorkflow(): Promise<void> {
  // ... config loading ...
  // ... minimal workflow definition ...
  try { /* ... */ } catch (error) { /* ... */ }
}

createMinimalWorkflow().catch(error => { /* ... */ });
```

The `createMinimalWorkflow` asynchronous function is the main entry point of the script. It performs the following key steps:

1.  **Configuration Loading**: It loads the `apiKey` and `baseUrl` from an `n8n-config.json` file in the current working directory. It expects this file to exist and contain the necessary n8n configuration.
2.  **Minimal Workflow Definition**: Defines a `minimalWorkflow` object. This object contains only the `name`, `nodes` (with a single 'Start' node), and `connections` (empty) properties, which are the bare minimum required for a valid n8n workflow.
3.  **Workflow Creation Request**: Sends a `POST` request to the `${baseUrl}/api/v1/workflows` endpoint, including the `X-N8N-API-KEY` header for authentication and the `minimalWorkflow` object as the request body.
4.  **Logging and Error Handling**: Logs the success or failure of the workflow creation. In case of an error, it provides detailed error information, including HTTP status codes and response data from n8n.

## Minimal Workflow Structure

The `minimalWorkflow` object created in the script looks like this:

```json
{
  "name": "aiGameMaster",
  "nodes": [
    {
      "id": "Start",
      "name": "Start",
      "type": "n8n-nodes-base.start",
      "position": [100, 300],
      "parameters": {}
    }
  ],
  "connections": {},
  "settings": {}
}
```

This structure includes:

*   `name`: A predefined name for the test workflow (e.g., "aiGameMaster").
*   `nodes`: An array containing at least a `Start` node, which is fundamental for any n8n workflow.
*   `connections`: An empty object, as this minimal workflow does not have complex connections.
*   `settings`: An empty object, as the API might be strict about allowed properties.

## Usage

To run the minimal workflow creation test script, execute the following command from the project root:

```bash
npm run dev minimal-workflow-test
```

**Note**: Ensure your `n8n-config.json` file contains a valid `apiKey` and `baseUrl` for your n8n instance. This script is intended to directly use the configuration from that file. 