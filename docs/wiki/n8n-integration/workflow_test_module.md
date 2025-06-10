# Workflow Test Module (`src/workflow-test.ts`)

This document provides detailed documentation for the `workflow-test` module, a utility script designed for directly testing the creation of a simple n8n workflow via the n8n API. It focuses on ensuring that a basic workflow with a 'Start' node can be successfully created.

## Overview

The `workflow-test.ts` script aims to validate the fundamental workflow creation functionality of the n8n API. It constructs a predefined workflow definition and attempts to send it to the n8n instance, providing detailed feedback on the API response.

## `testWorkflowCreation()` Function

```typescript
async function testWorkflowCreation(): Promise<void> {
  // ... config loading ...
  // ... test workflow definition ...
  try { /* ... */ } catch (error) { /* ... */ }
}

testWorkflowCreation().catch(error => { /* ... */ });
```

The `testWorkflowCreation` asynchronous function is the main entry point of the script. It performs the following key steps:

1.  **Configuration Loading**: It loads the `apiKey` and `baseUrl` from an `n8n-config.json` file in the current working directory. It expects this file to exist and contain the necessary n8n configuration.
2.  **Test Workflow Definition**: Defines a `testWorkflow` object, which is a simple n8n workflow containing a 'Start' node. It explicitly sets some `settings` and `tags` as per n8n schema.
3.  **Workflow Creation Request**: Sends a `POST` request to the `${baseUrl}/api/v1/workflows` endpoint. This request includes the `X-N8N-API-KEY` header for authentication and the `testWorkflow` object as the request body.
4.  **Logging and Error Handling**: Logs the success or failure of the workflow creation. In case of an error, it provides comprehensive error details, including HTTP status codes, response data, and response headers from n8n. It also includes diagnostic information for common 400 errors related to missing workflow properties.

## Test Workflow Structure

The `testWorkflow` object created in the script looks like this:

```json
{
  "name": "aiGameMaster Test Workflow",
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
  "settings": {
    "saveManualExecutions": true,
    "callerPolicy": "workflowsFromSameOwner"
  },
  "tags": ["test", "aiGameMaster"]
}
```

This structure includes:

*   `name`: A descriptive name for the test workflow.
*   `nodes`: An array containing a basic `Start` node.
*   `connections`: An empty object, as this simple workflow does not have node connections.
*   `settings`: Includes `saveManualExecutions` and `callerPolicy` to define workflow behavior.
*   `tags`: An array for categorizing the workflow with tags like "test" and "aiGameMaster".

## Usage

To run the workflow creation test script, execute the following command from the project root:

```bash
npm run dev workflow-test
```

**Note**: Ensure your `n8n-config.json` file contains a valid `apiKey` and `baseUrl` for your n8n instance. This script is intended to directly use the configuration from that file. 