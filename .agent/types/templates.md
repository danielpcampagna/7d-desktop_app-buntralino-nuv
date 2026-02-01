# Template Types Reference

## Location

`src/types/templates.ts`

## ProjectTemplate Type

All available project templates:

```typescript
export type ProjectTemplate =
  | 'python-package'
  | 'fastapi'
  | 'dagster'
  | 'prefect'
  | 'dagu'
  | 'airflow'
  | 'optilogic-utilities'
  | 'uv-python';
```

## TemplateCategory Type

Template categories for grouping:

```typescript
export type TemplateCategory =
  | 'library'
  | 'api'
  | 'etl'
  | 'utilities'
  | 'generic';
```

## TemplateConfig Interface

Configuration for each template:

```typescript
import { LucideIcon } from 'lucide-react';

export interface TemplateConfig {
  id: ProjectTemplate;
  name: string;
  description: string;
  icon: LucideIcon;
  category: TemplateCategory;
  supportsVisualEditor: boolean;
  defaultFiles?: string[];
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `ProjectTemplate` | Unique template identifier |
| `name` | `string` | Display name |
| `description` | `string` | Short description |
| `icon` | `LucideIcon` | Icon component from lucide-react |
| `category` | `TemplateCategory` | Category for grouping |
| `supportsVisualEditor` | `boolean` | Enable visual DAG editor |
| `defaultFiles` | `string[]` | Files to scaffold (planned) |

## TEMPLATE_CONFIGS Array

```typescript
export const TEMPLATE_CONFIGS: TemplateConfig[] = [
  {
    id: 'python-package',
    name: 'Python Package',
    description: 'Create a reusable Python package',
    icon: Package,
    category: 'library',
    supportsVisualEditor: false,
  },
  {
    id: 'fastapi',
    name: 'FastAPI',
    description: 'Create a modern Python API',
    icon: Zap,
    category: 'api',
    supportsVisualEditor: false,
  },
  {
    id: 'dagster',
    name: 'Dagster ETL',
    description: 'Create a Dagster data pipeline',
    icon: GitBranch,
    category: 'etl',
    supportsVisualEditor: true,
  },
  {
    id: 'prefect',
    name: 'Prefect ETL',
    description: 'Create a Prefect workflow',
    icon: Workflow,
    category: 'etl',
    supportsVisualEditor: true,
  },
  {
    id: 'dagu',
    name: 'Dagu ETL',
    description: 'Create a Dagu workflow',
    icon: Network,
    category: 'etl',
    supportsVisualEditor: true,
  },
  {
    id: 'airflow',
    name: 'Airflow ETL',
    description: 'Create an Airflow DAG project',
    icon: Wind,
    category: 'etl',
    supportsVisualEditor: true,
  },
  {
    id: 'optilogic-utilities',
    name: 'Optilogic Utilities',
    description: 'Create an Optilogic utilities project',
    icon: Wrench,
    category: 'utilities',
    supportsVisualEditor: false,
  },
  {
    id: 'uv-python',
    name: 'UV Python Project',
    description: 'Create a generic UV Python project',
    icon: Terminal,
    category: 'generic',
    supportsVisualEditor: false,
  },
];
```

## Category Styling

```typescript
export const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  library: 'Library',
  api: 'API',
  etl: 'ETL',
  utilities: 'Utilities',
  generic: 'Generic',
};

export const CATEGORY_COLORS: Record<TemplateCategory, string> = {
  library: 'bg-blue-100 text-blue-800',
  api: 'bg-green-100 text-green-800',
  etl: 'bg-purple-100 text-purple-800',
  utilities: 'bg-orange-100 text-orange-800',
  generic: 'bg-gray-100 text-gray-800',
};
```

## Helper Functions

```typescript
// Get config by template ID
export function getTemplateConfig(
  template: ProjectTemplate
): TemplateConfig | undefined {
  return TEMPLATE_CONFIGS.find(t => t.id === template);
}

// Get templates by category
export function getTemplatesByCategory(
  category: TemplateCategory
): TemplateConfig[] {
  return TEMPLATE_CONFIGS.filter(t => t.category === category);
}

// Get all ETL templates (for import target selection)
export function getWorkflowOrchestrationTemplates(): TemplateConfig[] {
  return TEMPLATE_CONFIGS.filter(
    t => t.category === 'etl' && t.supportsVisualEditor
  );
}
```

## ImportSource Type

```typescript
export type ImportSource =
  | 'data-guru'
  | 'uv-python'
  | 'python-package';
```

## ImportMode Type

```typescript
export type ImportMode = 'convert' | 'direct';
```

## ImportSourceConfig Interface

```typescript
export interface ImportSourceConfig {
  id: ImportSource;
  name: string;
  description: string;
  icon: LucideIcon;
  mode: ImportMode;
  
  // For 'convert' mode
  fileExtensions?: string[];
  targetTemplates?: ProjectTemplate[];
  
  // For 'direct' mode
  targetTemplate?: ProjectTemplate;
  acceptsFolder?: boolean;
  requiresEntryPoint?: boolean;
  requiresRunCommand?: boolean;
}
```

## IMPORT_SOURCE_CONFIGS Array

```typescript
export const IMPORT_SOURCE_CONFIGS: ImportSourceConfig[] = [
  {
    id: 'data-guru',
    name: 'Data Guru',
    description: 'Import ETL from Data Guru format',
    icon: FileJson,
    mode: 'convert',
    fileExtensions: ['.dg', '.json'],
    targetTemplates: ['airflow', 'dagster', 'prefect', 'dagu'],
  },
  {
    id: 'uv-python',
    name: 'UV Python Project',
    description: 'Import existing UV Python project',
    icon: Terminal,
    mode: 'direct',
    targetTemplate: 'uv-python',
    acceptsFolder: true,
    requiresEntryPoint: true,
    requiresRunCommand: true,
  },
  {
    id: 'python-package',
    name: 'Python Package',
    description: 'Import existing Python package',
    icon: Package,
    mode: 'direct',
    targetTemplate: 'python-package',
    acceptsFolder: true,
  },
];
```

## ImportProjectData Interface

Data passed when importing a project:

```typescript
export interface ImportProjectData {
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
```

## UV_RUN_COMMAND_PRESETS

```typescript
export const UV_RUN_COMMAND_PRESETS = [
  { label: 'uv run python', value: 'uv run python' },
  { label: 'uv run pytest', value: 'uv run pytest' },
  { label: 'uv run main', value: 'uv run main' },
];
```

## Related Files

- `src/types/templates.ts` - Type definitions
- `src/components/CreateProjectModal.tsx` - Template selection
- `src/components/ImportProjectModal.tsx` - Import flow
- `src/components/ProjectCard.tsx` - Template display
