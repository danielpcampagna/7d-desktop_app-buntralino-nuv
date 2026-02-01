import {
  Dataset,
  DatasetColumn,
  DatasetProfiling,
  ColumnProfiling,
  GeneratedPipeline,
  HypothesisETLTarget,
  RefinementMessage,
  ProfilingWarning,
  HypothesisProjectState,
  DataCleanupOperation,
} from '@/types/hypothesis';
import { Project } from '@/types/workspace';
import { getTemplateConfig } from '@/types/templates';

// Utility to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Generate a unique ID
const generateId = () => Math.random().toString(36).substring(2, 11);

/**
 * Parse a mock file and extract column information
 */
export const mockParseDataset = async (
  file: File,
  projectId: string
): Promise<Dataset> => {
  await delay(500 + Math.random() * 1000); // Simulate parsing time

  // Generate mock columns based on file name
  const mockColumns = generateMockColumns(file.name);

  return {
    id: generateId(),
    projectId,
    name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
    fileName: file.name,
    fileSize: file.size,
    fileType: getFileType(file.name),
    columns: mockColumns,
    rowCount: Math.floor(1000 + Math.random() * 50000),
    uploadedAt: new Date(),
  };
};

/**
 * Generate mock profiling data for a dataset
 */
export const mockGenerateProfiling = async (
  dataset: Dataset
): Promise<DatasetProfiling> => {
  await delay(1500 + Math.random() * 2000); // Simulate profiling time

  const columnProfilings: ColumnProfiling[] = dataset.columns.map((col) =>
    generateColumnProfiling(col, dataset.rowCount)
  );

  const warnings = generateProfilingWarnings(columnProfilings);

  const missingCells = columnProfilings.reduce((sum, c) => sum + c.missingCount, 0);
  const totalCells = dataset.rowCount * dataset.columns.length;

  return {
    datasetId: dataset.id,
    generatedAt: new Date(),
    overview: {
      rowCount: dataset.rowCount,
      columnCount: dataset.columns.length,
      duplicateRows: Math.floor(dataset.rowCount * (Math.random() * 0.05)),
      missingCells,
      missingCellsPercentage: (missingCells / totalCells) * 100,
      memorySize: formatBytes(dataset.fileSize * 2.5), // Approximate in-memory size
    },
    columns: columnProfilings,
    correlations: generateCorrelationMatrix(dataset.columns),
    warnings,
  };
};

/**
 * Generate cleanup code from a natural language prompt
 */
export const mockGenerateCleanupCode = async (
  prompt: string,
  dataset: Dataset
): Promise<string> => {
  await delay(1000 + Math.random() * 1500);

  const datasetVar = dataset.name.toLowerCase().replace(/[^a-z0-9]/g, '_');

  // Generate realistic-looking cleanup code based on common prompts
  if (prompt.toLowerCase().includes('null') || prompt.toLowerCase().includes('missing')) {
    return `import pandas as pd

# Load the dataset
df = pd.read_csv('${dataset.fileName}')

# Handle missing values
# Drop rows where critical columns have nulls
critical_columns = [${dataset.columns.slice(0, 3).map((c) => `'${c.name}'`).join(', ')}]
df_cleaned = df.dropna(subset=critical_columns)

# Fill remaining nulls with appropriate values
numeric_columns = df_cleaned.select_dtypes(include=['number']).columns
df_cleaned[numeric_columns] = df_cleaned[numeric_columns].fillna(df_cleaned[numeric_columns].median())

categorical_columns = df_cleaned.select_dtypes(include=['object']).columns
df_cleaned[categorical_columns] = df_cleaned[categorical_columns].fillna('Unknown')

print(f"Rows before: {len(df)}, Rows after: {len(df_cleaned)}")
df_cleaned.to_csv('${dataset.name}_cleaned.csv', index=False)
`;
  }

  if (prompt.toLowerCase().includes('duplicate')) {
    return `import pandas as pd

# Load the dataset
df = pd.read_csv('${dataset.fileName}')

# Remove duplicate rows
df_cleaned = df.drop_duplicates()

# Optionally, remove duplicates based on specific columns
# df_cleaned = df.drop_duplicates(subset=['${dataset.columns[0]?.name || 'id'}'])

print(f"Rows before: {len(df)}, Rows after: {len(df_cleaned)}")
print(f"Duplicates removed: {len(df) - len(df_cleaned)}")

df_cleaned.to_csv('${dataset.name}_cleaned.csv', index=False)
`;
  }

  // Generic cleanup
  return `import pandas as pd
import numpy as np

# Load the dataset
df = pd.read_csv('${dataset.fileName}')

# Basic data cleaning pipeline
def clean_${datasetVar}(df):
    """
    Clean the ${dataset.name} dataset based on: ${prompt}
    """
    # Remove duplicates
    df = df.drop_duplicates()
    
    # Handle missing values
    df = df.dropna(thresh=len(df.columns) * 0.5)  # Drop rows with >50% missing
    
    # Standardize string columns
    string_cols = df.select_dtypes(include=['object']).columns
    for col in string_cols:
        df[col] = df[col].str.strip().str.lower()
    
    # Remove outliers from numeric columns (IQR method)
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        df = df[(df[col] >= Q1 - 1.5 * IQR) & (df[col] <= Q3 + 1.5 * IQR)]
    
    return df

df_cleaned = clean_${datasetVar}(df)
print(f"Original rows: {len(df)}, Cleaned rows: {len(df_cleaned)}")
df_cleaned.to_csv('${dataset.name}_cleaned.csv', index=False)
`;
};

