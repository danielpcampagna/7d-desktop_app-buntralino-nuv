import { create } from 'zustand';
import {
  Dataset,
  DatasetProfiling,
  DataCleanupOperation,
  GeneratedPipeline,
  HypothesisStep,
  HypothesisETLTarget,
  HypothesisProjectState,
  HypothesisContentValue,
  RefinementMessage,
  MentionItem,
} from '@/types/hypothesis';

interface HypothesisStore {
  // State per project (keyed by projectId)
  projects: Record<string, HypothesisProjectState>;

  // Actions
  initializeProject: (projectId: string, targetTemplate: HypothesisETLTarget) => void;
  setCurrentStep: (projectId: string, step: HypothesisStep) => void;
  setTargetTemplate: (projectId: string, target: HypothesisETLTarget) => void;

  // Dataset management
  addDataset: (projectId: string, dataset: Dataset) => void;
  removeDataset: (projectId: string, datasetId: string) => void;
  setActiveDataset: (projectId: string, datasetId: string | null) => void;

  // Profiling
  setProfiling: (projectId: string, datasetId: string, profiling: DatasetProfiling) => void;

  // Cleanup operations
  addCleanupOperation: (projectId: string, operation: DataCleanupOperation) => void;
  updateCleanupStatus: (projectId: string, operationId: string, status: DataCleanupOperation['status']) => void;

  // Hypothesis content
  setHypothesisContent: (projectId: string, content: HypothesisContentValue, plainText: string) => void;

  // Pipeline generation
  setGeneratedPipeline: (projectId: string, pipeline: GeneratedPipeline) => void;
  updatePipelineCode: (projectId: string, code: string) => void;
  addRefinementMessage: (projectId: string, message: RefinementMessage) => void;
  finalizePipeline: (projectId: string) => void;
  setIsGenerating: (projectId: string, isGenerating: boolean) => void;

  // Helpers
  getProject: (projectId: string) => HypothesisProjectState | undefined;
  getMentionItems: (projectId: string) => MentionItem[];
  canProceedToStep: (projectId: string, step: HypothesisStep) => boolean;
  removeHypothesisProject: (projectId: string) => void;
}

const createInitialProjectState = (projectId: string, targetTemplate: HypothesisETLTarget): HypothesisProjectState => ({
  projectId,
  currentStep: 'datasets',
  targetTemplate,
  datasets: [],
  profilings: {},
  cleanupOperations: [],
  hypothesisContent: null,
  hypothesisPlainText: '',
  generatedPipeline: null,
  isGenerating: false,
  activeDatasetId: null,
});

// Mock initial data for demo project
const mockDatasets: Dataset[] = [
  {
    id: 'ds1',
    projectId: 'p5',
    name: 'customers',
    fileName: 'customers.csv',
    fileSize: 1024 * 150, // 150KB
    fileType: 'csv',
    columns: [
      { name: 'customer_id', type: 'string', nullable: false, sampleValues: ['C001', 'C002'] },
      { name: 'name', type: 'string', nullable: false, sampleValues: ['John Doe', 'Jane Smith'] },
      { name: 'email', type: 'string', nullable: true, sampleValues: ['john@email.com'] },
      { name: 'signup_date', type: 'date', nullable: false, sampleValues: ['2024-01-15'] },
    ],
    rowCount: 5000,
    uploadedAt: new Date(),
  },
  {
    id: 'ds2',
    projectId: 'p5',
    name: 'orders',
    fileName: 'orders.csv',
    fileSize: 1024 * 500, // 500KB
    fileType: 'csv',
    columns: [
      { name: 'order_id', type: 'string', nullable: false, sampleValues: ['ORD-001', 'ORD-002'] },
      { name: 'customer_id', type: 'string', nullable: false, sampleValues: ['C001', 'C002'] },
      { name: 'total_amount', type: 'number', nullable: false, sampleValues: ['99.99', '149.99'] },
      { name: 'order_date', type: 'date', nullable: false, sampleValues: ['2024-01-20'] },
    ],
    rowCount: 15000,
    uploadedAt: new Date(),
  },
];

