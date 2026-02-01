# Project & Workspace Types

## Location

`src/types/workspace.ts`

## Workspace Interface

```typescript
export interface Workspace {
  id: string;
  name: string;
  description: string;
  createdAt: string;  // ISO date string
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier (generated) |
| `name` | `string` | Workspace display name |
| `description` | `string` | Workspace description |
| `createdAt` | `string` | ISO timestamp of creation |

## Project Interface

```typescript
import { ProjectTemplate } from './templates';

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  pythonVersion: string;
  createdAt: string;
  template: ProjectTemplate;
  supportsVisualEditor: boolean;
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier (generated) |
| `workspaceId` | `string` | Parent workspace ID |
| `name` | `string` | Project display name |
| `description` | `string` | Project description |
| `pythonVersion` | `string` | Python version (e.g., "3.11") |
| `createdAt` | `string` | ISO timestamp of creation |
| `template` | `ProjectTemplate` | Template used to create project |
| `supportsVisualEditor` | `boolean` | Whether visual DAG editor is available |

### Visual Editor Support

The `supportsVisualEditor` field is derived from the template configuration:

```typescript
// When creating a project
const templateConfig = getTemplateConfig(selectedTemplate);
const newProject: Project = {
  // ...other fields
  template: selectedTemplate,
  supportsVisualEditor: templateConfig?.supportsVisualEditor ?? false,
};
```

Templates that support visual editor:
- `dagster`
- `prefect`
- `dagu`
- `airflow`

## FileNode Interface

```typescript
export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | File or folder name |
| `type` | `'file' \| 'folder'` | Node type |
| `children` | `FileNode[]` | Child nodes (folders only) |

### Example

```typescript
const projectFiles: FileNode[] = [
  {
    name: 'src',
    type: 'folder',
    children: [
      { name: '__init__.py', type: 'file' },
      { name: 'main.py', type: 'file' },
    ],
  },
  { name: 'pyproject.toml', type: 'file' },
  { name: 'README.md', type: 'file' },
];
```

## Creating Projects

### From Template (CreateProjectModal)

```typescript
interface CreateProjectData {
  name: string;
  description: string;
  pythonVersion: string;
  template: ProjectTemplate;
}

// Handler in WorkspacePage
const handleCreateProject = (data: CreateProjectData) => {
  const templateConfig = getTemplateConfig(data.template);
  
  addProject(workspaceId, {
    name: data.name,
    description: data.description,
    pythonVersion: data.pythonVersion,
    template: data.template,
    supportsVisualEditor: templateConfig?.supportsVisualEditor ?? false,
  });
};
```

### From Import (ImportProjectModal)

```typescript
interface ImportProjectData {
  name: string;
  description: string;
  pythonVersion: string;
  importSource: ImportSource;
  sourceFile?: File;
  projectPath?: string;
  targetTemplate: ProjectTemplate;
  entryPoint?: string;
  runCommand?: string;
}

// Handler in WorkspacePage
const handleImportProject = (data: ImportProjectData) => {
  const templateConfig = getTemplateConfig(data.targetTemplate);
  
  addProject(workspaceId, {
    name: data.name,
    description: data.description,
    pythonVersion: data.pythonVersion,
    template: data.targetTemplate,
    supportsVisualEditor: templateConfig?.supportsVisualEditor ?? false,
  });
};
```

## Store Usage

```typescript
// stores/workspaceStore.ts
const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  workspaces: Workspace[],
  projects: Project[],
  
  addProject: (workspaceId: string, project: Omit<Project, 'id' | 'createdAt'>) => {
    set((state) => ({
      projects: [...state.projects, {
        ...project,
        id: generateId(),
        workspaceId,
        createdAt: new Date().toISOString(),
      }]
    }));
  },
  
  getProjectsByWorkspace: (workspaceId: string) => {
    return get().projects.filter(p => p.workspaceId === workspaceId);
  },
}));
```

## Related Files

- `src/types/workspace.ts` - Type definitions
- `src/types/templates.ts` - Template types
- `src/stores/workspaceStore.ts` - State management
- `src/components/CreateProjectModal.tsx` - Project creation
- `src/components/ImportProjectModal.tsx` - Project import
