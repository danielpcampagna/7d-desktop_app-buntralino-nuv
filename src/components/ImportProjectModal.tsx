import { useState } from 'react';
import { X, Upload, ArrowRight, ArrowLeft, Check, FileUp, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  ProjectTemplate, 
  TemplateConfig, 
  IMPORT_SOURCE_CONFIGS,
  getTemplateConfig,
  getWorkflowOrchestrationTemplates,
  CATEGORY_LABELS, 
  CATEGORY_COLORS,
  ImportSource
} from '@/types/templates';

interface ImportProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (name: string, description: string, pythonVersion: string, targetTemplate: ProjectTemplate, sourceFile: File | null) => void;
}

const pythonVersions = ['3.12', '3.11', '3.10', '3.9'];

type Step = 'source' | 'file' | 'target' | 'details';

export const ImportProjectModal = ({ isOpen, onClose, onImport }: ImportProjectModalProps) => {
  const [step, setStep] = useState<Step>('source');
  const [selectedSource, setSelectedSource] = useState<ImportSource | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<ProjectTemplate | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pythonVersion, setPythonVersion] = useState('3.12');
  const [dragActive, setDragActive] = useState(false);

  const workflowTemplates = getWorkflowOrchestrationTemplates();

  if (!isOpen) return null;

  const handleClose = () => {
    setStep('source');
    setSelectedSource(null);
    setSelectedFile(null);
    setSelectedTarget(null);
    setName('');
    setDescription('');
    setPythonVersion('3.12');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && selectedTarget) {
      onImport(name, description, pythonVersion, selectedTarget, selectedFile);
      handleClose();
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const getStepNumber = () => {
    switch (step) {
      case 'source': return 1;
      case 'file': return 2;
      case 'target': return 3;
      case 'details': return 4;
    }
  };

  const selectedSourceConfig = selectedSource 
    ? IMPORT_SOURCE_CONFIGS.find(s => s.id === selectedSource)
    : null;

  const selectedTargetConfig = selectedTarget 
    ? getTemplateConfig(selectedTarget)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={handleClose} />
      
      <div className={cn(
        'relative w-full max-w-lg p-6 rounded-2xl',
        'bg-card island-shadow',
        'animate-slide-up'
      )}>
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-amber-500/10">
            <Upload className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Import Project</h2>
            <p className="text-sm text-muted-foreground">
              {step === 'source' && 'Choose import source'}
              {step === 'file' && 'Upload pipeline file'}
              {step === 'target' && 'Choose target platform'}
              {step === 'details' && 'Configure your project'}
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-6">
          {['source', 'file', 'target', 'details'].map((s, index) => (
            <div key={s} className="flex items-center">
              <div className={cn(
                'w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium transition-colors',
                getStepNumber() > index + 1 
                  ? 'bg-primary text-primary-foreground'
                  : getStepNumber() === index + 1 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-surface-elevated text-muted-foreground'
              )}>
                {getStepNumber() > index + 1 ? <Check size={12} /> : index + 1}
              </div>
              {index < 3 && <div className="w-6 h-px bg-border mx-1" />}
            </div>
          ))}
        </div>

        {/* Step 1: Source Selection */}
        {step === 'source' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {IMPORT_SOURCE_CONFIGS.map((source) => (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => setSelectedSource(source.id)}
                  className={cn(
                    'w-full text-left p-4 rounded-xl',
                    'transition-all duration-200',
                    'border-2',
                    selectedSource === source.id
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent bg-surface-elevated hover:bg-surface-elevated/80'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={cn(
                        'font-medium mb-1',
                        selectedSource === source.id ? 'text-primary' : 'text-foreground'
                      )}>
                        {source.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{source.description}</p>
                      <p className="text-xs text-text-muted mt-1">
                        Supported files: {source.fileExtensions.join(', ')}
                      </p>
                    </div>
                    {selectedSource === source.id && (
                      <Check size={20} className="text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setStep('file')}
                disabled={!selectedSource}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium',
                  'bg-primary text-primary-foreground',
                  'hover:opacity-90 transition-opacity',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                Next
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: File Upload */}
        {step === 'file' && (
          <div className="space-y-4">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={cn(
                'relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed',
                'transition-colors cursor-pointer',
                dragActive
                  ? 'border-primary bg-primary/5'
                  : selectedFile
                    ? 'border-emerald-500 bg-emerald-500/5'
                    : 'border-border bg-surface-elevated hover:border-primary/50'
              )}
            >
              <input
                type="file"
                onChange={handleFileChange}
                accept={selectedSourceConfig?.fileExtensions.join(',')}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {selectedFile ? (
                <>
                  <FileUp className="w-10 h-10 text-emerald-400 mb-3" />
                  <p className="font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="mt-2 text-xs text-primary hover:underline"
                  >
                    Choose a different file
                  </button>
                </>
              ) : (
                <>
                  <Upload className={cn(
                    'w-10 h-10 mb-3',
                    dragActive ? 'text-primary' : 'text-muted-foreground'
                  )} />
                  <p className="font-medium text-foreground">
                    Drop your {selectedSourceConfig?.name} file here
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or click to browse
                  </p>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertCircle size={16} />
              <p className="text-xs">
                The file will be converted to your chosen target platform format
              </p>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep('source')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium',
                  'bg-surface-elevated text-foreground',
                  'hover:bg-surface-elevated/80 transition-colors'
                )}
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep('target')}
                disabled={!selectedFile}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium',
                  'bg-primary text-primary-foreground',
                  'hover:opacity-90 transition-opacity',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                Next
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Target Selection */}
        {step === 'target' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-3">
              Choose the workflow orchestration platform to convert your pipeline to:
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {workflowTemplates.map((template) => (
                <TargetTemplateCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTarget === template.id}
                  onSelect={() => setSelectedTarget(template.id)}
                />
              ))}
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep('file')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium',
                  'bg-surface-elevated text-foreground',
                  'hover:bg-surface-elevated/80 transition-colors'
                )}
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep('details')}
                disabled={!selectedTarget}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium',
                  'bg-primary text-primary-foreground',
                  'hover:opacity-90 transition-opacity',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                Next
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Project Details */}
        {step === 'details' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Import summary */}
            <div className={cn(
              'flex items-center gap-3 p-3 rounded-lg',
              'bg-surface-elevated'
            )}>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Converting from</p>
                <p className="text-sm font-medium">{selectedSourceConfig?.name}</p>
              </div>
              <ArrowRight size={16} className="text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">To</p>
                <div className="flex items-center gap-2">
                  {selectedTargetConfig && (
                    <>
                      <selectedTargetConfig.icon className="w-4 h-4 text-primary" />
                      <p className="text-sm font-medium">{selectedTargetConfig.name}</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Project Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="imported-pipeline"
                className={cn(
                  'w-full px-4 py-3 rounded-lg font-mono',
                  'bg-surface-elevated',
                  'text-foreground placeholder:text-text-muted',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50',
                  'transition-all'
                )}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Imported from Data Guru pipeline"
                rows={2}
                className={cn(
                  'w-full px-4 py-3 rounded-lg resize-none',
                  'bg-surface-elevated',
                  'text-foreground placeholder:text-text-muted',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50',
                  'transition-all'
                )}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Python Version</label>
              <div className="flex gap-2">
                {pythonVersions.map((version) => (
                  <button
                    key={version}
                    type="button"
                    onClick={() => setPythonVersion(version)}
                    className={cn(
                      'flex-1 py-2 rounded-lg font-mono text-sm',
                      'transition-all',
                      pythonVersion === version
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-surface-elevated text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {version}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep('target')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium',
                  'bg-surface-elevated text-foreground',
                  'hover:bg-surface-elevated/80 transition-colors'
                )}
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <button
                type="submit"
                disabled={!name}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium',
                  'bg-primary text-primary-foreground',
                  'hover:opacity-90 transition-opacity',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                Import Project
                <Check size={16} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

interface TargetTemplateCardProps {
  template: TemplateConfig;
  isSelected: boolean;
  onSelect: () => void;
}

const TargetTemplateCard = ({ template, isSelected, onSelect }: TargetTemplateCardProps) => {
  const Icon = template.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'text-left p-4 rounded-xl',
        'transition-all duration-200',
        'border-2',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-transparent bg-surface-elevated hover:bg-surface-elevated/80'
      )}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={cn(
          'p-2 rounded-lg transition-colors',
          isSelected ? 'bg-primary/20' : 'bg-card'
        )}>
          <Icon className={cn(
            'w-4 h-4 transition-colors',
            isSelected ? 'text-primary' : 'text-muted-foreground'
          )} />
        </div>
        {isSelected && <Check size={16} className="text-primary ml-auto" />}
      </div>
      
      <h3 className={cn(
        'font-medium text-sm mb-1',
        isSelected ? 'text-primary' : 'text-foreground'
      )}>
        {template.name}
      </h3>
      
      <span className={cn(
        'px-1.5 py-0.5 rounded text-xs font-medium',
        CATEGORY_COLORS[template.category]
      )}>
        {CATEGORY_LABELS[template.category]}
      </span>
    </button>
  );
};
