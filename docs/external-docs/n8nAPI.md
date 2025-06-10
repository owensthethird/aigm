# n8n API Documentation
The following is documentation for the n8n Public API, version 1.1.1.
E-mail: hello@n8n.io
License: Sustainable Use License Terms of Service
Download OpenAPI specification
---
### User Operations
Operations related to managing users in your n8n instance. All user operations, except for `Create multiple users`, are only available for the instance owner.
#### Retrieve all users
Retrieves all users from your instance.
`GET /users`
**Authorizations:** `ApiKeyAuth`
**Query Parameters:**
- `limit` (number, optional): The maximum number of items to return. Default: `100`. Max: `250`. Example: `limit=100`
- `cursor` (string, optional): Used for pagination. Set to the `nextCursor` attribute from a previous response to fetch the next page.
- `includeRole` (boolean, optional): Whether to include the user's role in the response. Default: `false`. Example: `includeRole=true`
- `projectId` (string, optional): Filters users by the project ID. Example: `projectId=VmwOO9HeTEj20kxM`
**Responses:**
- **200 OK:**
    
    JSON
    
    ```
    {
      "data": [
        {}
      ],
      "nextCursor": "MTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDA"
    }
    ```
    
#### Create multiple users
Creates one or more users in your instance.
`POST /users`
**Authorizations:** `ApiKeyAuth`
**Request Body (`application/json`):**
An array of user objects to be created.
JSON
```
[
  {
    "email": "user@example.com",
    "role": "global:admin"
  }
]
```
**Schema:**
- Array of objects:
    - `email` (string, required): The user's email address.
    - `role` (string, optional): The user's global role. Enum: `"global:admin"`, `"global:member"`
**Responses:**
- **200 OK:**
    
    JSON
    
    ```
    {
      "user": {
        "id": "string",
        "email": "string",
        "inviteAcceptUrl": "string",
        "emailSent": true
      },
      "error": "string"
    }
    ```
    
#### Get user by ID/Email
Retrieves a single user from your instance by ID or email.
`GET /users/{id}`
**Authorizations:** `ApiKeyAuth`
**Path Parameters:**
- `id` (string, required): The ID or email of the user to retrieve.
**Query Parameters:**
- `includeRole` (boolean, optional): Whether to include the user's role in the response. Default: `false`. Example: `includeRole=true`
**Responses:**
- **200 OK:**
    
    JSON
    
    ```
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "john.doe@company.com",
      "firstName": "john",
      "lastName": "Doe",
      "isPending": true,
      "createdAt": "2019-08-24T14:15:22Z",
      "updatedAt": "2019-08-24T14:15:22Z",
      "role": "owner"
    }
    ```
    
#### Delete a user
Deletes a user from your instance.
`DELETE /users/{id}`
**Authorizations:** `ApiKeyAuth`
**Path Parameters:**
- `id` (string, required): The ID or email of the user to delete.
**Responses:**
- **200 OK:** (No specific sample provided, typically a success confirmation or the deleted object)
#### Change a user's global role
Changes a user's global role in your instance.
`POST /users/{id}/change-global-role`
**Authorizations:** `ApiKeyAuth`
**Path Parameters:**
- `id` (string, required): The ID or email of the user whose role is to be changed.
**Request Body (`application/json`):**
JSON
```
{
  "newRoleName": "global:admin"
}
```
**Schema:**
- `newRoleName` (string, required): The new global role for the user. Enum: `"global:admin"`, `"global:member"`
**Responses:**
- **200 OK:** (No specific sample provided, typically a success confirmation or the updated user object)
---
### Audit Operations
Operations related to generating security audits for your n8n instance.
#### Generate an audit
Generates a security audit for your n8n instance.
`POST /audit`
**Authorizations:** `ApiKeyAuth`
**Request Body (`application/json`, optional):**
JSON
```
{
  "additionalOptions": {
    "daysAbandonedWorkflow": 0,
    "categories": []
  }
}
```
**Schema:**
- `additionalOptions` (object, optional):
    - `daysAbandonedWorkflow` (number, optional):
    - `categories` (array, optional):
