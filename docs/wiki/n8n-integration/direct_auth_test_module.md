# Direct Auth Test Module (`src/direct-auth-test.ts`)

This document provides detailed documentation for the `direct-auth-test` module, a simplified utility script specifically designed to test n8n API authentication using only the `X-N8N-API-KEY` header. It serves as a focused test for this primary authentication method.

## Overview

The `direct-auth-test.ts` script is a stripped-down version of `auth-test.ts`, concentrating solely on verifying API key authentication via the `X-N8N-API-KEY` header. It's useful for quickly confirming basic connectivity and authentication without the complexity of testing multiple authentication methods.

## `testDirectAuth()` Function

```typescript
async function testDirectAuth(): Promise<void> {
  // ... config loading ...
  // ... endpoints definition ...
  for (const endpoint of endpoints) { /* ... */ }
}

testDirectAuth().catch(error => { /* ... */ });
```

The `testDirectAuth` asynchronous function is the main entry point of the script. It performs the following key steps:

1.  **Configuration Loading**: It attempts to load the `apiKey` and `baseUrl` directly from an `n8n-config.json` file in the current working directory. If the file or the API key is not found, the script will log an error and exit.
2.  **Endpoint Definition**: Specifies a list of n8n API endpoints to test (e.g., `/healthz`, `/api/v1/workflows`, `/api/v1/users`).
3.  **Iterative Testing**: It iterates through each defined endpoint, attempting to make a `GET` request using the `X-N8N-API-KEY` header for authentication.
4.  **Logging**: Provides detailed console output, including request headers (with a masked API key for security), response status codes, and data types, indicating success or failure for each endpoint test.

### Endpoints Tested

The script attempts to access the following n8n endpoints using `X-N8N-API-KEY`:

*   `/healthz`: The n8n health check endpoint.
*   `/api/v1/workflows`: The endpoint for listing n8n workflows.
*   `/api/v1/users`: The endpoint for listing n8n users.

## Custom Console Logging

```typescript
const originalLog = console.log;
console.log = function(message?: any, ...optionalParams: any[]): void { /* ... */ };
```

Similar to `auth-test.ts`, this script overrides the default `console.log` behavior to provide a more readable output for objects, utilizing `util.inspect` for deep inspection and colored output.

## Usage

To run the direct authentication test script, execute the following command from the project root:

```bash
npm run dev direct-auth-test
```

**Note**: Ensure your `n8n-config.json` file contains a valid `apiKey` and `baseUrl` for your n8n instance. This script is intended to directly use the configuration from that file. 