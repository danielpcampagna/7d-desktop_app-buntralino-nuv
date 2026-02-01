# System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
├─────────────────────────────────────────────────────────────┤
│  Pages          │  Components      │  State Management      │
│  - HomePage     │  - Modals        │  - Zustand Store       │
│  - WorkspacePage│  - Cards         │  - useWorkspaceStore   │
│  - ProjectPage  │  - Forms         │                        │
├─────────────────────────────────────────────────────────────┤
│                    Types & Utilities                         │
│  - workspace.ts  - templates.ts  - helper functions         │
├─────────────────────────────────────────────────────────────┤
│                    API Layer (Planned)                       │
│  - Kubb-generated hooks                                      │
│  - REST API client                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (Planned)                     │
│  - Project management                                        │
│  - File system operations                                    │
│  - ETL tool integration                                      │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── components/           # Reusable UI components
│   ├── CreateProjectModal.tsx    # Multi-step project creation
│   ├── ImportProjectModal.tsx    # Multi-step project import
│   ├── ProjectCard.tsx           # Project display card
│   ├── WorkspaceCard.tsx         # Workspace display card
│   └── ui/                       # shadcn/ui components
├── pages/                # Route pages
│   ├── HomePage.tsx              # Workspace list
│   ├── WorkspacePage.tsx         # Project list within workspace
│   └── ProjectPage.tsx           # Project editor view
├── stores/               # State management
│   └── workspaceStore.ts         # Zustand store
├── types/                # TypeScript definitions
│   ├── workspace.ts              # Workspace, Project, FileNode
│   └── templates.ts              # Template configs, import sources
├── lib/                  # Utility functions
│   └── utils.ts                  # cn() helper, etc.
└── App.tsx               # Root component with routing
```

## Technology Stack

### Core Framework
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server

### UI Components
- **shadcn/ui** - Component library
- **Radix UI** - Headless UI primitives
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library

### State Management
- **Zustand** - Lightweight state management
- No Redux/MobX complexity needed

### Routing
- **React Router v6** - Client-side routing

### Planned Integrations
- **React Flow** - Visual DAG editor for ETL
- **Monaco Editor** - Code editing (VS Code editor)
- **Kubb** - API hook generation from OpenAPI spec

## Key Architectural Decisions

### 1. Zustand for State
Chose Zustand over Redux for:
- Simpler API
- Less boilerplate
- Built-in TypeScript support
- Easy to mock for development

### 2. Multi-Step Modals
Both `CreateProjectModal` and `ImportProjectModal` use:
- Internal step state
- Conditional rendering per step
- Step indicators in UI
- Data accumulation across steps

### 3. Template System
Templates are:
- Defined in `types/templates.ts`
- Statically configured (not fetched from API)
- Categorized for organization
- Extensible for future additions

### 4. Visual Editor Separation
- ETL projects have `supportsVisualEditor: true`
- UI conditionally shows Visual/Code tabs
- Visual editor is a separate component (placeholder now)
- Clean separation from code editing

## Data Flow

```
User Action
    │
    ▼
Component (e.g., CreateProjectModal)
    │
    ▼
Store Action (e.g., addProject)
    │
    ▼
Zustand Store Update
    │
    ▼
React Re-render
    │
    ▼
Updated UI
```

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `CreateProjectModal.tsx` |
| Pages | PascalCase + Page | `WorkspacePage.tsx` |
| Stores | camelCase + Store | `workspaceStore.ts` |
| Types | camelCase | `workspace.ts` |
| Utils | camelCase | `utils.ts` |