**Responses:**
- **200 OK:**
    
    JSON
    
    ```
    {
      "Credentials Risk Report": {
        "risk": "credentials",
        "sections": []
      },
      "Database Risk Report": {
        "risk": "database",
        "sections": []
      },
      "Filesystem Risk Report": {
        "risk": "filesystem",
        "sections": []
      },
      "Nodes Risk Report": {
        "risk": "nodes",
        "sections": []
      },
      "Instance Risk Report": {
        "risk": "execution",
        "sections": []
      }
    }
    ```
    
---
### Execution Operations
Operations related to managing workflow executions in your n8n instance.
#### Retrieve all executions
Retrieves all workflow executions from your instance.
`GET /executions`
**Authorizations:** `ApiKeyAuth`
**Query Parameters:**
- `includeData` (boolean, optional): Whether to include the execution's detailed data.
- `status` (string, optional): Filters executions by status. Enum: `"error"`, `"success"`, `"waiting"`
- `workflowId` (string, optional): Filters executions by workflow ID. Example: `workflowId=1000`
- `projectId` (string, optional): Filters executions by project ID. Example: `projectId=VmwOO9HeTEj20kxM`
- `limit` (number, optional): The maximum number of items to return. Default: `100`. Max: `250`. Example: `limit=100`
- `cursor` (string, optional): Used for pagination. Set to the `nextCursor` attribute from a previous response to fetch the next page.
**Responses:**
- **200 OK:**
    
    JSON
    
    ```
    {
      "data": [
        {}
      ],
      "nextCursor": "MTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDA"
    }
    ```
    
#### Retrieve an execution
Retrieves a single workflow execution from your instance.
`GET /executions/{id}`
**Authorizations:** `ApiKeyAuth`
**Path Parameters:**
- `id` (number, required): The ID of the execution to retrieve.
**Query Parameters:**
- `includeData` (boolean, optional): Whether to include the execution's detailed data.
**Responses:**
- **200 OK:**
    
    JSON
    
    ```
    {
      "id": 1000,
      "data": {},
      "finished": true,
      "mode": "cli",
      "retryOf": 0,
      "retrySuccessId": "2",
      "startedAt": "2019-08-24T14:15:22Z",
      "stoppedAt": "2019-08-24T14:15:22Z",
      "workflowId": "1000",
      "waitTill": "2019-08-24T14:15:22Z",
      "customData": {}
    }
    ```
    
#### Delete an execution
Deletes a workflow execution from your instance.
`DELETE /executions/{id}`
**Authorizations:** `ApiKeyAuth`
**Path Parameters:**
- `id` (number, required): The ID of the execution to delete.
**Responses:**
- **200 OK:**
    
    JSON
    
    ```
    {
      "id": 1000,
      "data": {},
      "finished": true,
      "mode": "cli",
      "retryOf": 0,
      "retrySuccessId": "2",
      "startedAt": "2019-08-24T14:15:22Z",
      "stoppedAt": "2019-08-24T14:15:22Z",
      "workflowId": "1000",
      "waitTill": "2019-08-24T14:15:22Z",
      "customData": {}
    }
    ```
    
---
### Workflow Operations
Operations related to managing workflows in your n8n instance.
#### Create a workflow
Creates a new workflow in your instance.
`POST /workflows`
**Authorizations:** `ApiKeyAuth`
**Request Body (`application/json`):**
JSON
```
{
  "name": "Workflow 1",
  "nodes": [
    {}
  ],
  "connections": {
    "main": []
  },
  "settings": {
    "saveExecutionProgress": true,
    "saveManualExecutions": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all",
    "executionTimeout": 3600,
    "errorWorkflow": "VzqKEW0ShTXA5vPj",
    "timezone": "America/New_York",
    "executionOrder": "v1"
  },
  "staticData": {
    "lastId": 1
  }
}
```
**Schema:**
- `name` (string, required): The name of the workflow.
- `nodes` (array, required): An array of node objects.
- `connections` (object, required): Connection details for the workflow.
- `settings` (object, required): Workflow settings object.
- `staticData` (string or null or object or null): Static data associated with the workflow.
**Responses:**
- **200 OK:**
    
    JSON
    
    ```
    {
      "id": "2tUt1wbLX592XDdX",
      "name": "Workflow 1",
      "active": true,
      "createdAt": "2019-08-24T14:15:22Z",
      "updatedAt": "2019-08-24T14:15:22Z",
      "nodes": [
        {}
      ],
      "connections": {
        "main": []
      },
      "settings": {
        "saveExecutionProgress": true,
        "saveManualExecutions": true,
        "saveDataErrorExecution": "all",
        "saveDataSuccessExecution": "all",
        "executionTimeout": 3600,
        "errorWorkflow": "VzqKEW0ShTXA5vPj",
        "timezone": "America/New_York",
        "executionOrder": "v1"
      },
      "staticData": {
        "lastId": 1
      },
      "tags": [
        {}
      ]
    }
    ```
    
