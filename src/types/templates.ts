import { LucideIcon, Package, Zap, GitBranch, Workflow, FileCode } from 'lucide-react';

export type ProjectTemplate = 
  | 'python-package'
  | 'fastapi'
  | 'dagster'
  | 'prefect'
  | 'dagu';

export type TemplateCategory = 'library' | 'api' | 'etl';

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
];

export const getTemplateConfig = (templateId: ProjectTemplate): TemplateConfig | undefined => {
  return TEMPLATE_CONFIGS.find(config => config.id === templateId);
};

export const getTemplatesByCategory = (category: TemplateCategory): TemplateConfig[] => {
  return TEMPLATE_CONFIGS.filter(config => config.category === category);
};

export const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  library: 'Library',
  api: 'API',
  etl: 'ETL',
};

export const CATEGORY_COLORS: Record<TemplateCategory, string> = {
  library: 'bg-blue-500/10 text-blue-400',
  api: 'bg-amber-500/10 text-amber-400',
  etl: 'bg-emerald-500/10 text-emerald-400',
};
