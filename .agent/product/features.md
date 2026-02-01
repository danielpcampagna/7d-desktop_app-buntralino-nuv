# Core Features

## Workspace Management

### Create Workspaces
- Name and describe workspaces
- Organize related projects together
- Navigate between workspaces easily

### Workspace Dashboard
- View all projects in a workspace
- Quick access to project details
- Project status indicators

## Project Creation

### Template Selection (Multi-Step Modal)
1. **Step 1: Choose Template** - Visual grid of available templates
2. **Step 2: Project Details** - Name, description, Python version

### Available Templates (8 total)

| Template | Category | Visual Editor |
|----------|----------|---------------|
| Python Package | Library | No |
| FastAPI | API | No |
| Dagster ETL | ETL | Yes |
| Prefect ETL | ETL | Yes |
| Dagu ETL | ETL | Yes |
| Airflow ETL | ETL | Yes |
| Optilogic Utilities | Utilities | No |
| UV Python Project | Generic | No |

### Template Categories
- **Library** - Reusable Python packages
- **API** - Web APIs and services
- **ETL** - Data pipeline projects (visual editor enabled)
- **Utilities** - Helper and utility projects
- **Generic** - General-purpose Python projects

## Project Import

### Import Sources (3 types)

| Source | Mode | Target |
|--------|------|--------|
| Data Guru | Convert | Any ETL tool (Airflow, Dagster, Prefect, Dagu) |
| UV Python | Direct | UV Python Project |
| Python Package | Direct | Python Package |

### Import Flow (Multi-Step Modal)
1. **Select Import Source** - Choose where to import from
2. **Provide Location** - File upload or folder path
3. **Select Target** (convert mode only) - Choose destination tool
4. **Configuration** (UV Python only) - Entry point and run command
5. **Project Details** - Name, description, Python version

## Visual Editor (ETL Projects)

### Supported for
- Dagster, Prefect, Dagu, Airflow projects

### Editor Modes
- **Visual Mode** - React Flow DAG editor
- **Code Mode** - Traditional code editor

### Tab Switcher
- Toggle between Visual and Code views
- Only shown for ETL projects

## Code Editor

### Features
- Syntax highlighting
- File explorer sidebar
- Multi-file support

## File Explorer

### Capabilities
- Tree view of project files
- File/folder navigation
- Context-aware visibility (hidden in Visual mode)

## Project Page

### Header
- Project name and description
- Template category badge
- Visual Editor indicator (if applicable)

### Editor Area
- Visual editor placeholder (ETL projects)
- Code editor with file tree (all projects)