/**
 * Generate ETL pipeline code from hypothesis
 */
export const mockGeneratePipeline = async (
  hypothesis: string,
  datasets: Dataset[],
  targetTemplate: HypothesisETLTarget
): Promise<GeneratedPipeline> => {
  await delay(2000 + Math.random() * 2000);

  const code = generateETLCode(hypothesis, datasets, targetTemplate);

  return {
    id: generateId(),
    projectId: datasets[0]?.projectId || '',
    targetTemplate,
    code,
    version: 1,
    generatedAt: new Date(),
    hypothesisSnapshot: hypothesis,
    refinementHistory: [],
    status: 'draft',
  };
};

/**
 * Refine the generated code based on user feedback
 */
export const mockRefinePipeline = async (
  currentCode: string,
  feedback: string,
  datasets: Dataset[],
  targetTemplate: HypothesisETLTarget
): Promise<{ code: string; message: RefinementMessage }> => {
  await delay(1500 + Math.random() * 1500);

  // Simulate code refinement based on feedback
  let refinedCode = currentCode;
  let responseMessage = '';

  if (feedback.toLowerCase().includes('validation') || feedback.toLowerCase().includes('check')) {
    refinedCode = addValidationToCode(currentCode, targetTemplate);
    responseMessage = "I've added data validation checks to ensure data quality before processing. The pipeline now validates input schemas and checks for required columns.";
  } else if (feedback.toLowerCase().includes('log') || feedback.toLowerCase().includes('debug')) {
    refinedCode = addLoggingToCode(currentCode, targetTemplate);
    responseMessage = "I've enhanced the logging throughout the pipeline. You'll now see detailed progress updates and any issues will be logged for debugging.";
  } else if (feedback.toLowerCase().includes('error') || feedback.toLowerCase().includes('exception')) {
    refinedCode = addErrorHandlingToCode(currentCode, targetTemplate);
    responseMessage = "I've added comprehensive error handling with try-except blocks and graceful failure modes. The pipeline will now handle edge cases more robustly.";
  } else if (feedback.toLowerCase().includes('parallel') || feedback.toLowerCase().includes('performance')) {
    refinedCode = addParallelProcessingToCode(currentCode, targetTemplate);
    responseMessage = "I've optimized the pipeline for better performance with parallel processing where applicable. Tasks that can run concurrently are now executed in parallel.";
  } else {
    // Generic refinement
    refinedCode = currentCode + `\n\n# Refinement based on feedback: ${feedback}\n# TODO: Implement requested changes`;
    responseMessage = `I've noted your feedback: "${feedback}". I've added a placeholder for the requested changes. Would you like me to implement any specific modifications?`;
  }

  const message: RefinementMessage = {
    id: generateId(),
    role: 'assistant',
    content: responseMessage,
    timestamp: new Date(),
    codeSnapshot: refinedCode,
  };

  return { code: refinedCode, message };
};

