# AI Game Master System: High-Level Overview

This document provides a high-level overview of the current implementation of the AI Game Master system, outlining its purpose, core architectural components, key technologies, and fundamental data flow.

## 1. System Purpose

The AI Game Master (AIGM) system is designed to facilitate and enhance tabletop role-playing games (TTRPGs) by integrating artificial intelligence capabilities. It aims to provide an immersive experience for users by managing game state, character interactions, and narrative progression, largely powered by n8n workflows and a user-friendly interface.

## 2. Architectural Components

The AIGM system is primarily composed of three high-level components:

### 2.1. AI Game Master Agent (Backend)

This is the backend component of the system, implemented in Node.js and TypeScript. It acts as the core intelligence and operational hub, responsible for:

*   **Core Logic**: Managing game states, processing commands, and orchestrating interactions.
*   **CLI**: Providing a command-line interface for direct interaction and system management.
*   **Configuration**: Handling application-wide settings and environment variables.
*   **Database Interaction**: Persisting game data, workflow execution logs, and analytics in a PostgreSQL database.
*   **n8n Client**: Communicating with the n8n automation platform to trigger workflows and retrieve execution results.

### 2.2. AI Game Master UI (Frontend)

This is the frontend component, a modern React-based web application. It provides the user-facing interface for interacting with the AIGM system, featuring:

*   **Responsive Layout**: An adaptable three-panel design for various screen sizes.
*   **Real-time Chat**: An interface for communication with the AI and other players, with context-based styling.
*   **Game Management**: Tools for character creation, game state tracking, and visualization.
*   **n8n Integration**: Direct interaction with the n8n API for triggering AI-powered workflows.

### 2.3. n8n Integration (Automation Platform)

n8n serves as the automation and AI orchestration platform for the AIGM system. It hosts various workflows that the Agent interacts with to perform AI-driven tasks. Key aspects include:

*   **Workflow Execution**: Managing and executing predefined workflows for game logic, AI responses, and data processing.
*   **Node Utilization**: Leveraging n8n's extensive library of nodes, including AI-specific nodes (e.g., OpenAI, Ollama) and utility nodes (e.g., data processing, file operations).
*   **API Interaction**: The Agent communicates with n8n via its REST API to trigger workflows, retrieve execution details, and manage resources.

## 3. Key Technologies

| Component        | Primary Technologies                                                                                                                                                                      |
| :--------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Agent**        | Node.js, TypeScript, Express.js (for potential API endpoints), `axios` (HTTP client), `pg` (PostgreSQL client), `dotenv` (environment variables)                                             |
| **UI**           | React, TypeScript, npm/Yarn, `axios` (HTTP client), React Router (for navigation), Emotion (for styling), Framer Motion (for animations), `react-query` (data fetching)                          |
| **n8n Platform** | Node.js (underlying), n8n workflow engine, various n8n nodes (e.g., Start, Set, Function, IF, OpenAI, Ollama, HTTP Request, PostgreSQL)                                                        |
| **Database**     | PostgreSQL (Relational Database Management System)                                                                                                                                        |

## 4. High-Level Data Flow

1.  **User Interaction (UI)**: Users interact with the AI Game Master system through the React-based UI, initiating actions such as sending chat messages, creating characters, or managing game state.
2.  **UI to Agent/n8n**: The UI communicates with the backend Agent (for system status, core logic) and directly with the n8n API (for triggering workflows, especially AI-related ones).
3.  **Agent Processing**: The Agent processes requests, interacts with the PostgreSQL database for data persistence and retrieval, and, crucially, orchestrates n8n workflows.
4.  **Agent to n8n**: The Agent triggers n8n workflows via API calls, passing relevant game context or user input.
5.  **n8n Workflow Execution**: n8n workflows execute, utilizing various nodes to perform tasks like:
    *   Calling AI models (OpenAI, Ollama) for narrative generation or decision-making.
    *   Processing data, making external HTTP requests, or interacting with other services.
    *   Updating the database via the Agent's database module (or direct n8n database nodes if configured).
6.  **n8n to Agent/UI**: n8n workflows return results to the Agent (e.g., AI responses, status updates), which then processes and relays relevant information back to the UI for display to the user.
7.  **Database**: The PostgreSQL database acts as a central repository for game state, user data, and n8n execution logs, accessible by the Agent for persistence and retrieval.

This high-level overview should provide a foundational understanding of the AI Game Master system's architecture and its operational flow. For detailed documentation on specific modules or components, please refer to the respective sections in the main wiki documentation. 