const mockProfilings: Record<string, DatasetProfiling> = {
  ds1: {
    datasetId: 'ds1',
    generatedAt: new Date(),
    overview: {
      rowCount: 5000,
      columnCount: 4,
      duplicateRows: 12,
      missingCells: 150,
      missingCellsPercentage: 0.75,
      memorySize: '1.2 MB',
    },
    columns: [
      { name: 'customer_id', type: 'string', distinctCount: 5000, distinctPercentage: 100, missingCount: 0, missingPercentage: 0, topValues: [{ value: 'C001', count: 1, percentage: 0.02 }] },
      { name: 'name', type: 'string', distinctCount: 4850, distinctPercentage: 97, missingCount: 0, missingPercentage: 0, topValues: [{ value: 'John Doe', count: 3, percentage: 0.06 }] },
      { name: 'email', type: 'string', distinctCount: 4500, distinctPercentage: 90, missingCount: 150, missingPercentage: 3, topValues: [{ value: 'john@email.com', count: 1, percentage: 0.02 }] },
      { name: 'signup_date', type: 'date', distinctCount: 365, distinctPercentage: 7.3, missingCount: 0, missingPercentage: 0, topValues: [{ value: '2024-01-15', count: 20, percentage: 0.4 }] },
    ],
    warnings: [{ type: 'high_missing', column: 'email', message: 'Column "email" has 3% missing values', severity: 'info' }],
  },
  ds2: {
    datasetId: 'ds2',
    generatedAt: new Date(),
    overview: {
      rowCount: 15000,
      columnCount: 4,
      duplicateRows: 0,
      missingCells: 0,
      missingCellsPercentage: 0,
      memorySize: '3.5 MB',
    },
    columns: [
      { name: 'order_id', type: 'string', distinctCount: 15000, distinctPercentage: 100, missingCount: 0, missingPercentage: 0, topValues: [{ value: 'ORD-001', count: 1, percentage: 0.01 }] },
      { name: 'customer_id', type: 'string', distinctCount: 4500, distinctPercentage: 30, missingCount: 0, missingPercentage: 0, topValues: [{ value: 'C001', count: 5, percentage: 0.03 }] },
      { name: 'total_amount', type: 'number', distinctCount: 8500, distinctPercentage: 56.7, missingCount: 0, missingPercentage: 0, mean: 125.50, std: 45.30, min: 10, max: 500, median: 110, topValues: [{ value: '99.99', count: 150, percentage: 1 }] },
      { name: 'order_date', type: 'date', distinctCount: 365, distinctPercentage: 2.4, missingCount: 0, missingPercentage: 0, topValues: [{ value: '2024-01-20', count: 50, percentage: 0.33 }] },
    ],
    warnings: [],
  },
};

// Pre-initialize the demo project
const initialProjects: Record<string, HypothesisProjectState> = {
  p5: {
    projectId: 'p5',
    currentStep: 'datasets',
    targetTemplate: 'dagster',
    datasets: mockDatasets,
    profilings: mockProfilings,
    cleanupOperations: [],
    hypothesisContent: null,
    hypothesisPlainText: '',
    generatedPipeline: null,
    isGenerating: false,
    activeDatasetId: 'ds1',
  },
};