#### Retrieve all workflows
Retrieves all workflows from your instance.
`GET /workflows`
**Authorizations:** `ApiKeyAuth`
**Query Parameters:**
- `active` (boolean, optional): Filters workflows by their active status. Example: `active=true`
- `tags` (string, optional): Filters workflows by tags (comma-separated). Example: `tags=test,production`
- `name` (string, optional): Filters workflows by name. Example: `name=My Workflow`
- `projectId` (string, optional): Filters workflows by project ID. Example: `projectId=VmwOO9HeTEj20kxM`
- `excludePinnedData` (boolean, optional): Set to `true` to avoid retrieving pinned data. Example: `excludePinnedData=true`
- `limit` (number, optional): The maximum number of items to return. Default: `100`. Max: `250`. Example: `limit=100`
- `cursor` (string, optional): Used for pagination. Set to the `nextCursor` attribute from a previous response to fetch the next page.
**Responses:**
- **200 OK:**
    
    JSON
    
    ```
    {
      "data": [
        {}
      ],
      "nextCursor": "MTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDA"
    }
    ```
    
#### Retrieves a workflow
Retrieves a single workflow by its ID.
`GET /workflows/{id}`
**Authorizations:** `ApiKeyAuth`
**Path Parameters:**
- `id` (string, required): The ID of the workflow to retrieve.
**Query Parameters:**
- `excludePinnedData` (boolean, optional): Set to `true` to avoid retrieving pinned data. Example: `excludePinnedData=true`
**Responses:**
- **200 OK:**
    
    JSON
    
    ```
    {
      "id": "2tUt1wbLX592XDdX",
      "name": "Workflow 1",
      "active": true,
      "createdAt": "2019-08-24T14:15:22Z",
      "updatedAt": "2019-08-24T14:15:22Z",
      "nodes": [
        {}
      ],
      "connections": {
        "main": []
      },
      "settings": {
        "saveExecutionProgress": true,
        "saveManualExecutions": true,
        "saveDataErrorExecution": "all",
        "saveDataSuccessExecution": "all",
        "executionTimeout": 3600,
        "errorWorkflow": "VzqKEW0ShTXA5vPj",
        "timezone": "America/New_York",
        "executionOrder": "v1"
      },
      "staticData": {
        "lastId": 1
      },
      "tags": [
        {}
      ]
    }
    ```
    
#### Delete a workflow
Deletes a workflow from your instance.
`DELETE /workflows/{id}`
**Authorizations:** `ApiKeyAuth`
**Path Parameters:**
- `id` (string, required): The ID of the workflow to delete.
**Responses:**
- **200 OK:**
    
    JSON
    
    ```
    {
      "id": "2tUt1wbLX592XDdX",
      "name": "Workflow 1",
      "active": true,
      "createdAt": "2019-08-24T14:15:22Z",
      "updatedAt": "2019-08-24T14:15:22Z",
      "nodes": [
        {}
      ],
      "connections": {
        "main": []
      },
      "settings": {
        "saveExecutionProgress": true,
        "saveManualExecutions": true,
        "saveDataErrorExecution": "all",
        "saveDataSuccessExecution": "all",
        "executionTimeout": 3600,
        "errorWorkflow": "VzqKEW0ShTXA5vPj",
        "timezone": "America/New_York",
        "executionOrder": "v1"
      },
      "staticData": {
        "lastId": 1
      },
      "tags": [
        {}
      ]
    }
    ```
    
