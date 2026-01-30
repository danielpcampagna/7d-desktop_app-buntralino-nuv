import { LucideIcon, Package, Zap, GitBranch, Workflow, FileCode, Wind, Wrench } from 'lucide-react';

export type ProjectTemplate = 
  | 'python-package'
  | 'fastapi'
  | 'dagster'
  | 'prefect'
  | 'dagu'
  | 'airflow'
  | 'optilogic-utilities';

export type TemplateCategory = 'library' | 'api' | 'etl' | 'utilities';

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
};

export const CATEGORY_COLORS: Record<TemplateCategory, string> = {
  library: 'bg-blue-500/10 text-blue-400',
  api: 'bg-amber-500/10 text-amber-400',
  etl: 'bg-emerald-500/10 text-emerald-400',
  utilities: 'bg-purple-500/10 text-purple-400',
};

// Import source types
export type ImportSource = 'data-guru';

export interface ImportSourceConfig {
  id: ImportSource;
  name: string;
  description: string;
  fileExtensions: string[];
  targetTemplates: ProjectTemplate[];
}

export const IMPORT_SOURCE_CONFIGS: ImportSourceConfig[] = [
  {
    id: 'data-guru',
    name: 'Data Guru',
    description: 'Import ETL pipelines from Data Guru format',
    fileExtensions: ['.dg', '.dataguru', '.json'],
    targetTemplates: ['airflow', 'dagster', 'prefect', 'dagu'],
  },
];

export const getImportSourceConfig = (sourceId: ImportSource): ImportSourceConfig | undefined => {
  return IMPORT_SOURCE_CONFIGS.find(config => config.id === sourceId);
};
