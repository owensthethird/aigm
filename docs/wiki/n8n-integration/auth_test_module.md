# Auth Test Module (`src/auth-test.ts`)

This document provides detailed documentation for the `auth-test` module, a utility script designed to test various n8n API authentication methods. It reads the API key and base URL from `n8n-config.json` (if available) and then attempts to access different n8n endpoints using various authentication approaches.

## Overview

The `auth-test.ts` script helps verify that the n8n agent can successfully authenticate with the n8n instance using different methods, particularly focusing on the `X-N8N-API-KEY` header, Bearer tokens, and API keys as query parameters.

## `testAuth()` Function

```typescript
async function testAuth(): Promise<void> {
  // ... config loading ...
  // ... authentication methods and endpoints definition ...
  for (const method of methods) { /* ... */ }
}

testAuth().catch(error => { /* ... */ });
```

The `testAuth` asynchronous function is the main entry point of the script. It performs the following key steps:

1.  **Configuration Loading**: It attempts to load the `apiKey` and `baseUrl` from an `n8n-config.json` file in the current working directory. If `n8n-config.json` is not found or fails to load an API key, the script will exit.
2.  **Authentication Method Definition**: Defines a set of `AuthMethod` objects, each representing a different way to include the API key in an HTTP request (e.g., as a custom header, Bearer token, or query parameter).
3.  **Endpoint Definition**: Specifies a list of n8n API endpoints to test (e.g., `/healthz`, `/api/v1/workflows`, `/api/v1/users`).
4.  **Iterative Testing**: It iterates through each defined authentication method and then through each endpoint, attempting to make a `GET` request.
5.  **Logging**: Provides detailed console output, indicating whether each test succeeded or failed, along with status codes and error messages for failures.

### Authentication Methods Tested

The script explicitly tests the following ways of sending the API key:

*   **`X-N8N-API-KEY` header**: This is the recommended and most commonly used method for n8n API key authentication.
*   **Bearer token in Authorization header**: Tests if the API key can be used as a Bearer token.
*   **API key as query parameter**: Tests if the API key can be passed as a query parameter.
*   **No authentication**: A baseline test to see the response when no authentication is provided.

### Endpoints Tested

The script attempts to access the following n8n endpoints:

*   `/healthz`: The n8n health check endpoint.
*   `/api/v1/workflows`: The endpoint for listing n8n workflows.
*   `/api/v1/users`: The endpoint for listing n8n users.

## Custom Console Logging

```typescript
const originalLog = console.log;
console.log = function(message?: any, ...optionalParams: any[]): void { /* ... */ };
```

The script overrides the default `console.log` behavior to provide a more readable output for objects, using `util.inspect` for deep inspection and colored output. This enhances the debugging experience when running the test.

## Usage

To run the authentication test script, execute the following command from the project root:

```bash
npm run dev auth-test
```

**Note**: Ensure your `n8n-config.json` file contains a valid `apiKey` and `baseUrl` for your n8n instance, or set the `N8N_API_KEY` and `N8N_BASE_URL` environment variables. 