/**
 * Build documentation markdown from hypothesis project state.
 * This content becomes docs/HYPOTHESIS.md in the new ETL project (mocked).
 */
function buildHypothesisDocContent(
  hypothesisProject: Project,
  state: HypothesisProjectState
): string {
  const lines: string[] = [
    `# Hypothesis Documentation: ${hypothesisProject.name}`,
    '',
    `*Generated from Hypothesis Specification on ${new Date().toISOString().split('T')[0]}*`,
    '',
    '---',
    '',
    '## 1. Datasets',
    '',
  ];

  for (const ds of state.datasets) {
    lines.push(`### ${ds.name}`);
    lines.push(`- **File:** \`${ds.fileName}\` (${ds.rowCount} rows, ${ds.columns.length} columns)`);
    lines.push(`- **Columns:** ${ds.columns.map((c) => c.name).join(', ')}`);
    lines.push('');
  }

  if (Object.keys(state.profilings).length > 0) {
    lines.push('## 2. Data Profiling Summary', '');
    for (const [datasetId, prof] of Object.entries(state.profilings)) {
      const ds = state.datasets.find((d) => d.id === datasetId);
      lines.push(`### ${ds?.name ?? datasetId}`);
      lines.push(`- Rows: ${prof.overview.rowCount}, Columns: ${prof.overview.columnCount}`);
      lines.push(`- Missing cells: ${prof.overview.missingCellsPercentage.toFixed(1)}%`);
      if (prof.warnings.length > 0) {
        lines.push('- **Warnings:**');
        prof.warnings.forEach((w) => lines.push(`  - ${w.message}`));
      }
      lines.push('');
    }
  }

  if (state.cleanupOperations.length > 0) {
    lines.push('## 3. Data Cleanup Operations', '');
    state.cleanupOperations.forEach((op: DataCleanupOperation, i: number) => {
      lines.push(`### ${i + 1}. ${op.description}`);
      lines.push(`- **Status:** ${op.status}`);
      lines.push('```python');
      lines.push(op.code);
      lines.push('```');
      lines.push('');
    });
  }

  lines.push('## 4. Hypothesis', '');
  lines.push(state.hypothesisPlainText || '(No hypothesis text)');
  lines.push('');

  if (state.generatedPipeline) {
    lines.push('## 5. Refinement History', '');
    state.generatedPipeline.refinementHistory.forEach((msg, i) => {
      lines.push(`### ${msg.role === 'user' ? 'User' : 'Assistant'} (${msg.timestamp.toLocaleString()})`);
      lines.push('');
      lines.push(msg.content);
      lines.push('');
    });
  }

  lines.push('---');
  lines.push('');
  lines.push(`*ETL Target: ${state.targetTemplate}*`);
  return lines.join('\n');
}

/**
 * Mock: Convert hypothesis project to ETL project.
 * Creates new ETL project, builds documentation from all hypothesis content,
 * returns the new project to add. Caller should then remove the hypothesis project
 * and clear hypothesis store state.
 */
export const mockFinalizeHypothesisToETL = async (
  workspaceId: string,
  hypothesisProject: Project,
  state: HypothesisProjectState
): Promise<{ newProject: Project; docContent: string }> => {
  await delay(800);

  const newProjectId = generateId();
  const docContent = buildHypothesisDocContent(hypothesisProject, state);
  const templateConfig = getTemplateConfig(state.targetTemplate);

  const newProject: Project = {
    id: newProjectId,
    name: hypothesisProject.name.replace(/\s*[-–—]\s*hypothesis$/i, '').trim() || hypothesisProject.name,
    description: `${hypothesisProject.description ?? 'ETL pipeline'} — Documentation from hypothesis specification is available in \`docs/HYPOTHESIS.md\`.`,
    workspaceId,
    createdAt: new Date(),
    lastModified: new Date(),
    pythonVersion: hypothesisProject.pythonVersion,
    status: 'idle',
    template: state.targetTemplate,
    supportsVisualEditor: templateConfig?.supportsVisualEditor ?? true,
  };

  return { newProject, docContent };
};

