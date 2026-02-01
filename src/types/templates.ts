import { LucideIcon, Package, Zap, GitBranch, Workflow, FileCode, Wind, Wrench, FolderGit2, Box, FlaskConical } from 'lucide-react';

export type ProjectTemplate = 
  | 'python-package'
  | 'fastapi'
  | 'dagster'
  | 'prefect'
  | 'dagu'
  | 'airflow'
  | 'optilogic-utilities'
  | 'uv-python' // Generic UV Python project
  | 'hypothesis-spec'; // Hypothesis-driven ETL creation

export type TemplateCategory = 'library' | 'api' | 'etl' | 'utilities' | 'generic' | 'hypothesis';

export interface TemplateConfig {
  id: ProjectTemplate;
  name: string;
  description: string;
  icon: LucideIcon;
  category: TemplateCategory;
  supportsVisualEditor: boolean;
  defaultFiles: string[];
}

export const TEMPLATE_CONFIGS: TemplateConfig[] = [
  {
    id: 'python-package',
    name: 'Python Package',
    description: 'Reusable Python library that can be imported by other projects in the workspace',
    icon: Package,
    category: 'library',
    supportsVisualEditor: false,
    defaultFiles: ['src/__init__.py', 'pyproject.toml', 'README.md'],
  },
  {
    id: 'fastapi',
    name: 'FastAPI',
    description: 'Modern, high-performance Python REST API with automatic OpenAPI documentation',
    icon: Zap,
    category: 'api',
    supportsVisualEditor: false,
    defaultFiles: ['app/main.py', 'app/routers/__init__.py', 'requirements.txt'],
  },
  {
    id: 'dagster',
    name: 'Dagster ETL',
    description: 'Data orchestration platform with assets, schedules, and integrated lineage',
    icon: GitBranch,
    category: 'etl',
    supportsVisualEditor: true,
    defaultFiles: ['definitions.py', 'assets.py', 'pyproject.toml'],
  },
  {
    id: 'prefect',
    name: 'Prefect ETL',
    description: 'Workflow orchestration with flows and tasks for production-grade data pipelines',
    icon: Workflow,
    category: 'etl',
    supportsVisualEditor: true,
    defaultFiles: ['flows/main.py', 'tasks/__init__.py', 'requirements.txt'],
  },
  {
    id: 'dagu',
    name: 'Dagu ETL',
    description: 'Lightweight YAML-based workflow engine for orchestrating command execution',
    icon: FileCode,
    category: 'etl',
    supportsVisualEditor: true,
    defaultFiles: ['workflows/main.yaml', 'README.md'],
  },
  {
    id: 'airflow',
    name: 'Airflow ETL',
    description: 'Apache Airflow platform for programmatically authoring, scheduling, and monitoring workflows',
    icon: Wind,
    category: 'etl',
    supportsVisualEditor: true,
    defaultFiles: ['dags/main_dag.py', 'plugins/__init__.py', 'requirements.txt'],
  },
  {
    id: 'optilogic-utilities',
    name: 'Optilogic Utilities',
    description: 'Collection of utility scripts and tools for Optilogic platform integration',
    icon: Wrench,
    category: 'utilities',
    supportsVisualEditor: false,
    defaultFiles: ['src/__init__.py', 'src/utils.py', 'config.yaml', 'requirements.txt'],
  },
  {
    id: 'uv-python',
    name: 'UV Python Project',
    description: 'Generic Python project managed by UV with custom entry point configuration',
    icon: Box,
    category: 'generic',
    supportsVisualEditor: false,
    defaultFiles: ['src/main.py', 'pyproject.toml', 'README.md'],
  },
  {
    id: 'hypothesis-spec',
    name: 'Hypothesis Specification',
    description: 'Create ETL pipelines through natural language hypothesis. Upload datasets, analyze data, and describe your pipeline in plain English.',
    icon: FlaskConical,
    category: 'hypothesis',
    supportsVisualEditor: true,
    defaultFiles: [], // Files are generated based on target ETL tool
  },
];

export const getTemplateConfig = (templateId: ProjectTemplate): TemplateConfig | undefined => {
  return TEMPLATE_CONFIGS.find(config => config.id === templateId);
};

export const getTemplatesByCategory = (category: TemplateCategory): TemplateConfig[] => {
  return TEMPLATE_CONFIGS.filter(config => config.category === category);
};

// Get ETL templates that support workflow orchestration (for import targets)
export const getWorkflowOrchestrationTemplates = (): TemplateConfig[] => {
  return TEMPLATE_CONFIGS.filter(
    config => config.category === 'etl' && config.supportsVisualEditor
  );
};

export const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  library: 'Library',
  api: 'API',
  etl: 'ETL',
  utilities: 'Utilities',
  generic: 'Generic',
  hypothesis: 'Hypothesis',
};

export const CATEGORY_COLORS: Record<TemplateCategory, string> = {
  library: 'bg-blue-500/10 text-blue-400',
  api: 'bg-amber-500/10 text-amber-400',
  etl: 'bg-emerald-500/10 text-emerald-400',
  utilities: 'bg-purple-500/10 text-purple-400',
  generic: 'bg-gray-500/10 text-gray-400',
  hypothesis: 'bg-pink-500/10 text-pink-400',
};

// Import source types
export type ImportSource = 'data-guru' | 'uv-python' | 'python-package';

// Import mode determines the flow
export type ImportMode = 'convert' | 'direct';

export interface ImportSourceConfig {
  id: ImportSource;
  name: string;
  description: string;
  icon: LucideIcon;
  mode: ImportMode; // 'convert' requires target selection, 'direct' imports as-is
  targetTemplate?: ProjectTemplate; // For 'direct' mode, the template to use
  targetTemplates?: ProjectTemplate[]; // For 'convert' mode, available targets
  requiresEntryPoint?: boolean; // Whether user needs to specify entry point
  requiresRunCommand?: boolean; // Whether user needs to specify run command
  acceptsFolder?: boolean; // Whether this accepts folder upload instead of file
}

export const IMPORT_SOURCE_CONFIGS: ImportSourceConfig[] = [
  {
    id: 'data-guru',
    name: 'Data Guru Pipeline',
    description: 'Import and convert ETL pipelines from Data Guru format to your preferred workflow tool',
    icon: Workflow,
    mode: 'convert',
    targetTemplates: ['airflow', 'dagster', 'prefect', 'dagu'],
  },
  {
    id: 'uv-python',
    name: 'UV Python Project',
    description: 'Import an existing UV-managed Python project with custom entry point and run configuration',
    icon: FolderGit2,
    mode: 'direct',
    targetTemplate: 'uv-python',
    requiresEntryPoint: true,
    requiresRunCommand: true,
    acceptsFolder: true,
  },
  {
    id: 'python-package',
    name: 'Python Package',
    description: 'Import an existing Python package that can be used as a library by other projects',
    icon: Package,
    mode: 'direct',
    targetTemplate: 'python-package',
    acceptsFolder: true,
  },
];

export const getImportSourceConfig = (sourceId: ImportSource): ImportSourceConfig | undefined => {
  return IMPORT_SOURCE_CONFIGS.find(config => config.id === sourceId);
};

// Run command presets for UV Python projects
export const UV_RUN_COMMAND_PRESETS = [
  { label: 'Python script', command: 'uv run python {entryPoint}' },
  { label: 'Module', command: 'uv run python -m {module}' },
  { label: 'Custom', command: '' },
];
