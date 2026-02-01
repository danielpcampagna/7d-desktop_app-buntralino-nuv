# Template System Overview

## Purpose

The template system provides pre-configured project scaffolding for common Python project types. Users select a template when creating a new project, and the system will generate the appropriate project structure.

## Design Principles

1. **Categorized Templates** - Templates are grouped by purpose (library, api, etl, etc.)
2. **Visual Editor Flag** - Only ETL templates support visual DAG editing
3. **Extensible** - New templates can be added to `TEMPLATE_CONFIGS`
4. **Static Configuration** - Templates are defined in code, not fetched from API

## Template Categories

| Category | Purpose | Visual Editor |
|----------|---------|---------------|
| `library` | Reusable Python packages | No |
| `api` | Web APIs and services | No |
| `etl` | Data pipeline projects | Yes |
| `utilities` | Helper and utility projects | No |
| `generic` | General-purpose Python projects | No |

## How Templates Work

### Project Creation Flow

```
User clicks "New Project"
        │
        ▼
CreateProjectModal opens
        │
        ▼
Step 1: User browses templates by category
        │
        ▼
User selects a template (e.g., "Dagster ETL")
        │
        ▼
Step 2: User enters project details
        │
        ▼
Project created with:
  - template: 'dagster'
  - supportsVisualEditor: true (from template config)
```

### Template Configuration

Each template is defined with:

```typescript
interface TemplateConfig {
  id: ProjectTemplate;           // Unique identifier
  name: string;                  // Display name
  description: string;           // Short description
  icon: LucideIcon;              // Icon component
  category: TemplateCategory;    // Category for grouping
  supportsVisualEditor: boolean; // Enable visual DAG editing
  defaultFiles?: string[];       // Files to scaffold (planned)
}
```

## Template Selection UI

Templates are displayed in a grid with:
- Icon for quick visual identification
- Name and description
- Category badge with color coding
- "Visual Editor" indicator for ETL templates
- Selected state with border highlight

## Category Styling

```typescript
const CATEGORY_LABELS = {
  library: 'Library',
  api: 'API',
  etl: 'ETL',
  utilities: 'Utilities',
  generic: 'Generic',
};

const CATEGORY_COLORS = {
  library: 'bg-blue-100 text-blue-800',
  api: 'bg-green-100 text-green-800',
  etl: 'bg-purple-100 text-purple-800',
  utilities: 'bg-orange-100 text-orange-800',
  generic: 'bg-gray-100 text-gray-800',
};
```

## Adding New Templates

To add a new template:

1. Add new value to `ProjectTemplate` type
2. Add category to `TemplateCategory` if needed
3. Add configuration to `TEMPLATE_CONFIGS` array
4. Update `CATEGORY_LABELS` and `CATEGORY_COLORS` if new category

Example:

```typescript
// In types/templates.ts

// 1. Add to type
export type ProjectTemplate = 
  | 'python-package'
  | 'my-new-template'  // Add here
  // ...

// 2. Add config
export const TEMPLATE_CONFIGS: TemplateConfig[] = [
  // ...existing templates
  {
    id: 'my-new-template',
    name: 'My New Template',
    description: 'Description of what this template creates',
    icon: SomeIcon,
    category: 'library',
    supportsVisualEditor: false,
    defaultFiles: ['src/main.py', 'pyproject.toml'],
  },
];
```

## Related Files

- `src/types/templates.ts` - Template type definitions and configs
- `src/components/CreateProjectModal.tsx` - Template selection UI
- `src/types/workspace.ts` - Project interface using templates
