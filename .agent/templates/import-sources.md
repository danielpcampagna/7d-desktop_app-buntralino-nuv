# Import Sources Reference

## Overview

The import system allows users to bring existing projects into 7D GenAI UI. Import sources define where projects come from and how they should be processed.

## Import Modes

| Mode | Description | Target Selection |
|------|-------------|------------------|
| `convert` | Transform source format to target format | User selects target |
| `direct` | Import as-is with source's native format | Automatic |

## Import Sources

### 1. Data Guru

| Property | Value |
|----------|-------|
| ID | `data-guru` |
| Mode | Convert |
| File Extensions | `.dg`, `.json` |
| Target Templates | Airflow, Dagster, Prefect, Dagu |

**Description**: Import ETL pipelines from Data Guru format and convert to any supported workflow orchestration tool.

**Import Flow**:
1. Select "Data Guru" source
2. Upload `.dg` or `.json` file (drag & drop supported)
3. Choose target platform (Airflow, Dagster, Prefect, or Dagu)
4. Enter project details
5. Project is created with converted pipeline

**Use Cases**:
- Migrating from Data Guru to modern ETL tools
- Converting legacy pipelines
- Multi-tool deployment from single source

---

### 2. UV Python Project

| Property | Value |
|----------|-------|
| ID | `uv-python` |
| Mode | Direct |
| Accepts | Folder path |
| Target Template | `uv-python` |
| Requires Entry Point | Yes |
| Requires Run Command | Yes |

**Description**: Import an existing UV-managed Python project by specifying its location and configuration.

**Import Flow**:
1. Select "UV Python Project" source
2. Enter folder path to existing project
3. Configure:
   - Entry point (e.g., `src/main.py`)
   - Run command (e.g., `uv run python src/main.py`)
4. Enter project details
5. Project is imported

**Run Command Presets**:
```typescript
export const UV_RUN_COMMAND_PRESETS = [
  { label: 'uv run python', value: 'uv run python' },
  { label: 'uv run pytest', value: 'uv run pytest' },
  { label: 'uv run main', value: 'uv run main' },
];
```

---

### 3. Python Package

| Property | Value |
|----------|-------|
| ID | `python-package` |
| Mode | Direct |
| Accepts | Folder path |
| Target Template | `python-package` |
| Requires Entry Point | No |
| Requires Run Command | No |

**Description**: Import an existing Python package project.

**Import Flow**:
1. Select "Python Package" source
2. Enter folder path to existing package
3. Enter project details
4. Project is imported

---

## Import Source Configuration

```typescript
interface ImportSourceConfig {
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

## Import Data Interface

Data passed when importing a project:

```typescript
interface ImportProjectData {
  name: string;
  description: string;
  pythonVersion: string;
  
  // Source information
  importSource: ImportSource;
  sourceFile?: File;          // For file uploads
  projectPath?: string;       // For folder imports
  
  // Target (for convert mode)
  targetTemplate: ProjectTemplate;
  
  // Configuration (for UV Python)
  entryPoint?: string;
  runCommand?: string;
}
```

## Import Modal Steps

### Convert Mode (Data Guru)
```
source → location (file upload) → target → details
```

### Direct Mode with Config (UV Python)
```
source → location (folder path) → config → details
```

### Direct Mode Simple (Python Package)
```
source → location (folder path) → details
```

## Dynamic Step Generation

```typescript
const steps = useMemo(() => {
  const baseSteps: string[] = ['source', 'location'];
  
  if (sourceConfig?.mode === 'convert') {
    baseSteps.push('target');
  }
  
  if (sourceConfig?.requiresEntryPoint || sourceConfig?.requiresRunCommand) {
    baseSteps.push('config');
  }
  
  baseSteps.push('details');
  return baseSteps;
}, [sourceConfig]);
```

## Adding New Import Sources

To add a new import source:

1. Add to `ImportSource` type
2. Add configuration to `IMPORT_SOURCE_CONFIGS`
3. Update modal logic if new step patterns needed

Example:

```typescript
// 1. Add to type
export type ImportSource = 
  | 'data-guru'
  | 'uv-python'
  | 'python-package'
  | 'github-repo';  // New source

// 2. Add config
export const IMPORT_SOURCE_CONFIGS: ImportSourceConfig[] = [
  // ...existing sources
  {
    id: 'github-repo',
    name: 'GitHub Repository',
    description: 'Import from a GitHub repository URL',
    icon: Github,
    mode: 'direct',
    targetTemplate: 'uv-python',
    requiresEntryPoint: true,
  },
];
```

## Related Files

- `src/types/templates.ts` - Import source type definitions
- `src/components/ImportProjectModal.tsx` - Import modal UI
- `src/pages/WorkspacePage.tsx` - Import button and handler
