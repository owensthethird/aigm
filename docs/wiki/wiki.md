# Developer Onboarding Wiki

Welcome to the developer onboarding wiki! This documentation is designed to help new developers quickly get up to speed with the project. It aims to be a comprehensive and explanatory resource covering various aspects of the codebase, development environment, and project guidelines, organized by the system's high-level architecture.

## Table of Contents

*   **Project Overview**: A high-level description of the project, its goals, and its architecture.
*   **Development Setup**: Instructions for setting up your local development environment.
*   **AI Game Master Agent**: Documentation for the backend agent logic.
    *   [`agent_module.md`](./agent/agent_module.md): Core agent logic and functionalities.
    *   [`cli_module.md`](./agent/cli_module.md): Command-line interface for agent operations.
    *   [`config_module.md`](./agent/config_module.md): Application configuration and environment variables.
    *   [`database_module.md`](./agent/database_module.md): PostgreSQL database interactions.
    *   [`n8n_client_module.md`](./agent/n8n_client_module.md): n8n API interactions and client details.
*   **AI Providers**: Documentation for AI provider integration and management.
    *   [`provider-manager.md`](./ai-providers/provider-manager.md): Multiple AI provider management with failover capabilities.
*   **AI Game Master UI**: Documentation for the frontend user interface.
    *   [`ui_module.md`](./ui/ui_module.md): Overview of the UI module, its structure, features, and usage.
*   **n8n Integration and Tools**: Information on core n8n nodes, workflows, and their use cases for agent integration.
    *   [`n8n-tools-wiki.md`](./n8n-integration/n8n-tools-wiki.md): Detailed documentation on n8n nodes and their integration with the agent system.
    *   [`auth_test_module.md`](./n8n-integration/auth_test_module.md): Authentication testing script for n8n API.
    *   [`direct_auth_test_module.md`](./n8n-integration/direct_auth_test_module.md): Simplified direct authentication testing script.
    *   [`minimal_workflow_test_module.md`](./n8n-integration/minimal_workflow_test_module.md): Testing minimal n8n workflow creation.
    *   [`workflow_test_module.md`](./n8n-integration/workflow_test_module.md): General n8n workflow creation testing.
*   **Development & Operations**: How to run the project, common commands, and basic workflows.
*   **Contributing Guidelines**: Information on how to contribute to the project.
*   **Troubleshooting**: Common issues and their solutions.

# Project Overview

This project, "n8n-agent," serves as an agent for the AI Game Master. It is built using Node.js and TypeScript, and its primary function is to facilitate interactions with n8n workflows and manage related data. It integrates with n8n through an API client (`N8nClient`) and persists data using a PostgreSQL database (`N8nDatabase`). The project uses `axios` for HTTP requests, `pg` for PostgreSQL interactions, and `dotenv` for managing environment variables for configuration.

# Development Setup

To set up your local development environment, follow these steps:

1.  **Prerequisites**:
    *   Node.js (LTS version recommended)
    *   npm (Node Package Manager) or yarn
    *   TypeScript (installed locally via `npm install` or `yarn install`)
    *   PostgreSQL database (if interacting with a database)

2.  **Clone the Repository**:
    ```bash
    git clone <repository_url>
    cd n8n-agent
    ```
    (Replace `<repository_url>` with the actual repository URL)

3.  **Install Dependencies**:
    Navigate to the project root directory and install the necessary packages:
    ```bash
    npm install
    # or
    yarn install
    ```

4.  **Environment Variables**:
    This project uses `dotenv` to manage environment variables. Create a `.env` file in the project root directory. You will need to populate this file with the required variables for your development environment. Common variables might include:
    *   `DATABASE_URL`: Connection string for your PostgreSQL database.
    *   `N8N_API_KEY`: API key for n8n.
    *   Any other API keys or configuration settings your application requires.

    Example `.env` file:
    ```
    DATABASE_URL="postgresql://user:password@host:port/database"
    N8N_API_KEY="your_n8n_api_key"
    ```

# AI Game Master Agent

This section provides detailed documentation for the backend agent components of the AI Game Master system. These modules handle the core logic, command-line interactions, configuration, database operations, and communication with the n8n API.

For specific details on each module, refer to the following documentation files:

*   **Core Agent Logic**: [`agent_module.md`](./agent/agent_module.md)
*   **Command-Line Interface (CLI)**: [`cli_module.md`](./agent/cli_module.md)
*   **Application Configuration**: [`config_module.md`](./agent/config_module.md)
*   **PostgreSQL Database Interactions**: [`database_module.md`](./agent/database_module.md)
*   **n8n API Client**: [`n8n_client_module.md`](./agent/n8n_client_module.md)

# n8n Integration and Tools

This section details how the AI Game Master Agent integrates with n8n, including information on core n8n nodes, their use cases, and specific testing utilities related to n8n workflows and authentication.

For more in-depth information, refer to:

*   **n8n Tools for Agent Integration**: [`n8n-tools-wiki.md`](./n8n-integration/n8n-tools-wiki.md)
*   **Authentication Test Script**: [`auth_test_module.md`](./n8n-integration/auth_test_module.md)
*   **Direct Authentication Test Script**: [`direct_auth_test_module.md`](./n8n-integration/direct_auth_test_module.md)
*   **Minimal Workflow Test Module**: [`minimal_workflow_test_module.md`](./n8n-integration/minimal_workflow_test_module.md)
*   **Workflow Test Module**: [`workflow_test_module.md`](./n8n-integration/workflow_test_module.md)

