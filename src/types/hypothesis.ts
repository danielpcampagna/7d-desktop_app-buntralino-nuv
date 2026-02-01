import { ProjectTemplate } from './templates';

// Simple content value type - can be replaced with YooptaContentValue later
// when Yoopta version compatibility is resolved
export type HypothesisContentValue = {
  text: string;
};

/**
 * Represents a dataset uploaded by the user for hypothesis specification
 */
export interface Dataset {
  id: string;
  projectId: string;
  name: string;
  fileName: string;
  fileSize: number;
  fileType: 'csv' | 'parquet' | 'json' | 'excel';
  columns: DatasetColumn[];
  rowCount: number;
  uploadedAt: Date;
}

/**
 * Column metadata extracted from a dataset
 */
export interface DatasetColumn {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  nullable: boolean;
  sampleValues: string[];
}

/**
 * Profiling statistics for a dataset (simulating ydata-profiling output)
 */
export interface DatasetProfiling {
  datasetId: string;
  generatedAt: Date;
  overview: {
    rowCount: number;
    columnCount: number;
    duplicateRows: number;
    missingCells: number;
    missingCellsPercentage: number;
    memorySize: string;
  };
  columns: ColumnProfiling[];
  correlations?: CorrelationMatrix;
  warnings: ProfilingWarning[];
}

/**
 * Detailed profiling for a single column
 */
export interface ColumnProfiling {
  name: string;
  type: string;
  distinctCount: number;
  distinctPercentage: number;
  missingCount: number;
  missingPercentage: number;
  mean?: number;
  std?: number;
  min?: number | string;
  max?: number | string;
  median?: number;
  histogram?: HistogramBucket[];
  topValues?: { value: string; count: number; percentage: number }[];
}

export interface HistogramBucket {
  range: string;
  count: number;
  percentage: number;
}

export interface CorrelationMatrix {
  columns: string[];
  values: number[][];
}

export interface ProfilingWarning {
  type: 'high_cardinality' | 'high_missing' | 'constant' | 'duplicates' | 'skewed';
  column?: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
}

/**
 * ETL target options for hypothesis specification
 */
export type HypothesisETLTarget = Extract<ProjectTemplate, 'dagster' | 'prefect' | 'dagu' | 'airflow'>;

/**
 * A message in the refinement chat
 */
export interface RefinementMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  codeSnapshot?: string; // The code state after this message
}

/**
 * Represents the generated ETL pipeline
 */
export interface GeneratedPipeline {
  id: string;
  projectId: string;
  targetTemplate: HypothesisETLTarget;
  code: string;
  version: number;
  generatedAt: Date;
  hypothesisSnapshot: string; // Plain text version of hypothesis at generation time
  refinementHistory: RefinementMessage[];
  status: 'draft' | 'refining' | 'finalized';
}

/**
 * Cleanup operation applied to a dataset
 */
export interface DataCleanupOperation {
  id: string;
  datasetId: string;
  description: string;
  code: string;
  appliedAt: Date;
  status: 'pending' | 'applied' | 'rejected';
}

/**
 * The current step in the hypothesis specification flow
 */
export type HypothesisStep = 
  | 'datasets'      // Step 1: Upload datasets
  | 'profiling'     // Step 2: View profiling for each dataset
  | 'hypothesis'    // Step 3: Write hypothesis in natural language
  | 'review';       // Step 4: Review and refine generated code

/**
 * State for a hypothesis specification project
 */
export interface HypothesisProjectState {
  projectId: string;
  currentStep: HypothesisStep;
  targetTemplate: HypothesisETLTarget;
  datasets: Dataset[];
  profilings: Record<string, DatasetProfiling>;
  cleanupOperations: DataCleanupOperation[];
  hypothesisContent: HypothesisContentValue | null;
  hypothesisPlainText: string;
  generatedPipeline: GeneratedPipeline | null;
  isGenerating: boolean;
  activeDatasetId: string | null; // For profiling view navigation
}

/**
 * Mention item for @ references in hypothesis editor
 */
export interface MentionItem {
  id: string;
  type: 'dataset' | 'column';
  label: string;
  datasetId: string;
  columnName?: string;
}