// Helper functions

function getFileType(fileName: string): Dataset['fileType'] {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'csv':
      return 'csv';
    case 'parquet':
      return 'parquet';
    case 'json':
      return 'json';
    case 'xlsx':
    case 'xls':
      return 'excel';
    default:
      return 'csv';
  }
}

function generateMockColumns(fileName: string): DatasetColumn[] {
  // Generate contextual columns based on file name hints
  const name = fileName.toLowerCase();
  
  if (name.includes('customer') || name.includes('user')) {
    return [
      { name: 'customer_id', type: 'string', nullable: false, sampleValues: ['C001', 'C002', 'C003'] },
      { name: 'name', type: 'string', nullable: false, sampleValues: ['John Doe', 'Jane Smith', 'Bob Wilson'] },
      { name: 'email', type: 'string', nullable: true, sampleValues: ['john@email.com', 'jane@email.com'] },
      { name: 'age', type: 'number', nullable: true, sampleValues: ['32', '28', '45'] },
      { name: 'signup_date', type: 'date', nullable: false, sampleValues: ['2024-01-15', '2024-02-20'] },
      { name: 'is_active', type: 'boolean', nullable: false, sampleValues: ['true', 'false'] },
    ];
  }

  if (name.includes('order') || name.includes('transaction') || name.includes('sales')) {
    return [
      { name: 'order_id', type: 'string', nullable: false, sampleValues: ['ORD-001', 'ORD-002'] },
      { name: 'customer_id', type: 'string', nullable: false, sampleValues: ['C001', 'C002'] },
      { name: 'product_id', type: 'string', nullable: false, sampleValues: ['P100', 'P200'] },
      { name: 'quantity', type: 'number', nullable: false, sampleValues: ['2', '5', '1'] },
      { name: 'unit_price', type: 'number', nullable: false, sampleValues: ['29.99', '49.99'] },
      { name: 'total_amount', type: 'number', nullable: false, sampleValues: ['59.98', '249.95'] },
      { name: 'order_date', type: 'date', nullable: false, sampleValues: ['2024-01-20', '2024-01-21'] },
      { name: 'status', type: 'string', nullable: false, sampleValues: ['completed', 'pending', 'shipped'] },
    ];
  }

  if (name.includes('product') || name.includes('inventory')) {
    return [
      { name: 'product_id', type: 'string', nullable: false, sampleValues: ['P100', 'P200', 'P300'] },
      { name: 'product_name', type: 'string', nullable: false, sampleValues: ['Widget A', 'Gadget B'] },
      { name: 'category', type: 'string', nullable: false, sampleValues: ['Electronics', 'Home'] },
      { name: 'price', type: 'number', nullable: false, sampleValues: ['29.99', '149.99'] },
      { name: 'stock_quantity', type: 'number', nullable: false, sampleValues: ['100', '50', '0'] },
      { name: 'supplier_id', type: 'string', nullable: true, sampleValues: ['SUP-01', 'SUP-02'] },
    ];
  }

  // Default generic columns
  return [
    { name: 'id', type: 'string', nullable: false, sampleValues: ['1', '2', '3'] },
    { name: 'name', type: 'string', nullable: false, sampleValues: ['Item A', 'Item B'] },
    { name: 'value', type: 'number', nullable: true, sampleValues: ['100', '200', '300'] },
    { name: 'category', type: 'string', nullable: true, sampleValues: ['Type 1', 'Type 2'] },
    { name: 'created_at', type: 'date', nullable: false, sampleValues: ['2024-01-01', '2024-01-02'] },
    { name: 'is_valid', type: 'boolean', nullable: false, sampleValues: ['true', 'false'] },
  ];
}