# Development & Operations

This section outlines essential commands and workflows for developing, building, and running the AI Game Master project.

## Running the Application

*   **Development Mode (with `ts-node`)**:
    This is the recommended way to run the application during development as it allows for real-time changes without manual compilation.
    ```bash
    npm run dev
    ```

*   **Production/Compiled Mode**:
    To run the application after it has been compiled to JavaScript:
    ```bash
    npm start
    ```
    Ensure you have run `npm run build` at least once to generate the `dist/` folder.

## Common Workflows

*   **Building the project**:
    ```bash
    npm run build
    ```
    This command compiles all TypeScript files from `src/` into JavaScript in the `dist/` directory.

*   **Adding New Dependencies**:
    To add a new package to the project, use npm:
    ```bash
    npm install <package-name>
    # or for development dependencies
    npm install --save-dev <package-name>
    ```
    Remember to commit the updated `package.json` and `package-lock.json` files.

# Contributing Guidelines

This section outlines the guidelines for contributing to the `n8n-agent` project.

## Coding Standards

*   **TypeScript Best Practices**: Adhere to standard TypeScript best practices, including strong typing, clear interfaces, and proper error handling.
*   **Code Readability**: Write clean, readable, and well-commented code. Prioritize clarity over cleverness.
*   **ESLint/Prettier**: Ensure your code adheres to any configured ESLint and Prettier rules.

## Pull Request Process

1.  **Fork the Repository**: Start by forking the `n8n-agent` repository to your GitHub account.
2.  **Create a New Branch**: Create a new branch from `main` for your feature or bug fix. Use descriptive branch names (e.g., `feature/add-new-workflow`, `bugfix/fix-database-connection`).
    ```bash
    git checkout -b feature/your-feature-name
    ```
3.  **Implement Your Changes**: Write your code, ensuring it meets the project's coding standards and thoroughly testing your changes locally.
4.  **Commit Your Changes**: Write clear and concise commit messages. Each commit should represent a single logical change.
    ```bash
    git commit -m "feat: Add new workflow integration"
    ```
5.  **Push to Your Fork**: Push your new branch to your forked repository.
    ```bash
    git push origin feature/your-feature-name
    ```
6.  **Create a Pull Request**: Open a pull request from your branch to the `main` branch of the original `n8n-agent` repository. Provide a detailed description of your changes, including the problem it solves and how it was tested.
7.  **Address Feedback**: Respond to comments and feedback from reviewers promptly. Make necessary adjustments to your code and tests.

# Troubleshooting

This section addresses common issues you might encounter while developing with the `n8n-agent` project.

## 1. Missing Environment Variables

**Issue**: The application fails to start or behaves unexpectedly, often with errors related to missing API keys or database connection strings.

**Solution**: Ensure you have created a `.env` file in the project root and populated it with all the necessary environment variables. Refer to the [Environment Variables](#environment-variables) section under [Development Setup](#development-setup) for a list of common variables and an example.

## 2. TypeScript Compilation Errors

**Issue**: When running `npm run build` or `npm run dev`, you encounter TypeScript compilation errors.

**Solution**:
*   **Check `tsconfig.json`**: Ensure your `tsconfig.json` is correctly configured. Incorrect paths or compiler options can lead to issues.
*   **Dependency Issues**: Sometimes, compilation errors can stem from outdated or corrupted `node_modules`. Try deleting `node_modules` and `package-lock.json` (or `yarn.lock`) and reinstalling dependencies:
    ```bash
    rm -rf node_modules
    rm package-lock.json
    npm install
    ```
*   **Syntax Errors**: Review the reported errors and fix any syntax or type-related issues in your TypeScript code.

## 3. Database Connection Issues

**Issue**: The application cannot connect to the PostgreSQL database.

**Solution**:
*   **`DATABASE_URL`**: Verify that the `DATABASE_URL` in your `.env` file is correct, including the username, password, host, port, and database name.
*   **Database Server Status**: Ensure your PostgreSQL database server is running and accessible from your development machine.
*   **Firewall/Network**: Check if any firewall rules or network configurations are blocking the connection to the database.
*   **Credentials**: Double-check the database user credentials.

## 4. n8n API Connection Issues

**Issue**: The agent cannot connect to or interact with the n8n instance.

**Solution**:
*   **`N8N_API_KEY`**: Confirm that the `N8N_API_KEY` in your `.env` file is correct and has the necessary permissions in your n8n instance.
*   **n8n Instance Status**: Ensure your n8n instance is running and accessible.
*   **Network Connectivity**: Verify network connectivity between your agent and the n8n instance.
*   **API Endpoint**: If applicable, ensure the n8n API endpoint configured in the agent is correct.

## 5. `npm` or `yarn` Command Not Found

**Issue**: When trying to run `npm` or `yarn` commands, you get a "command not found" error.

**Solution**: This typically means Node.js and its package manager are not installed or not correctly added to your system's PATH. Install Node.js from its official website, which includes npm. If you prefer yarn, install it globally after Node.js.
