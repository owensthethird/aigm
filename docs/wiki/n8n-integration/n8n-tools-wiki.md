# n8n Tools for Agent Integration

## Introduction

This wiki documents the core n8n nodes and tools that can be integrated with an agent system. This guide focuses on built-in functionality and AI integrations that don't require external third-party services.

## Core Nodes

| Node | Description | Agent Use Case |
|------|-------------|---------------|
| **Start** | Initiates a workflow execution | Entry point for agent-triggered processes |
| **Execute Workflow** | Runs another workflow | Chain multiple agent behaviors together |
| **Set** | Sets variables to use in the workflow | Store and manipulate agent context or state |
| **Function** | Executes custom JavaScript code | Custom agent logic, data processing, or decision making |
| **IF** | Conditional routing based on conditions | Agent decision branching |
| **Switch** | Routes based on expression evaluations | Complex agent decision trees |
| **Wait** | Pauses workflow execution for a specified time | Delay agent actions or implement cooldowns |
| **Merge** | Combines data from multiple sources | Aggregating agent information |
| **SplitInBatches** | Splits data into batches | Process large datasets in manageable chunks |
| **No Operation** | Does nothing, just passes the data | Placeholder for future development |

## AI Nodes

| Node | Description | Agent Use Case |
|------|-------------|---------------|
| **OpenAI** | Interfaces with OpenAI services | Agent intelligence and natural language capabilities |
| **Ollama** | Local LLM integration | Self-hosted AI capabilities |
| **AI Agent** | Native n8n AI assistant | Basic AI support without external dependencies |
| **Code** | Executes custom code with AI assistance | Enhanced code generation and execution |

## Data Processing Nodes

| Node | Description | Agent Use Case |
|------|-------------|---------------|
| **CSV** | Processes CSV files | Agent data import/export |
| **JSON** | Manipulates JSON data | Structured data processing |
| **HTML** | Parses HTML content | Content extraction and formatting |
| **XML** | Processes XML data | Structured data handling |
| **Text** | Text manipulation operations | String processing for agents |
| **Spreadsheet File** | Works with local spreadsheet files | Tabular data handling |
| **Binary Data** | Handles binary file data | Processing images and other binary content |
| **Move Binary Data** | Transfers binary data between items | Managing file data in workflows |

## Local Utility Nodes

| Node | Description | Agent Use Case |
|------|-------------|---------------|
| **Cron** | Schedules workflow executions | Periodic agent tasks |
| **Error Workflow** | Handles errors in workflows | Agent self-healing |
| **Date & Time** | Manipulates dates and times | Agent scheduling logic |
| **Random** | Generates random values | Creating variations in agent responses |
| **File** | Reads/writes local files | Local data storage and retrieval |
| **Compression** | Compresses/decompresses files | Efficient file handling |
| **File Trigger** | Triggers on local file changes | React to file system events |
| **Interval** | Executes at regular intervals | Regular background tasks |
| **Manual Trigger** | Starts workflow manually | On-demand agent actions |

## Implementation Guide

1. **Setting Up n8n for Agent Use:**
   - Install n8n via npm or Docker
   - Configure local environment
   - Set up required credentials for AI services

2. **Creating Agent Workflows:**
   - Define trigger conditions
   - Connect processing nodes
   - Set up response actions

3. **Best Practices:**
   - Use modularity with multiple workflows
   - Implement proper error handling
   - Add logging for troubleshooting
   - Use environment variables for configuration

4. **Security Considerations:**
   - Secure storage of API keys for AI services
   - Implement proper authentication
   - Validate all inputs
   - Consider data privacy implications

## Resources

- [n8n Official Documentation](https://docs.n8n.io/)
- [n8n Node Reference](https://docs.n8n.io/integrations/)