function generateColumnProfiling(col: DatasetColumn, rowCount: number): ColumnProfiling {
  const missingPercentage = col.nullable ? Math.random() * 15 : 0;
  const missingCount = Math.floor(rowCount * (missingPercentage / 100));
  const distinctCount = col.type === 'boolean' ? 2 : Math.floor(rowCount * (0.3 + Math.random() * 0.5));

  const profiling: ColumnProfiling = {
    name: col.name,
    type: col.type,
    distinctCount,
    distinctPercentage: (distinctCount / rowCount) * 100,
    missingCount,
    missingPercentage,
    topValues: col.sampleValues.map((v, i) => ({
      value: v,
      count: Math.floor(rowCount * (0.3 - i * 0.08)),
      percentage: 30 - i * 8,
    })),
  };

  // Add numeric-specific stats
  if (col.type === 'number') {
    profiling.mean = 50 + Math.random() * 100;
    profiling.std = 10 + Math.random() * 30;
    profiling.min = Math.floor(profiling.mean - profiling.std * 2);
    profiling.max = Math.floor(profiling.mean + profiling.std * 2);
    profiling.median = Math.floor(profiling.mean + (Math.random() - 0.5) * 10);
    profiling.histogram = generateHistogram(profiling.min, profiling.max, rowCount);
  }

  return profiling;
}

function generateHistogram(min: number, max: number, rowCount: number) {
  const buckets = 10;
  const range = max - min;
  const bucketSize = range / buckets;
  
  return Array.from({ length: buckets }, (_, i) => {
    const count = Math.floor(rowCount * (0.05 + Math.random() * 0.15));
    return {
      range: `${(min + i * bucketSize).toFixed(0)}-${(min + (i + 1) * bucketSize).toFixed(0)}`,
      count,
      percentage: (count / rowCount) * 100,
    };
  });
}

function generateCorrelationMatrix(columns: DatasetColumn[]) {
  const numericCols = columns.filter((c) => c.type === 'number').map((c) => c.name);
  if (numericCols.length < 2) return undefined;

  const values = numericCols.map((_, i) =>
    numericCols.map((_, j) => {
      if (i === j) return 1;
      return Math.round((Math.random() * 2 - 1) * 100) / 100;
    })
  );

  return { columns: numericCols, values };
}

