import { useState, useEffect } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Table,
  BarChart3,
  FileWarning,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';
import { Dataset, DatasetProfiling, ColumnProfiling } from '@/types/hypothesis';
import { mockGenerateProfiling } from '@/services/mockHypothesisService';

interface DatasetProfilingViewerProps {
  datasets: Dataset[];
  profilings: Record<string, DatasetProfiling>;
  activeDatasetId: string | null;
  onSetActiveDataset: (datasetId: string) => void;
  onProfilingGenerated: (datasetId: string, profiling: DatasetProfiling) => void;
  onOpenCleanup: (datasetId: string) => void;
}

type ViewTab = 'overview' | 'columns' | 'warnings';

export const DatasetProfilingViewer = ({
  datasets,
  profilings,
  activeDatasetId,
  onSetActiveDataset,
  onProfilingGenerated,
  onOpenCleanup,
}: DatasetProfilingViewerProps) => {
  const [generatingFor, setGeneratingFor] = useState<Set<string>>(new Set());
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<ViewTab>('overview');

  const activeDataset = datasets.find((d) => d.id === activeDatasetId);
  const activeProfiling = activeDatasetId ? profilings[activeDatasetId] : null;

  // Auto-generate profiling for datasets that don't have it
  useEffect(() => {
    for (const dataset of datasets) {
      if (!profilings[dataset.id] && !generatingFor.has(dataset.id)) {
        generateProfiling(dataset);
      }
    }
  }, [datasets, profilings]);

  const generateProfiling = async (dataset: Dataset) => {
    setGeneratingFor((prev) => new Set(prev).add(dataset.id));
    try {
      const profiling = await mockGenerateProfiling(dataset);
      onProfilingGenerated(dataset.id, profiling);
    } finally {
      setGeneratingFor((prev) => {
        const next = new Set(prev);
        next.delete(dataset.id);
        return next;
      });
    }
  };

  const isGenerating = activeDatasetId ? generatingFor.has(activeDatasetId) : false;

  if (datasets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Table className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No datasets uploaded yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Go back to upload datasets first
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Dataset tabs sidebar */}
      <div className="w-64 border-r border-border bg-card flex-shrink-0">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Datasets
          </h3>
        </div>
        <div className="p-2 space-y-1">
          {datasets.map((dataset) => {
            const hasProfiling = !!profilings[dataset.id];
            const isGeneratingThis = generatingFor.has(dataset.id);
            const warnings = profilings[dataset.id]?.warnings.length ?? 0;

            return (
              <button
                key={dataset.id}
                onClick={() => onSetActiveDataset(dataset.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                  activeDatasetId === dataset.id
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-surface-elevated text-foreground'
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{dataset.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {dataset.rowCount.toLocaleString()} rows
                  </p>
                </div>

                {isGeneratingThis ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : hasProfiling ? (
                  <div className="flex items-center gap-1">
                    {warnings > 0 && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs bg-amber-500/10 text-amber-400">
                        <AlertTriangle className="w-3 h-3" />
                        {warnings}
                      </span>
                    )}
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Profiling content */}
      <div className="flex-1 overflow-auto">
        {!activeDataset ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Select a dataset to view profiling</p>
          </div>
        ) : isGenerating ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <h3 className="text-lg font-medium mb-2">Analyzing Dataset</h3>
            <p className="text-sm text-muted-foreground">
              Generating profiling statistics for {activeDataset.name}...
            </p>
          </div>
        ) : !activeProfiling ? (
          <div className="flex flex-col items-center justify-center h-full">
            <BarChart3 className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Profiling not generated yet</p>
            <button
              onClick={() => generateProfiling(activeDataset)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium',
                'bg-primary text-primary-foreground',
                'hover:opacity-90 transition-opacity'
              )}
            >
              <RefreshCw className="w-4 h-4" />
              Generate Profiling
            </button>
          </div>
        ) : (
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">{activeDataset.name}</h2>
                <p className="text-sm text-muted-foreground">
                  Profiling generated{' '}
                  {activeProfiling.generatedAt.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => generateProfiling(activeDataset)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm',
                    'bg-surface-elevated text-foreground',
                    'hover:bg-surface-elevated/80 transition-colors'
                  )}
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </button>
                <button
                  onClick={() => onOpenCleanup(activeDataset.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm',
                    'bg-primary text-primary-foreground',
                    'hover:opacity-90 transition-opacity'
                  )}
                >
                  <Sparkles className="w-4 h-4" />
                  Clean Data
                </button>
              </div>
            </div>

            {/* View tabs */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-surface-elevated w-fit mb-6">
              {(['overview', 'columns', 'warnings'] as ViewTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setViewTab(tab)}
                  className={cn(
                    'px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors',
                    viewTab === tab
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab}
                  {tab === 'warnings' && activeProfiling.warnings.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs">
                      {activeProfiling.warnings.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {viewTab === 'overview' && (
              <OverviewTab profiling={activeProfiling} />
            )}
            {viewTab === 'columns' && (
              <ColumnsTab
                profiling={activeProfiling}
                selectedColumn={selectedColumn}
                onSelectColumn={setSelectedColumn}
              />
            )}
            {viewTab === 'warnings' && (
              <WarningsTab profiling={activeProfiling} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ profiling }: { profiling: DatasetProfiling }) => {
  const stats = [
    { label: 'Rows', value: profiling.overview.rowCount.toLocaleString() },
    { label: 'Columns', value: profiling.overview.columnCount.toString() },
    { label: 'Duplicate Rows', value: profiling.overview.duplicateRows.toLocaleString() },
    { label: 'Missing Cells', value: profiling.overview.missingCells.toLocaleString() },
    {
      label: 'Missing %',
      value: `${profiling.overview.missingCellsPercentage.toFixed(1)}%`,
    },
    { label: 'Memory Size', value: profiling.overview.memorySize },
  ];

  const columnTypeData = profiling.columns.reduce((acc, col) => {
    acc[col.type] = (acc[col.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(columnTypeData).map(([type, count]) => ({
    type,
    count,
  }));

  const colors = {
    string: '#f472b6',
    number: '#60a5fa',
    boolean: '#34d399',
    date: '#fbbf24',
    object: '#a78bfa',
    array: '#f87171',
  };

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="p-4 rounded-lg bg-card border border-border">
            <p className="text-2xl font-semibold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Column types chart */}
      <div className="p-6 rounded-lg bg-card border border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Column Types Distribution
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" />
              <YAxis type="category" dataKey="type" width={80} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[entry.type as keyof typeof colors] || '#888'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Columns Tab Component
const ColumnsTab = ({
  profiling,
  selectedColumn,
  onSelectColumn,
}: {
  profiling: DatasetProfiling;
  selectedColumn: string | null;
  onSelectColumn: (name: string | null) => void;
}) => {
  const selectedColData = profiling.columns.find((c) => c.name === selectedColumn);

  return (
    <div className="flex gap-6">
      {/* Column list */}
      <div className="w-72 flex-shrink-0 space-y-1">
        {profiling.columns.map((col) => (
          <button
            key={col.name}
            onClick={() => onSelectColumn(col.name)}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors',
              selectedColumn === col.name
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-surface-elevated'
            )}
          >
            <div className="min-w-0">
              <p className="font-mono text-sm truncate">{col.name}</p>
              <p className="text-xs text-muted-foreground">{col.type}</p>
            </div>
            {col.missingPercentage > 0 && (
              <span className="text-xs text-muted-foreground">
                {col.missingPercentage.toFixed(1)}% null
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Column details */}
      <div className="flex-1">
        {!selectedColData ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Select a column to view details
          </div>
        ) : (
          <ColumnDetails column={selectedColData} />
        )}
      </div>
    </div>
  );
};

// Column Details Component
const ColumnDetails = ({ column }: { column: ColumnProfiling }) => {
  const stats = [
    { label: 'Type', value: column.type },
    { label: 'Distinct', value: column.distinctCount.toLocaleString() },
    { label: 'Distinct %', value: `${column.distinctPercentage.toFixed(1)}%` },
    { label: 'Missing', value: column.missingCount.toLocaleString() },
    { label: 'Missing %', value: `${column.missingPercentage.toFixed(1)}%` },
  ];

  if (column.mean !== undefined) {
    stats.push(
      { label: 'Mean', value: column.mean.toFixed(2) },
      { label: 'Std Dev', value: column.std?.toFixed(2) || '-' },
      { label: 'Min', value: String(column.min) },
      { label: 'Max', value: String(column.max) },
      { label: 'Median', value: column.median?.toFixed(2) || '-' }
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium font-mono">{column.name}</h3>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="p-3 rounded-lg bg-surface-elevated">
            <p className="text-sm font-medium">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Histogram */}
      {column.histogram && (
        <div className="p-4 rounded-lg bg-card border border-border">
          <h4 className="text-sm font-medium text-muted-foreground mb-4">
            Distribution
          </h4>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={column.histogram}>
                <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top values */}
      {column.topValues && (
        <div className="p-4 rounded-lg bg-card border border-border">
          <h4 className="text-sm font-medium text-muted-foreground mb-4">
            Top Values
          </h4>
          <div className="space-y-2">
            {column.topValues.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm truncate">{item.value}</span>
                    <span className="text-xs text-muted-foreground">
                      ({item.count.toLocaleString()})
                    </span>
                  </div>
                  <div className="h-1.5 bg-surface-elevated rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-primary/50 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground w-12 text-right">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Warnings Tab Component
const WarningsTab = ({ profiling }: { profiling: DatasetProfiling }) => {
  if (profiling.warnings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">No Issues Found</h3>
        <p className="text-sm text-muted-foreground">
          This dataset passed all quality checks
        </p>
      </div>
    );
  }

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'bg-destructive/10 border-destructive/20';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/20';
      default:
        return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className="space-y-3">
      {profiling.warnings.map((warning, i) => (
        <div
          key={i}
          className={cn(
            'flex items-start gap-3 p-4 rounded-lg border',
            getBgColor(warning.severity)
          )}
        >
          {getIcon(warning.severity)}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium capitalize">
                {warning.type.replace(/_/g, ' ')}
              </span>
              {warning.column && (
                <span className="font-mono text-sm text-muted-foreground">
                  ({warning.column})
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{warning.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
