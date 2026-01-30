import { useState, useMemo } from 'react';
import { X, Upload, ArrowRight, ArrowLeft, Check, FileUp, AlertCircle, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  ProjectTemplate, 
  TemplateConfig, 
  IMPORT_SOURCE_CONFIGS,
  getTemplateConfig,
  getWorkflowOrchestrationTemplates,
  CATEGORY_LABELS, 
  CATEGORY_COLORS,
  ImportSource,
  UV_RUN_COMMAND_PRESETS
} from '@/types/templates';

export interface ImportProjectData {
  name: string;
  description: string;
  pythonVersion: string;
  targetTemplate: ProjectTemplate;
  sourceFile: File | null;
  sourcePath?: string;
  entryPoint?: string;
  runCommand?: string;
}

interface ImportProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: ImportProjectData) => void;
}

const pythonVersions = ['3.12', '3.11', '3.10', '3.9'];

type Step = 'source' | 'location' | 'target' | 'config' | 'details';

export const ImportProjectModal = ({ isOpen, onClose, onImport }: ImportProjectModalProps) => {
  const [step, setStep] = useState<Step>('source');
  const [selectedSource, setSelectedSource] = useState<ImportSource | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [projectPath, setProjectPath] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<ProjectTemplate | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pythonVersion, setPythonVersion] = useState('3.12');
  const [entryPoint, setEntryPoint] = useState('');
  const [runCommand, setRunCommand] = useState('');
  const [runCommandPreset, setRunCommandPreset] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  const workflowTemplates = getWorkflowOrchestrationTemplates();

  const selectedSourceConfig = useMemo(() => 
    selectedSource ? IMPORT_SOURCE_CONFIGS.find(s => s.id === selectedSource) : null,
    [selectedSource]
  );

  const selectedTargetConfig = useMemo(() => 
    selectedTarget ? getTemplateConfig(selectedTarget) : null,
    [selectedTarget]
  );

  // Determine the steps based on import mode
  const steps = useMemo(() => {
    if (!selectedSourceConfig) return ['source', 'location', 'target', 'details'];
    
    if (selectedSourceConfig.mode === 'direct') {
      // Direct import: source -> location -> config (if needed) -> details
      if (selectedSourceConfig.requiresEntryPoint || selectedSourceConfig.requiresRunCommand) {
        return ['source', 'location', 'config', 'details'];
      }
      return ['source', 'location', 'details'];
    }
    
    // Convert mode: source -> location -> target -> details
    return ['source', 'location', 'target', 'details'];
  }, [selectedSourceConfig]);

  const currentStepIndex = steps.indexOf(step);
  const totalSteps = steps.length;

  if (!isOpen) return null;

  const handleClose = () => {
    setStep('source');
    setSelectedSource(null);
    setSelectedFile(null);
    setProjectPath('');
    setSelectedTarget(null);
    setName('');
    setDescription('');
    setPythonVersion('3.12');
    setEntryPoint('');
    setRunCommand('');
    setRunCommandPreset('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetTemplate = selectedSourceConfig?.mode === 'direct' 
      ? selectedSourceConfig.targetTemplate!
      : selectedTarget!;
    
    if (name && targetTemplate) {
      onImport({
        name,
        description,
        pythonVersion,
        targetTemplate,
        sourceFile: selectedFile,
        sourcePath: projectPath || undefined,
        entryPoint: entryPoint || undefined,
        runCommand: runCommand || undefined,
      });
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

  const handleRunCommandPresetChange = (preset: string) => {
    setRunCommandPreset(preset);
    const presetConfig = UV_RUN_COMMAND_PRESETS.find(p => p.label === preset);
    if (presetConfig && presetConfig.command) {
      setRunCommand(presetConfig.command.replace('{entryPoint}', entryPoint || 'main.py'));
    }
  };

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      // For direct mode, set the target template automatically
      if (selectedSourceConfig?.mode === 'direct' && steps[nextIndex] === 'details') {
        setSelectedTarget(selectedSourceConfig.targetTemplate!);
      }
      setStep(steps[nextIndex] as Step);
    }
  };

  const goToPrevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(steps[prevIndex] as Step);
    }
  };

  const canProceedFromLocation = selectedSourceConfig?.acceptsFolder 
    ? projectPath.trim() !== ''
    : selectedFile !== null;

  const getStepTitle = () => {
    switch (step) {
      case 'source': return 'Choose import source';
      case 'location': return selectedSourceConfig?.acceptsFolder ? 'Enter project path' : 'Upload file';
      case 'target': return 'Choose target platform';
      case 'config': return 'Configure project settings';
      case 'details': return 'Configure your project';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={handleClose} />
      
      <div className={cn(
        'relative w-full max-w-lg p-6 rounded-2xl',
        'bg-card island-shadow',
        'animate-slide-up',
        'max-h-[90vh] overflow-y-auto'
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
            <p className="text-sm text-muted-foreground">{getStepTitle()}</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-6">
          {steps.map((s, index) => (
            <div key={s} className="flex items-center">
              <div className={cn(
                'w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium transition-colors',
                currentStepIndex > index 
                  ? 'bg-primary text-primary-foreground'
                  : currentStepIndex === index 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-surface-elevated text-muted-foreground'
              )}>
                {currentStepIndex > index ? <Check size={12} /> : index + 1}
              </div>
              {index < totalSteps - 1 && <div className="w-6 h-px bg-border mx-1" />}
            </div>
          ))}
        </div>

        {/* Step 1: Source Selection */}
        {step === 'source' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {IMPORT_SOURCE_CONFIGS.map((source) => {
                const Icon = source.icon;
                return (
                  <button
                    key={source.id}
                    type="button"
                    onClick={() => {
                      setSelectedSource(source.id);
                      // Reset dependent state
                      setSelectedFile(null);
                      setProjectPath('');
                      setSelectedTarget(null);
                    }}
                    className={cn(
                      'w-full text-left p-4 rounded-xl',
                      'transition-all duration-200',
                      'border-2',
                      selectedSource === source.id
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent bg-surface-elevated hover:bg-surface-elevated/80'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'p-2 rounded-lg transition-colors mt-0.5',
                        selectedSource === source.id ? 'bg-primary/20' : 'bg-card'
                      )}>
                        <Icon className={cn(
                          'w-4 h-4 transition-colors',
                          selectedSource === source.id ? 'text-primary' : 'text-muted-foreground'
                        )} />
                      </div>
                      <div className="flex-1">
                        <h3 className={cn(
                          'font-medium mb-1',
                          selectedSource === source.id ? 'text-primary' : 'text-foreground'
                        )}>
                          {source.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{source.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {source.mode === 'convert' && (
                            <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400">
                              Converts to ETL
                            </span>
                          )}
                          {source.acceptsFolder && (
                            <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400">
                              Folder Import
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedSource === source.id && (
                        <Check size={20} className="text-primary mt-0.5" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={goToNextStep}
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

        {/* Step 2: Location (File or Folder) */}
        {step === 'location' && (
          <div className="space-y-4">
            {selectedSourceConfig?.acceptsFolder ? (
              // Folder path input for UV Python and Python Package
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Project Path</label>
                  <div className="relative">
                    <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={projectPath}
                      onChange={(e) => setProjectPath(e.target.value)}
                      placeholder="/path/to/your/project"
                      className={cn(
                        'w-full pl-10 pr-4 py-3 rounded-lg font-mono text-sm',
                        'bg-surface-elevated',
                        'text-foreground placeholder:text-text-muted',
                        'focus:outline-none focus:ring-2 focus:ring-primary/50',
                        'transition-all'
                      )}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter the absolute path to your {selectedSourceConfig.name} project folder
                  </p>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 text-blue-400">
                  <AlertCircle size={16} />
                  <p className="text-xs">
                    The project must be a valid UV-managed Python project with a pyproject.toml file
                  </p>
                </div>
              </div>
            ) : (
              // File upload for Data Guru
              <>
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
              </>
            )}

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={goToPrevStep}
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
                onClick={goToNextStep}
                disabled={!canProceedFromLocation}
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

        {/* Step 3: Target Selection (only for 'convert' mode) */}
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
                onClick={goToPrevStep}
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
                onClick={goToNextStep}
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

        {/* Step: Config (for UV Python projects) */}
        {step === 'config' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-3">
              Configure how to run your UV Python project:
            </p>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Entry Point</label>
              <input
                type="text"
                value={entryPoint}
                onChange={(e) => {
                  setEntryPoint(e.target.value);
                  // Update run command if using a preset
                  if (runCommandPreset && runCommandPreset !== 'Custom') {
                    const presetConfig = UV_RUN_COMMAND_PRESETS.find(p => p.label === runCommandPreset);
                    if (presetConfig && presetConfig.command) {
                      setRunCommand(presetConfig.command.replace('{entryPoint}', e.target.value || 'main.py'));
                    }
                  }
                }}
                placeholder="src/main.py"
                className={cn(
                  'w-full px-4 py-3 rounded-lg font-mono text-sm',
                  'bg-surface-elevated',
                  'text-foreground placeholder:text-text-muted',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50',
                  'transition-all'
                )}
              />
              <p className="text-xs text-muted-foreground">
                The main file or module to execute when running the project
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Run Command Preset</label>
              <div className="flex gap-2 flex-wrap">
                {UV_RUN_COMMAND_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleRunCommandPresetChange(preset.label)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm',
                      'transition-all',
                      runCommandPreset === preset.label
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-surface-elevated text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Run Command</label>
              <input
                type="text"
                value={runCommand}
                onChange={(e) => {
                  setRunCommand(e.target.value);
                  setRunCommandPreset('Custom');
                }}
                placeholder="uv run python src/main.py"
                className={cn(
                  'w-full px-4 py-3 rounded-lg font-mono text-sm',
                  'bg-surface-elevated',
                  'text-foreground placeholder:text-text-muted',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50',
                  'transition-all'
                )}
              />
              <p className="text-xs text-muted-foreground">
                The command to execute when running the project
              </p>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={goToPrevStep}
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
                onClick={goToNextStep}
                disabled={!entryPoint}
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

        {/* Final Step: Project Details */}
        {step === 'details' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Import summary */}
            <div className={cn(
              'p-3 rounded-lg',
              'bg-surface-elevated'
            )}>
              {selectedSourceConfig?.mode === 'convert' ? (
                <div className="flex items-center gap-3">
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
              ) : (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Importing as</p>
                  <div className="flex items-center gap-2">
                    {selectedSourceConfig && (
                      <>
                        <selectedSourceConfig.icon className="w-4 h-4 text-primary" />
                        <p className="text-sm font-medium">{selectedSourceConfig.name}</p>
                      </>
                    )}
                  </div>
                  {projectPath && (
                    <p className="text-xs text-muted-foreground mt-2 font-mono truncate">
                      {projectPath}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Project Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="imported-project"
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
                placeholder={`Imported ${selectedSourceConfig?.name}`}
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
                onClick={goToPrevStep}
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