#### Update a workflow
Updates an existing workflow.
`PUT /workflows/{id}`
**Authorizations:** `ApiKeyAuth`
**Path Parameters:**
- `id` (string, required): The ID of the workflow to update.
**Request Body (`application/json`):**
JSON
```
{
  "name": "Workflow 1",
  "nodes": [
    {}
  ],
  "connections": {
    "main": []
  },
  "settings": {
    "saveExecutionProgress": true,
    "saveManualExecutions": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all",
    "executionTimeout": 3600,
    "errorWorkflow": "VzqKEW0ShTXA5vPj",
    "timezone": "America/New_York",
    "executionOrder": "v1"
  },
  "staticData": {
    "lastId": 1
  }
}
```
**Schema:**
- `name` (string, required): The updated name of the workflow.
- `nodes` (array, required): An array of updated node objects.
- `connections` (object, required): Updated connection details for the workflow.
- `settings` (object, required): Updated workflow settings object.
- `staticData` (string or null or object or null): Updated static data associated with the workflow.
**Responses:**
- **200 OK:**
    
    JSON
    
    ```
    {
      "id": "2tUt1wbLX592XDdX",
      "name": "Workflow 1",
      "active": true,
      "createdAt": "2019-08-24T14:15:22Z",
      "updatedAt": "2019-08-24T14:15:22Z",
      "nodes": [
        {}
      ],
      "connections": {
        "main": []
      },
      "settings": {
        "saveExecutionProgress": true,
        "saveManualExecutions": true,
        "saveDataErrorExecution": "all",
        "saveDataSuccessExecution": "all",
        "executionTimeout": 3600,
        "errorWorkflow": "VzqKEW0ShTXA5vPj",
        "timezone": "America/New_York",
        "executionOrder": "v1"
      },
      "staticData": {
        "lastId": 1
      },
      "tags": [
        {}
      ]
    }
    ```
    
#### Activate a workflow
Activates a workflow.
`POST /workflows/{id}/activate`
**Authorizations:** `ApiKeyAuth`
**Path Parameters:**
- `id` (string, required): The ID of the workflow to activate.
**Responses:**
- **200 OK:**
    
    JSON
    
    ```
    {
      "id": "2tUt1wbLX592XDdX",
      "name": "Workflow 1",
      "active": true,
      "createdAt": "2019-08-24T14:15:22Z",
      "updatedAt": "2019-08-24T14:15:22Z",
      "nodes": [
        {}
      ],
      "connections": {
        "main": []
      },
      "settings": {
        "saveExecutionProgress": true,
        "saveManualExecutions": true,
        "saveDataErrorExecution": "all",
        "saveDataSuccessExecution": "all",
        "executionTimeout": 3600,
        "errorWorkflow": "VzqKEW0ShTXA5vPj",
        "timezone": "America/New_York",
        "executionOrder": "v1"
      },
      "staticData": {
        "lastId": 1
      },
      "tags": [
        {}
      ]
    }
    ```
    
#### Deactivate a workflow
Deactivates a workflow.
`POST /workflows/{id}/deactivate`
**Authorizations:** `ApiKeyAuth`
**Path Parameters:**
- `id` (string, required): The ID of the workflow to deactivate.
**Responses:**
- **200 OK:**
    
    JSON
    
    ```
    {
      "id": "2tUt1wbLX592XDdX",
      "name": "Workflow 1",
      "active": true,
      "createdAt": "2019-08-24T14:15:22Z",
      "updatedAt": "2019-08-24T14:15:22Z",
      "nodes": [
        {}
      ],
      "connections": {
        "main": []
      },
      "settings": {
        "saveExecutionProgress": true,
        "saveManualExecutions": true,
        "saveDataErrorExecution": "all",
        "saveDataSuccessExecution": "all",
        "executionTimeout": 3600,
        "errorWorkflow": "VzqKEW0ShTXA5vPj",
        "timezone": "America/New_York",
        "executionOrder": "v1"
      },
      "staticData": {
        "lastId": 1
      },
      "tags": [
        {}
      ]
    }
    ```
    
#### Transfer a workflow to another project
Transfers a workflow to a different project.
`POST /workflows/{id}/transfer`
**Authorizations:** `ApiKeyAuth`
**Path Parameters:**
- `id` (string, required): The ID of the workflow to transfer.
**Request Body (`application/json`):**
JSON
```
{
  "destinationProjectId": "string"
}
```
**Schema:**
- `destinationProjectId` (string, required): The ID of the project to transfer the workflow to.
**Responses:**
- **200 OK:** (No specific sample provided, typically a success confirmation or the updated workflow object)
#### Get workflow tags
Retrieves the tags associated with a specific workflow.
`GET /workflows/{id}/tags`
**Authorizations:** `ApiKeyAuth`
**Path Parameters:**
- `id` (string, required): The ID of the workflow.
**Responses:**
- **200 OK:**
    
    JSON
    
    ```
    [
      {
        "id": "2tUt1wbLX592XDdX",
        "name": "Production",
        "createdAt": "2019-08-24T14:15:22Z",
        "updatedAt": "2019-08-24T14:15:22Z"
      }
    ]
    ```
    