export const useHypothesisStore = create<HypothesisStore>((set, get) => ({
  projects: initialProjects,

  initializeProject: (projectId, targetTemplate) => {
    set((state) => {
      if (state.projects[projectId]) {
        return state; // Already initialized
      }
      return {
        projects: {
          ...state.projects,
          [projectId]: createInitialProjectState(projectId, targetTemplate),
        },
      };
    });
  },

  setCurrentStep: (projectId, step) => {
    set((state) => {
      const project = state.projects[projectId];
      if (!project) return state;
      return {
        projects: {
          ...state.projects,
          [projectId]: { ...project, currentStep: step },
        },
      };
    });
  },

  setTargetTemplate: (projectId, target) => {
    set((state) => {
      const project = state.projects[projectId];
      if (!project) return state;
      return {
        projects: {
          ...state.projects,
          [projectId]: { ...project, targetTemplate: target },
        },
      };
    });
  },

  addDataset: (projectId, dataset) => {
    set((state) => {
      const project = state.projects[projectId];
      if (!project) return state;
      return {
        projects: {
          ...state.projects,
          [projectId]: {
            ...project,
            datasets: [...project.datasets, dataset],
            activeDatasetId: project.activeDatasetId ?? dataset.id,
          },
        },
      };
    });
  },

  removeDataset: (projectId, datasetId) => {
    set((state) => {
      const project = state.projects[projectId];
      if (!project) return state;
      const newDatasets = project.datasets.filter((d) => d.id !== datasetId);
      const { [datasetId]: _, ...newProfilings } = project.profilings;
      return {
        projects: {
          ...state.projects,
          [projectId]: {
            ...project,
            datasets: newDatasets,
            profilings: newProfilings,
            activeDatasetId:
              project.activeDatasetId === datasetId
                ? newDatasets[0]?.id ?? null
                : project.activeDatasetId,
          },
        },
      };
    });
  },

  setActiveDataset: (projectId, datasetId) => {
    set((state) => {
      const project = state.projects[projectId];
      if (!project) return state;
      return {
        projects: {
          ...state.projects,
          [projectId]: { ...project, activeDatasetId: datasetId },
        },
      };
    });
  },

  setProfiling: (projectId, datasetId, profiling) => {
    set((state) => {
      const project = state.projects[projectId];
      if (!project) return state;
      return {
        projects: {
          ...state.projects,
          [projectId]: {
            ...project,
            profilings: { ...project.profilings, [datasetId]: profiling },
          },
        },
      };
    });
  },

  addCleanupOperation: (projectId, operation) => {
    set((state) => {
      const project = state.projects[projectId];
      if (!project) return state;
      return {
        projects: {
          ...state.projects,
          [projectId]: {
            ...project,
            cleanupOperations: [...project.cleanupOperations, operation],
          },
        },
      };
    });
  },

  updateCleanupStatus: (projectId, operationId, status) => {
    set((state) => {
      const project = state.projects[projectId];
      if (!project) return state;
      return {
        projects: {
          ...state.projects,
          [projectId]: {
            ...project,
            cleanupOperations: project.cleanupOperations.map((op) =>
              op.id === operationId ? { ...op, status } : op
            ),
          },
        },
      };
    });
  },

  setHypothesisContent: (projectId, content, plainText) => {
    set((state) => {
      const project = state.projects[projectId];
      if (!project) return state;
      return {
        projects: {
          ...state.projects,
          [projectId]: {
            ...project,
            hypothesisContent: content,
            hypothesisPlainText: plainText,
          },
        },
      };
    });
  },

  setGeneratedPipeline: (projectId, pipeline) => {
    set((state) => {
      const project = state.projects[projectId];
      if (!project) return state;
      return {
        projects: {
          ...state.projects,
          [projectId]: { ...project, generatedPipeline: pipeline },
        },
      };
    });
  },

  updatePipelineCode: (projectId, code) => {
    set((state) => {
      const project = state.projects[projectId];
      if (!project || !project.generatedPipeline) return state;
      return {
        projects: {
          ...state.projects,
          [projectId]: {
            ...project,
            generatedPipeline: {
              ...project.generatedPipeline,
              code,
              version: project.generatedPipeline.version + 1,
            },
          },
        },
      };
    });
  },

  addRefinementMessage: (projectId, message) => {
    set((state) => {
      const project = state.projects[projectId];
      if (!project || !project.generatedPipeline) return state;
      return {
        projects: {
          ...state.projects,
          [projectId]: {
            ...project,
            generatedPipeline: {
              ...project.generatedPipeline,
              refinementHistory: [...project.generatedPipeline.refinementHistory, message],
              status: 'refining',
            },
          },
        },
      };
    });
  },

  finalizePipeline: (projectId) => {
    set((state) => {
      const project = state.projects[projectId];
      if (!project || !project.generatedPipeline) return state;
      return {
        projects: {
          ...state.projects,
          [projectId]: {
            ...project,
            generatedPipeline: {
              ...project.generatedPipeline,
              status: 'finalized',
            },
          },
        },
      };
    });
  },

  setIsGenerating: (projectId, isGenerating) => {
    set((state) => {
      const project = state.projects[projectId];
      if (!project) return state;
      return {
        projects: {
          ...state.projects,
          [projectId]: { ...project, isGenerating },
        },
      };
    });
  },

  getProject: (projectId) => {
    return get().projects[projectId];
  },

  getMentionItems: (projectId) => {
    const project = get().projects[projectId];
    if (!project) return [];

    const items: MentionItem[] = [];

    for (const dataset of project.datasets) {
      // Add dataset mention
      items.push({
        id: `dataset-${dataset.id}`,
        type: 'dataset',
        label: dataset.name,
        datasetId: dataset.id,
      });

      // Add column mentions
      for (const column of dataset.columns) {
        items.push({
          id: `column-${dataset.id}-${column.name}`,
          type: 'column',
          label: `${dataset.name}.${column.name}`,
          datasetId: dataset.id,
          columnName: column.name,
        });
      }
    }

    return items;
  },

  canProceedToStep: (projectId, step) => {
    const project = get().projects[projectId];
    if (!project) return false;

    switch (step) {
      case 'datasets':
        return true;
      case 'profiling':
        return project.datasets.length > 0;
      case 'hypothesis':
        return (
          project.datasets.length > 0 &&
          project.datasets.every((d) => project.profilings[d.id])
        );
      case 'review':
        return project.hypothesisPlainText.trim().length > 0;
      default:
        return false;
    }
  },

  removeHypothesisProject: (projectId) => {
    set((state) => {
      const { [projectId]: _, ...rest } = state.projects;
      return { projects: rest };
    });
  },
}));
