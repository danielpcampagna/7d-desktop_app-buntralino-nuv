import { useState, useCallback } from 'react';
import { Upload, File, X, FileSpreadsheet, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dataset } from '@/types/hypothesis';
import { mockParseDataset } from '@/services/mockHypothesisService';

interface DatasetUploaderProps {
  projectId: string;
  datasets: Dataset[];
  onDatasetAdded: (dataset: Dataset) => void;
  onDatasetRemoved: (datasetId: string) => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'parsing' | 'done' | 'error';
  error?: string;
}

export const DatasetUploader = ({
  projectId,
  datasets,
  onDatasetAdded,
  onDatasetRemoved,
}: DatasetUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, UploadingFile>>(new Map());

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = async (file: File) => {
    const fileKey = `${file.name}-${file.size}-${Date.now()}`;

    // Check if already processing or exists
    if (datasets.some((d) => d.fileName === file.name)) {
      return; // Skip duplicate
    }

    // Add to uploading state
    setUploadingFiles((prev) => new Map(prev).set(fileKey, {
      file,
      progress: 0,
      status: 'uploading',
    }));

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 20) {
        await new Promise((r) => setTimeout(r, 100));
        setUploadingFiles((prev) => {
          const updated = new Map(prev);
          const item = updated.get(fileKey);
          if (item) {
            updated.set(fileKey, { ...item, progress: i });
          }
          return updated;
        });
      }

      // Update status to parsing
      setUploadingFiles((prev) => {
        const updated = new Map(prev);
        const item = updated.get(fileKey);
        if (item) {
          updated.set(fileKey, { ...item, status: 'parsing' });
        }
        return updated;
      });

      // Parse the dataset
      const dataset = await mockParseDataset(file, projectId);

      // Mark as done
      setUploadingFiles((prev) => {
        const updated = new Map(prev);
        const item = updated.get(fileKey);
        if (item) {
          updated.set(fileKey, { ...item, status: 'done' });
        }
        return updated;
      });

      // Notify parent
      onDatasetAdded(dataset);

      // Remove from uploading after a delay
      setTimeout(() => {
        setUploadingFiles((prev) => {
          const updated = new Map(prev);
          updated.delete(fileKey);
          return updated;
        });
      }, 1500);
    } catch (error) {
      setUploadingFiles((prev) => {
        const updated = new Map(prev);
        const item = updated.get(fileKey);
        if (item) {
          updated.set(fileKey, {
            ...item,
            status: 'error',
            error: error instanceof Error ? error.message : 'Upload failed',
          });
        }
        return updated;
      });
    }
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files).filter(isValidFile);
      for (const file of files) {
        processFile(file);
      }
    },
    [projectId, datasets]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []).filter(isValidFile);
      for (const file of files) {
        processFile(file);
      }
      // Reset input
      e.target.value = '';
    },
    [projectId, datasets]
  );

  const isValidFile = (file: File) => {
    const validExtensions = ['.csv', '.parquet', '.json', '.xlsx', '.xls'];
    return validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'csv' || ext === 'xlsx' || ext === 'xls') {
      return FileSpreadsheet;
    }
    return File;
  };

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 transition-all',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50',
        )}
      >
        <input
          type="file"
          multiple
          accept=".csv,.parquet,.json,.xlsx,.xls"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center text-center">
          <div
            className={cn(
              'w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors',
              isDragging ? 'bg-primary/20' : 'bg-surface-elevated'
            )}
          >
            <Upload
              className={cn(
                'w-8 h-8 transition-colors',
                isDragging ? 'text-primary' : 'text-muted-foreground'
              )}
            />
          </div>

          <h3 className="text-lg font-medium mb-2">
            {isDragging ? 'Drop files here' : 'Upload your datasets'}
          </h3>

          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop CSV, Parquet, JSON, or Excel files
          </p>

          <button
            type="button"
            className={cn(
              'px-4 py-2 rounded-lg font-medium text-sm',
              'bg-primary text-primary-foreground',
              'hover:opacity-90 transition-opacity'
            )}
          >
            Browse Files
          </button>
        </div>
      </div>

      {/* Uploading files */}
      {uploadingFiles.size > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Uploading</h4>
          {Array.from(uploadingFiles.entries()).map(([key, item]) => (
            <div
              key={key}
              className="flex items-center gap-3 p-3 rounded-lg bg-surface-elevated"
            >
              {item.status === 'done' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.status === 'uploading' && `Uploading... ${item.progress}%`}
                  {item.status === 'parsing' && 'Parsing dataset...'}
                  {item.status === 'done' && 'Complete'}
                  {item.status === 'error' && (
                    <span className="text-destructive">{item.error}</span>
                  )}
                </p>
              </div>
              {item.status === 'uploading' && (
                <div className="w-24 h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Uploaded datasets */}
      {datasets.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Uploaded Datasets ({datasets.length})
          </h4>
          <div className="grid gap-2">
            {datasets.map((dataset) => {
              const FileIcon = getFileIcon(dataset.fileName);
              return (
                <div
                  key={dataset.id}
                  className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border"
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileIcon className="w-5 h-5 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{dataset.name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatFileSize(dataset.fileSize)}</span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span>{dataset.rowCount.toLocaleString()} rows</span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span>{dataset.columns.length} columns</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-xs font-medium',
                        'bg-emerald-500/10 text-emerald-400'
                      )}
                    >
                      {dataset.fileType.toUpperCase()}
                    </span>

                    <button
                      onClick={() => onDatasetRemoved(dataset.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state hint */}
      {datasets.length === 0 && uploadingFiles.size === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Upload at least one dataset to continue
        </p>
      )}
    </div>
  );
};
