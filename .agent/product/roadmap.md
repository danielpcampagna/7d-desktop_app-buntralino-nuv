# Product Roadmap

## Current Status

The UI is implemented with the following features complete:
- Workspace management (create, view, navigate)
- Project creation with 8 templates
- Project import from 3 sources
- Project page with editor mode toggle (ETL projects)
- File explorer and code editor placeholders

## Planned Features

### High Priority

#### React Flow Visual Editor Integration
- **Status**: Placeholder implemented
- **Goal**: Full DAG editing for ETL projects
- **Details**:
  - Drag-and-drop node creation
  - Visual connection of pipeline steps
  - Real-time sync with code representation
  - Support for all 4 ETL tools

#### Backend API Integration
- **Status**: Not started
- **Goal**: Connect UI to backend services
- **Details**:
  - Use Kubb to generate API hooks
  - Project CRUD operations
  - Workspace management
  - File system operations

#### Template File Scaffolding
- **Status**: Not started
- **Goal**: Generate actual project files when creating from template
- **Details**:
  - Each template defines `defaultFiles` structure
  - Backend creates files based on template
  - Pre-configured dependencies and configuration

### Medium Priority

#### Project Dependencies Across Workspace
- **Status**: Not started
- **Goal**: Python packages can be imported by other projects
- **Details**:
  - Python Package projects can be dependencies
  - Automatic path configuration
  - Shared virtual environments

#### Project Dashboard
- **Status**: Not started
- **Goal**: Monitor running projects
- **Details**:
  - View running ETL pipelines
  - Logs and status indicators
  - Quick actions (run, stop, restart)

### Lower Priority

#### Custom Template Creation
- **Status**: Not started
- **Goal**: Users can create their own templates
- **Details**:
  - Save existing project as template
  - Define template metadata
  - Share templates across workspaces

#### Additional Import Sources
- **Status**: Not started
- **Goal**: Import from more external sources
- **Potential sources**:
  - GitHub repositories
  - ZIP archives
  - Other ETL tools (Luigi, Kedro, etc.)

## Technical Debt

### Items to Address
- Mock data in `workspaceStore.ts` needs replacement with API calls
- Visual editor placeholder needs React Flow implementation
- File explorer is placeholder UI
- Code editor needs actual editing functionality

## API Requirements

The backend API should support:

```
# Workspaces
POST   /api/workspaces              # Create workspace
GET    /api/workspaces              # List workspaces
GET    /api/workspaces/:id          # Get workspace
PUT    /api/workspaces/:id          # Update workspace
DELETE /api/workspaces/:id          # Delete workspace

# Projects
POST   /api/workspaces/:id/projects     # Create project
GET    /api/workspaces/:id/projects     # List projects
GET    /api/projects/:id                # Get project
PUT    /api/projects/:id                # Update project
DELETE /api/projects/:id                # Delete project

# Project Files
GET    /api/projects/:id/files          # Get file tree
GET    /api/projects/:id/files/:path    # Get file content
PUT    /api/projects/:id/files/:path    # Update file
POST   /api/projects/:id/files          # Create file
DELETE /api/projects/:id/files/:path    # Delete file

# Project Operations
POST   /api/projects/:id/run            # Run project
POST   /api/projects/:id/test           # Run tests
POST   /api/projects/:id/install        # Install dependencies
```