#### Update tags of a workflow
Updates the tags associated with a workflow.
`PUT /workflows/{id}/tags`
**Authorizations:** `ApiKeyAuth`
**Path Parameters:**
- `id` (string, required): The ID of the workflow.
**Request Body (`application/json`):**
JSON
```
[
  {
    "id": "2tUt1wbLX592XDdX"
  }
]
```
**Schema:**
- Array of objects:
    - `id` (string, required): The ID of the tag.
**Responses:**
- **200 OK:**
    
    JSON
    
    ```
    [
      {
        "id": "2tUt1wbLX592XDdX",
        "name": "Production",
        "createdAt": "2019-08-24T14:15:22Z",
        "updatedAt": "2019-08-24T14:15:22Z"
      }
    ]
    ```
    
---
### Credential Operations
Operations related to managing credentials in your n8n instance.
#### Create a credential
Creates a credential that can be used by nodes of the specified type.
`POST /credentials`
**Authorizations:** `ApiKeyAuth`
**Request Body (`application/json`):**
JSON
```
{
  "name": "Joe's Github Credentials",
  "type": "github",
  "data": {
    "token": "ada612vad6fa5df4adf5a5dsf4389adsf76da7s"
  }
}
```
**Schema:**
- `name` (string, required): The name of the credential.
- `type` (string, required): The type of the credential (e.g., "github", "freshdeskApi").
- `data` (object, required): The actual credential data, which varies by type.
**Responses:**
- **200 OK:**
    
    JSON
    
    ```
    {
      "id": "vHxaz5UaCghVYl9C",
      "name": "John's Github account",
      "type": "github",
      "createdAt": "2022-04-29T11:02:29.842Z",
      "updatedAt": "2022-04-29T11:02:29.842Z"
    }
    ```
    
#### Delete credential by ID
Deletes a credential from your instance. You must be the owner of the credential.
`DELETE /credentials/{id}`
**Authorizations:** `ApiKeyAuth`
**Path Parameters:**
- `id` (string, required): The ID of the credential to delete.
**Responses:**
- **200 OK:**
    
    JSON
    
    ```
    {
      "id": "R2DjclaysHbqn778",
      "name": "Joe's Github Credentials",
      "type": "github",
      "createdAt": "2022-04-29T11:02:29.842Z",
      "updatedAt": "2022-04-29T11:02:29.842Z"
    }
    ```
    
#### Show credential data schema
Retrieves the data schema for a specific credential type.
`GET /credentials/schema/{credentialTypeName}`
**Authorizations:** `ApiKeyAuth`
**Path Parameters:**
- `credentialTypeName` (string, required): The name of the credential type (e.g., "freshdeskApi").
**Responses:**
- **200 OK:** (Example for `freshdeskApi`)
    
    JSON
    
    ```
    {
      "additionalProperties": false,
      "type": "object",
      "properties": {
        "apiKey": {},
        "domain": {}
      },
      "required": [
        "apiKey",
        "domain"
      ]
    }
    ```
    
#### Transfer a credential to another project
Transfers a credential to a different project.
`POST /credentials/{id}/transfer`
**Authorizations:** `ApiKeyAuth`
**Path Parameters:**
- `id` (string, required): The ID of the credential to transfer.
**Request Body (`application/json`):**
JSON
```
{
  "destinationProjectId": "string"
}
```
**Schema:**
- `destinationProjectId` (string, required): The ID of the project to transfer the credential to.
**Responses:**
- **200 OK:** (No specific sample provided, typically a success confirmation)
---
### Tags Operations
Operations related to managing tags in your n8n instance.
#### Create a tag
Creates a new tag in your instance.
`POST /tags`
**Authorizations:** `ApiKeyAuth`
**Request Body (`application/json`):**
JSON
```
{
  "name": "Production"
}
```
**Schema:**
- `name` (string, required): The name of the tag.
**Responses:**
- **201 Created:**
    
    JSON
    
    ```
    {
      "id": "2tUt1wbLX592XDdX",
      "name": "Production",
      "createdAt": "2019-08-24T14:15:22Z",
      "updatedAt": "2019-08-24T14:15:22Z"
    }
    ```
    
