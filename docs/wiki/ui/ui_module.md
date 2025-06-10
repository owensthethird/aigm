# UI Module (`ui/`)

This document provides an overview of the User Interface (UI) for the AI Game Master application. The UI is designed to provide an interactive and immersive experience for tabletop role-playing games, augmented by AI assistance. It is a modern React-based frontend application.

## Project Structure

The UI project follows a modular structure. The primary source code resides in `ui/src/`.

*   **`ui/public/`**: Contains static assets such as `index.html`, images, and other publicly accessible files.
*   **`ui/src/`**: Houses the main source code for the UI application, organized into several key subdirectories:
    *   **`ui/src/api/`**: Modules dedicated to handling API service calls and data fetching, ensuring clear separation of concerns for network operations.
    *   **`ui/src/components/`**: A collection of reusable UI components (e.g., buttons, forms, display elements) that can be composed to build complex interfaces.
    *   **`ui/src/contexts/`**: React Context API providers for managing global state and application-wide data, allowing components to consume shared data without prop drilling.
    *   **`ui/src/hooks/`**: Custom React hooks to encapsulate reusable logic and stateful behavior, promoting code reusability and simplifying component logic.
    *   **`ui/src/layouts/`**: Components that define the overall structural layouts of different sections of the UI, providing consistent page structures.
    *   **`ui/src/pages/`**: Top-level components representing individual pages or views within the application, handling specific routes and orchestrating data display.
    *   **`ui/src/styles/`**: Contains CSS files, theme definitions, and other styling-related assets, ensuring a consistent visual design across the application.
    *   **`ui/src/types/`**: TypeScript type definitions and interfaces for data structures used throughout the UI, enforcing type safety and improving code clarity.
    *   **`ui/src/utils/`**: General utility functions and helper modules that provide common functionalities not tied to specific UI components or business logic.
*   **`ui/package.json`**: Defines project metadata, build scripts, and lists all npm package dependencies required for the UI application.
*   **`ui/tsconfig.json`**: TypeScript configuration file for the UI project, specifying compiler options, source file inclusion, and path aliases (e.g., `@components/*`, `@utils/*`) for simplified module imports.
*   **`ui/tsconfig.node.json`**: TypeScript configuration specifically for Node.js-related settings within the UI project, typically for build tools or scripts.
*   **`ui/README.md`**: Provides a high-level overview of the UI project, its features, and basic setup instructions.

## Key Features

The AI Game Master UI is designed with the following key features:

*   **Three-panel responsive layout**: Offers an adaptable and organized interface that adjusts seamlessly across various screen sizes, optimizing usability on different devices.
*   **Real-time chat interface**: Enables dynamic communication with AI and other users, featuring context-based styling to visually differentiate message types.
*   **Character creation and management**: Provides tools for users to create, view, edit, and manage game characters within the application.
*   **Game state tracking and visualization**: Helps in monitoring and displaying the current state of the game, including turns, actions, and key events.
*   **n8n API integration**: Facilitates seamless interaction with n8n workflows for AI assistance, automation, and custom game logic execution.
*   **Multiple visual themes**: Offers various aesthetic options for the user interface, allowing users to customize their visual experience.

## Getting Started (Development)

To set up the UI for local development:

### Prerequisites

*   Node.js (LTS version recommended)
*   npm or Yarn (Node Package Manager)
*   A running n8n instance (essential for full AI integration functionality, as the UI interacts with it).

### Installation

1.  Navigate to the `ui` directory in your terminal:
    ```bash
    cd ui
    ```
2.  Install project dependencies:
    ```bash
    npm install
    # or using Yarn:
    yarn install
    ```

### Running the Development Server

1.  Start the development server:
    ```bash
    npm start
    # or using Yarn:
    yarn start
    ```
2.  Open your web browser and navigate to `http://localhost:3000` to view the application.

### Configuration

To enable n8n integration, configure the API connection within the UI's settings panel (typically accessible from the application interface) with the following:

*   **Base URL**: The URL of your n8n instance (e.g., `http://localhost:5678`).
*   **API Key**: Your n8n API key, which authenticates requests from the UI to the n8n instance.

## Building for Production

To create an optimized production build of the UI application:

```bash
npm run build
# or using Yarn:
yarn build
```

The compiled and optimized static files will be located in the `ui/build/` directory. These files can then be deployed to a web server.

## Extending the UI

To contribute new components, features, or modify existing functionality:

1.  **Create New Components**: Place new UI components in their respective categorized directories within `src/components/` (e.g., `src/components/Game/PlayerCard.tsx`).
2.  **Utilize Path Aliases**: For improved readability and maintainability, use configured path aliases for importing modules within `src/` (e.g., `import { Button } from '@components/Button';` instead of relative paths like `../../components/Button`). These aliases are defined in `ui/tsconfig.json`.
3.  **State Management**: Update or create new React Context providers in `src/contexts/` as required for managing global application state or shared data.
4.  **Reusable Logic**: Implement custom hooks in `src/hooks/` to encapsulate and reuse stateful logic across multiple components.
5.  **Page and Routing**: Add new pages as top-level components in `src/pages/` and configure their routes in `src/App.tsx` to integrate them into the application's navigation.

## Related Documentation

*   Refer to the interface design document for detailed UI specifications (if available).
*   Consult the color system documentation for visual design guidelines (if available). 