function generateProfilingWarnings(columns: ColumnProfiling[]): ProfilingWarning[] {
  const warnings: ProfilingWarning[] = [];

  for (const col of columns) {
    if (col.missingPercentage > 10) {
      warnings.push({
        type: 'high_missing',
        column: col.name,
        message: `Column "${col.name}" has ${col.missingPercentage.toFixed(1)}% missing values`,
        severity: col.missingPercentage > 30 ? 'error' : 'warning',
      });
    }
    if (col.distinctPercentage > 95) {
      warnings.push({
        type: 'high_cardinality',
        column: col.name,
        message: `Column "${col.name}" has very high cardinality (${col.distinctPercentage.toFixed(1)}% unique)`,
        severity: 'info',
      });
    }
    if (col.distinctCount === 1) {
      warnings.push({
        type: 'constant',
        column: col.name,
        message: `Column "${col.name}" contains only one unique value`,
        severity: 'warning',
      });
    }
  }

  return warnings;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function generateETLCode(
  hypothesis: string,
  datasets: Dataset[],
  target: HypothesisETLTarget
): string {
  const datasetNames = datasets.map((d) => d.name).join(', ');

  switch (target) {
    case 'dagster':
      return generateDagsterCode(hypothesis, datasets);
    case 'prefect':
      return generatePrefectCode(hypothesis, datasets);
    case 'airflow':
      return generateAirflowCode(hypothesis, datasets);
    case 'dagu':
      return generateDaguCode(hypothesis, datasets);
    default:
      return `# ETL Pipeline for: ${datasetNames}\n# Hypothesis: ${hypothesis}`;
  }
}

function generateDagsterCode(hypothesis: string, datasets: Dataset[]): string {
  const assetNames = datasets.map((d) => d.name.toLowerCase().replace(/[^a-z0-9]/g, '_'));

  return `"""
ETL Pipeline generated from hypothesis specification.

Hypothesis:
${hypothesis}

Datasets: ${datasets.map((d) => d.name).join(', ')}
"""

from dagster import asset, AssetExecutionContext, Definitions
import pandas as pd


${assetNames
  .map(
    (name, i) => `@asset
def raw_${name}(context: AssetExecutionContext) -> pd.DataFrame:
    """Load raw ${datasets[i].name} data."""
    context.log.info("Loading ${datasets[i].name} from ${datasets[i].fileName}")
    df = pd.read_csv("data/${datasets[i].fileName}")
    context.log.info(f"Loaded {len(df)} rows")
    return df

`
  )
  .join('')}

@asset(deps=[${assetNames.map((n) => `raw_${n}`).join(', ')}])
def cleaned_data(context: AssetExecutionContext, ${assetNames.map((n) => `raw_${n}: pd.DataFrame`).join(', ')}) -> pd.DataFrame:
    """Clean and transform the data based on hypothesis."""
    context.log.info("Starting data cleaning process")
    
    # Combine datasets if multiple
    ${
      assetNames.length > 1
        ? `df = raw_${assetNames[0]}.merge(raw_${assetNames[1]}, how='outer')`
        : `df = raw_${assetNames[0]}.copy()`
    }
    
    # Remove duplicates
    df = df.drop_duplicates()
    
    # Handle missing values
    df = df.fillna(method='ffill').fillna(method='bfill')
    
    context.log.info(f"Cleaned data has {len(df)} rows")
    return df


@asset
def analysis_results(context: AssetExecutionContext, cleaned_data: pd.DataFrame) -> dict:
    """Perform analysis based on the hypothesis."""
    context.log.info("Performing analysis")
    
    results = {
        "row_count": len(cleaned_data),
        "column_count": len(cleaned_data.columns),
        "summary_stats": cleaned_data.describe().to_dict(),
    }
    
    context.log.info(f"Analysis complete: {results['row_count']} rows analyzed")
    return results


defs = Definitions(
    assets=[${assetNames.map((n) => `raw_${n}`).join(', ')}, cleaned_data, analysis_results],
)
`;
}

function generatePrefectCode(hypothesis: string, datasets: Dataset[]): string {
  return `"""
ETL Pipeline generated from hypothesis specification.

Hypothesis:
${hypothesis}

Datasets: ${datasets.map((d) => d.name).join(', ')}
"""

from prefect import flow, task
from prefect.logging import get_run_logger
import pandas as pd


${datasets
  .map(
    (d) => `@task(name="Load ${d.name}")
def load_${d.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}() -> pd.DataFrame:
    """Load ${d.name} from ${d.fileName}."""
    logger = get_run_logger()
    logger.info(f"Loading ${d.name}")
    df = pd.read_csv("data/${d.fileName}")
    logger.info(f"Loaded {len(df)} rows from ${d.fileName}")
    return df

`
  )
  .join('')}

@task(name="Clean Data")
def clean_data(${datasets.map((d) => `${d.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_df: pd.DataFrame`).join(', ')}) -> pd.DataFrame:
    """Clean and transform data based on hypothesis."""
    logger = get_run_logger()
    
    # Merge datasets
    ${
      datasets.length > 1
        ? `df = ${datasets[0].name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_df.merge(
        ${datasets[1].name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_df,
        how='outer'
    )`
        : `df = ${datasets[0].name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_df.copy()`
    }
    
    # Data cleaning steps
    df = df.drop_duplicates()
    df = df.dropna(thresh=len(df.columns) * 0.5)
    
    logger.info(f"Cleaned data: {len(df)} rows")
    return df


@task(name="Analyze Data")
def analyze_data(df: pd.DataFrame) -> dict:
    """Perform analysis based on hypothesis."""
    logger = get_run_logger()
    
    results = {
        "total_rows": len(df),
        "columns": list(df.columns),
        "summary": df.describe().to_dict(),
    }
    
    logger.info("Analysis complete")
    return results


@task(name="Save Results")
def save_results(df: pd.DataFrame, analysis: dict) -> str:
    """Save the processed data and analysis results."""
    logger = get_run_logger()
    
    output_path = "output/processed_data.csv"
    df.to_csv(output_path, index=False)
    logger.info(f"Saved processed data to {output_path}")
    
    return output_path


@flow(name="Hypothesis ETL Pipeline")
def hypothesis_pipeline():
    """Main ETL pipeline based on hypothesis specification."""
    
    # Load datasets
${datasets.map((d) => `    ${d.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_df = load_${d.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}()`).join('\n')}
    
    # Clean and transform
    cleaned_df = clean_data(${datasets.map((d) => `${d.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_df`).join(', ')})
    
    # Analyze
    analysis = analyze_data(cleaned_df)
    
    # Save
    output_path = save_results(cleaned_df, analysis)
    
    return {"output_path": output_path, "analysis": analysis}


if __name__ == "__main__":
    hypothesis_pipeline()
`;
}

function generateAirflowCode(hypothesis: string, datasets: Dataset[]): string {
  return `"""
ETL Pipeline generated from hypothesis specification.

Hypothesis:
${hypothesis}

Datasets: ${datasets.map((d) => d.name).join(', ')}
"""

from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.utils.dates import days_ago
import pandas as pd


default_args = {
    'owner': 'hypothesis_spec',
    'depends_on_past': False,
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

dag = DAG(
    'hypothesis_etl_pipeline',
    default_args=default_args,
    description='ETL pipeline generated from hypothesis specification',
    schedule_interval=timedelta(days=1),
    start_date=days_ago(1),
    catchup=False,
    tags=['hypothesis', 'etl'],
)


${datasets
  .map(
    (d) => `def load_${d.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}(**context):
    """Load ${d.name} from ${d.fileName}."""
    df = pd.read_csv("data/${d.fileName}")
    print(f"Loaded {len(df)} rows from ${d.fileName}")
    context['ti'].xcom_push(key='${d.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_df', value=df.to_json())
    return len(df)

`
  )
  .join('')}

def clean_and_transform(**context):
    """Clean and transform data based on hypothesis."""
    ti = context['ti']
    
    # Pull data from previous tasks
${datasets
  .map(
    (d) => `    ${d.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_json = ti.xcom_pull(key='${d.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_df')
    ${d.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_df = pd.read_json(${d.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_json)`
  )
  .join('\n')}
    
    # Merge and clean
    ${
      datasets.length > 1
        ? `df = ${datasets[0].name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_df.merge(${datasets[1].name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_df, how='outer')`
        : `df = ${datasets[0].name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_df.copy()`
    }
    df = df.drop_duplicates()
    df = df.dropna(thresh=len(df.columns) * 0.5)
    
    print(f"Cleaned data: {len(df)} rows")
    ti.xcom_push(key='cleaned_df', value=df.to_json())
    return len(df)


def analyze_and_save(**context):
    """Perform analysis and save results."""
    ti = context['ti']
    cleaned_json = ti.xcom_pull(key='cleaned_df')
    df = pd.read_json(cleaned_json)
    
    # Save processed data
    output_path = "output/processed_data.csv"
    df.to_csv(output_path, index=False)
    print(f"Saved processed data to {output_path}")
    
    return {"rows": len(df), "output_path": output_path}


# Define tasks
${datasets
  .map(
    (d, i) => `load_${d.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_task = PythonOperator(
    task_id='load_${d.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}',
    python_callable=load_${d.name.toLowerCase().replace(/[^a-z0-9]/g, '_')},
    dag=dag,
)

`
  )
  .join('')}

clean_transform_task = PythonOperator(
    task_id='clean_and_transform',
    python_callable=clean_and_transform,
    dag=dag,
)

analyze_save_task = PythonOperator(
    task_id='analyze_and_save',
    python_callable=analyze_and_save,
    dag=dag,
)

# Set dependencies
[${datasets.map((d) => `load_${d.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_task`).join(', ')}] >> clean_transform_task >> analyze_save_task
`;
}

function generateDaguCode(hypothesis: string, datasets: Dataset[]): string {
  return `# ETL Pipeline generated from hypothesis specification
# 
# Hypothesis:
# ${hypothesis}
#
# Datasets: ${datasets.map((d) => d.name).join(', ')}

name: hypothesis_etl_pipeline
description: ETL pipeline generated from natural language hypothesis

env:
  - DATA_DIR: ./data
  - OUTPUT_DIR: ./output

steps:
${datasets
  .map(
    (d, i) => `  - name: load_${d.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}
    command: python scripts/load_data.py
    params: --input \${DATA_DIR}/${d.fileName} --output \${OUTPUT_DIR}/${d.name.toLowerCase()}_raw.parquet
    description: Load ${d.name} dataset

`
  )
  .join('')}
  - name: clean_and_transform
    command: python scripts/clean_data.py
    params: --input-dir \${OUTPUT_DIR} --output \${OUTPUT_DIR}/cleaned_data.parquet
    depends:
${datasets.map((d) => `      - load_${d.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`).join('\n')}
    description: Clean and transform data based on hypothesis

  - name: analyze
    command: python scripts/analyze.py
    params: --input \${OUTPUT_DIR}/cleaned_data.parquet --output \${OUTPUT_DIR}/analysis_results.json
    depends:
      - clean_and_transform
    description: Perform analysis

  - name: generate_report
    command: python scripts/report.py
    params: --input \${OUTPUT_DIR}/analysis_results.json --output \${OUTPUT_DIR}/report.html
    depends:
      - analyze
    description: Generate final report

mailOn:
  failure: true
  success: false
`;
}

function addValidationToCode(code: string, target: HypothesisETLTarget): string {
  const validationCode = `
# Data Validation
def validate_dataframe(df: pd.DataFrame, name: str):
    """Validate input data quality."""
    if df.empty:
        raise ValueError(f"Dataset {name} is empty")
    
    # Check for required columns
    required_columns = df.columns.tolist()[:3]  # First 3 columns as required
    missing = set(required_columns) - set(df.columns)
    if missing:
        raise ValueError(f"Missing required columns in {name}: {missing}")
    
    # Check for excessive nulls
    null_pct = df.isnull().sum().sum() / (len(df) * len(df.columns)) * 100
    if null_pct > 50:
        raise ValueError(f"Dataset {name} has {null_pct:.1f}% null values")
    
    print(f"Validation passed for {name}: {len(df)} rows, {len(df.columns)} columns")
    return True

`;

  // Insert validation after imports
  const importEnd = code.indexOf('\n\n', code.indexOf('import'));
  if (importEnd > 0) {
    return code.slice(0, importEnd) + '\n' + validationCode + code.slice(importEnd);
  }
  return validationCode + code;
}

function addLoggingToCode(code: string, target: HypothesisETLTarget): string {
  const loggingSetup = `
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('hypothesis_pipeline')

`;

  const importEnd = code.indexOf('\n\n', code.indexOf('import'));
  if (importEnd > 0) {
    return code.slice(0, importEnd) + '\n' + loggingSetup + code.slice(importEnd);
  }
  return loggingSetup + code;
}

function addErrorHandlingToCode(code: string, target: HypothesisETLTarget): string {
  const errorHandler = `
# Error handling decorator
def handle_errors(func):
    """Decorator for comprehensive error handling."""
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except FileNotFoundError as e:
            print(f"File not found: {e}")
            raise
        except pd.errors.EmptyDataError:
            print("Error: Empty data file")
            raise
        except Exception as e:
            print(f"Unexpected error in {func.__name__}: {e}")
            raise
    return wrapper

`;

  const importEnd = code.indexOf('\n\n', code.indexOf('import'));
  if (importEnd > 0) {
    return code.slice(0, importEnd) + '\n' + errorHandler + code.slice(importEnd);
  }
  return errorHandler + code;
}

function addParallelProcessingToCode(code: string, target: HypothesisETLTarget): string {
  const parallelCode = `
from concurrent.futures import ThreadPoolExecutor, as_completed
import multiprocessing

# Parallel processing configuration
MAX_WORKERS = min(4, multiprocessing.cpu_count())

def parallel_process(func, items, max_workers=MAX_WORKERS):
    """Execute function in parallel across items."""
    results = []
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(func, item): item for item in items}
        for future in as_completed(futures):
            results.append(future.result())
    return results

`;

  const importEnd = code.indexOf('\n\n', code.indexOf('import'));
  if (importEnd > 0) {
    return code.slice(0, importEnd) + '\n' + parallelCode + code.slice(importEnd);
  }
  return parallelCode + code;
}