#### Retrieve all tags
Retrieves all tags from your instance.
`GET /tags`
**Authorizations:** `ApiKeyAuth`
**Query Parameters:**
- `limit` (number, optional): The maximum number of items to return. Default: `100`. Max: `250`. Example: `limit=100`
- `cursor` (string, optional): Used for pagination. Set to the `nextCursor` attribute from a previous response to fetch the next page.
**Responses:**
- **200 OK:**
    
    JSON
    
    ```
    {
      "data": [
        {}
      ],
      "nextCursor": "MTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDA"
    }
    ```
    
#### Retrieves a tag
Retrieves a single tag by its ID.
`GET /tags/{id}`
**Authorizations:** `ApiKeyAuth`
**Path Parameters:**
- `id` (string, required): The ID of the tag to retrieve.
**Responses:**
- **200 OK:**
    
    JSON
    
    ```
    {
      "id": "2tUt1wbLX592XDdX",
      "name": "Production",
      "createdAt": "2019-08-24T14:15:22Z",
      "updatedAt": "2019-08-24T14:15:22Z"
    }
    ```
    
#### Delete a tag
Deletes a tag.
`DELETE /tags/{id}`
**Authorizations:** `ApiKeyAuth`
**Path Parameters:**
- `id` (string, required): The ID of the tag to delete.
**Responses:**
- **200 OK:**
    
    JSON
    
    ```
    {
      "id": "2tUt1wbLX592XDdX",
      "name": "Production",
      "createdAt": "2019-08-24T14:15:22Z",
      "updatedAt": "2019-08-24T14:15:22Z"
    }
    ```
    
#### Update a tag
Updates an existing tag.
`PUT /tags/{id}`
**Authorizations:** `ApiKeyAuth`
**Path Parameters:**
- `id` (string, required): The ID of the tag to update.
**Request Body (`application/json`):**
JSON
```
{
  "name": "Production"
}
```
**Schema:**
- `name` (string, required): The updated name of the tag.
**Responses:**
- **200 OK:**
    
    JSON
    
    ```
    {
      "id": "2tUt1wbLX592XDdX",
      "name": "Production",
      "createdAt": "2019-08-24T14:15:22Z",
      "updatedAt": "2019-08-24T14:15:22Z"
    }
    ```
    
---
### SourceControl Operations
Operations related to source control integration. Requires the Source Control feature to be licensed and connected to a repository.
#### Pull changes from the remote repository
Pulls changes from the configured remote repository.
`POST /source-control/pull`
**Authorizations:** `ApiKeyAuth`
**Request Body (`application/json`):**
JSON
```
{
  "force": true,
  "variables": {
    "foo": "bar"
  }
}
```
**Schema:**
- `force` (boolean, optional): Whether to force the pull.
- `variables` (object, optional): Variables to be used during the pull.
**Responses:**
- **200 OK:**
    
    JSON
    
    ```
    {
      "variables": {
        "added": [],
        "changed": []
      },
      "credentials": [
        {}
      ],
      "workflows": [
        {}
      ],
      "tags": {
        "tags": [],
        "mappings": []
      }
    }
    ```
    
---
### Variables Operations
Operations related to managing variables in your n8n instance.
#### Create a variable
Creates a new variable in your instance.
`POST /variables`
**Authorizations:** `ApiKeyAuth`
**Request Body (`application/json`):**
JSON
```
{
  "key": "string",
  "value": "test"
}
```
**Schema:**
- `key` (string, required): The key of the variable.
- `value` (string, required): The value of the variable.
**Responses:**
- **200 OK:** (No specific sample provided, typically a success confirmation or the created variable object)
#### Retrieve variables
Retrieves variables from your instance.
`GET /variables`
**Authorizations:** `ApiKeyAuth`
**Query Parameters:**
- `limit` (number, optional): The maximum number of items to return. Default: `100`. Max: `250`. Example: `limit=100`
- `cursor` (string, optional): Used for pagination. Set to the `nextCursor` attribute from a previous response to fetch the next page.
**Responses:**
- **200 OK:**
    
    JSON
    
    ```
    {
      "data": [
        {}
      ],
      "nextCursor": "MTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDA"
    }
    ```
    
