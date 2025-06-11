# Safe to Delete - File Cleanup List

This document lists files and directories that can be safely removed from the AI Game Master system. These files are either redundant, outdated, or no longer needed after recent system improvements and reorganization.

## Test and Development Files

### UI Test Files
- `ui/character-panel-move-test.html` - Standalone test file for panel movement, functionality now integrated into main grid system
- `ui/test-character-panel-move.html` - Already deleted, but mentioned for completeness

### Build Test Files (dist/)
- `dist/workflow-test.js` - Development testing file
- `dist/minimal-workflow-test.js` - Development testing file  
- `dist/direct-auth-test.js` - Development testing file
- `dist/auth-test.js` - Development testing file

## Outdated Planning and Documentation

### Working Folder (Temporary Files)
- `workingFolder(wiki_ignore)/` - **ENTIRE DIRECTORY** can be deleted
  - `newProductionDoc` - Outdated production documentation
  - `aiSimplifyPlan.md` - Completed planning document
  - `longtermMemory/AI_IMPLEMENTATION_CHECKLIST.md` - Completed checklist
  - `longtermMemory/aiPlanning.md` - Completed planning document
  - `longtermMemory/UI_CONNECTION_CHECKLIST.md` - Completed checklist
  - `longtermMemory/UI_IMPLEMENTATION_PLAN.md` - Superseded by current implementation
  - `longtermMemory/interface-design.md` - Design now implemented in grid system
  - `longtermMemory/color-system.md` - Color system now integrated

### Root Level Planning Documents
- `IMPLEMENTATION_PLAN.md` - Planning document, now implemented
- `CSS_GRID_ANIMATIONS.md` - Design document, features now implemented
- `UI_WIREFRAME_UPDATED.md` - Wireframe document, UI now implemented
- `CHANGELOG.md` - Can be moved to docs/ or deleted if not actively maintained

### Action Files (Likely Temporary)
- `1 action.json` - Appears to be temporary configuration file
- `2 actions.json` - Appears to be temporary configuration file

### TypeScript Build Files
- `tsconfig.tsbuildinfo` - Build cache file, can be regenerated
- `dist/` directory contents (except necessary runtime files) - Build artifacts


## What to Keep (DO NOT DELETE)

### Essential System Files
- `ui/public/index.html` - Main grid dashboard (recently cleaned and optimized)
- `ui/sample-layout.json` - Reference layout for grid system
- `package.json` files - Dependency management
- `package-lock.json` - Dependency lockfile
- `tsconfig.json` - TypeScript configuration
- `README.md` - Project documentation
- `ARCHITECTURE.md` - System architecture documentation

### Core Application Files
- `src/` directory - Core application source code
- `n8n-config.json` - N8N integration configuration
- `ai-config.json` - AI system configuration
- `restart.js` - System restart utility
- `docs/external-docs/` - External API documentation (lmStudioAPI.md, n8nAPI.md)

### Runtime and Distribution (Keep if Active)
- Essential files in `dist/` that are actively used for runtime
- `node_modules/` - Dependencies (can be regenerated but shouldn't be deleted manually)

## Deletion Priority

### High Priority (Safe to Delete Immediately)
1. `workingFolder(wiki_ignore)/` - Entire directory
2. `ui/character-panel-move-test.html` - Test file
3. `IMPLEMENTATION_PLAN.md` - Completed planning
4. `CSS_GRID_ANIMATIONS.md` - Completed design doc
5. `UI_WIREFRAME_UPDATED.md` - Completed wireframe
6. `tsconfig.tsbuildinfo` - Build cache

### Medium Priority (Verify Before Deletion)
1. `1 action.json` and `2 actions.json` - Verify these aren't in use
2. `workingmemory.txt` - Check if actively used
3. `CHANGELOG.md` - Move to docs/ or delete if unmaintained
4. Test files in `dist/` directory

### Low Priority (Optional Cleanup)
1. `.vscode/` - If team doesn't need standardized settings
2. `.windsurfrules` - Editor-specific configuration

## Total Space Savings
Estimated disk space that will be freed:
- workingFolder(wiki_ignore)/: ~76KB
- Test files: ~25KB  
- Planning documents: ~50KB
- Build artifacts: Variable

## Notes
- Always create a backup before mass deletion
- The grid system is now fully functional with cleaned code
- Wiki documentation has been restructured and consolidated
- UI system is stable and no longer needs multiple test files 