#### Delete a variable
Deletes a variable from your instance.
`DELETE /variables/{id}`
**Authorizations:** `ApiKeyAuth`
**Path Parameters:**
- `id` (string, required): The ID of the variable to delete.
**Responses:**
- **200 OK:** (No specific sample provided, typically a success confirmation)
#### Update a variable
Updates an existing variable in your instance.
`PUT /variables/{id}`
**Authorizations:** `ApiKeyAuth`
**Path Parameters:**
- `id` (string, required): The ID of the variable to update.
**Request Body (`application/json`):**
JSON
```
{
  "key": "string",
  "value": "test"
}
```
**Schema:**
- `key` (string, required): The updated key of the variable.
- `value` (string, required): The updated value of the variable.
**Responses:**
- **200 OK:** (No specific sample provided, typically a success confirmation or the updated variable object)
---
### Projects Operations
Operations related to managing projects in your n8n instance.
#### Create a project
Creates a new project in your instance.
`POST /projects`
**Authorizations:** `ApiKeyAuth`
**Request Body (`application/json`):**
JSON
```
{
  "name": "string"
}
```
**Schema:**
- `name` (string, required): The name of the project.
**Responses:**
- **200 OK:** (No specific sample provided, typically a success confirmation or the created project object)
#### Retrieve projects
Retrieves projects from your instance.
`GET /projects`
**Authorizations:** `ApiKeyAuth`
**Query Parameters:**
- `limit` (number, optional): The maximum number of items to return. Default: `100`. Max: `250`. Example: `limit=100`
- `cursor` (string, optional): Used for pagination. Set to the `nextCursor` attribute from a previous response to fetch the next page.
**Responses:**
- **200 OK:**
    
    JSON
    
    ```
    {
      "data": [
        {}
      ],
      "nextCursor": "MTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDA"
    }
    ```
    
#### Delete a project
Deletes a project from your instance.
`DELETE /projects/{projectId}`
**Authorizations:** `ApiKeyAuth`
**Path Parameters:**
- `projectId` (string, required): The ID of the project to delete.
**Responses:**
- **200 OK:** (No specific sample provided, typically a success confirmation)
#### Update a project
Updates an existing project.
`PUT /projects/{projectId}`
**Authorizations:** `ApiKeyAuth`
**Path Parameters:**
- `projectId` (string, required): The ID of the project to update.
**Request Body (`application/json`):**
JSON
```
{
  "name": "string"
}
```
**Schema:**
- `name` (string, required): The updated name of the project.
**Responses:**
- **200 OK:** (No specific sample provided, typically a success confirmation or the updated project object)
#### Add one or more users to a project
Adds one or more users to a project on your instance.
`POST /projects/{projectId}/users`
**Authorizations:** `ApiKeyAuth`
**Path Parameters:**
- `projectId` (string, required): The ID of the project.
**Request Body (`application/json`):**
JSON
```
{
  "relations": [
    {}
  ]
}
```
**Schema:**
- `relations` (array, required): A list of user IDs and roles to add to the project.
**Responses:**
- **200 OK:** (No specific sample provided, typically a success confirmation)
#### Delete a user from a project
Deletes a user from a project on your instance.
`DELETE /projects/{projectId}/users/{userId}`
**Authorizations:** `ApiKeyAuth`
**Path Parameters:**
- `projectId` (string, required): The ID of the project.
- `userId` (string, required): The ID of the user to delete from the project.
**Responses:**
- **200 OK:** (No specific sample provided, typically a success confirmation)
#### Change a user's role in a project
Changes a user's role within a specific project.
`PUT /projects/{projectId}/users/{userId}/role`
**Authorizations:** `ApiKeyAuth`
**Path Parameters:**
- `projectId` (string, required): The ID of the project.
- `userId` (string, required): The ID of the user whose role is to be changed.
**Request Body (`application/json`):**
JSON
```
{
  "role": "project:viewer"
}
```
**Schema:**
- `role` (string, required): The new role to assign to the user in the project.
**Responses:**
- **200 OK:** (No specific sample provided, typically a success confirmation or the updated project user object)