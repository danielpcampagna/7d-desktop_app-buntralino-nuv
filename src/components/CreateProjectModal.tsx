import { useState } from 'react';
import { X, FilePlus, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  ProjectTemplate, 
  TemplateConfig, 
  TEMPLATE_CONFIGS, 
  CATEGORY_LABELS, 
  CATEGORY_COLORS 
} from '@/types/templates';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string, pythonVersion: string, template: ProjectTemplate) => void;
}

const pythonVersions = ['3.12', '3.11', '3.10', '3.9'];

type Step = 'template' | 'details';

export const CreateProjectModal = ({ isOpen, onClose, onCreate }: CreateProjectModalProps) => {
  const [step, setStep] = useState<Step>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pythonVersion, setPythonVersion] = useState('3.12');

  if (!isOpen) return null;

  const handleClose = () => {
    setStep('template');
    setSelectedTemplate(null);
    setName('');
    setDescription('');
    setPythonVersion('3.12');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && selectedTemplate) {
      onCreate(name, description, pythonVersion, selectedTemplate);
      handleClose();
    }
  };

  const handleTemplateSelect = (templateId: ProjectTemplate) => {
    setSelectedTemplate(templateId);
  };

  const handleNextStep = () => {
    if (selectedTemplate) {
      setStep('details');
    }
  };

  const handlePrevStep = () => {
    setStep('template');
  };

  const selectedConfig = selectedTemplate 
    ? TEMPLATE_CONFIGS.find(t => t.id === selectedTemplate) 
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={handleClose} />
      
      <div className={cn(
        'relative w-full p-6 rounded-2xl',
        'bg-card island-shadow',
        'animate-slide-up',
        step === 'template' ? 'max-w-2xl' : 'max-w-md'
      )}>
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-primary/10">
            <FilePlus className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">New Project</h2>
            <p className="text-sm text-muted-foreground">
              {step === 'template' ? 'Choose a template' : 'Configure your project'}
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
            step === 'template' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-surface-elevated text-muted-foreground'
          )}>
            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white/20 text-xs">1</span>
            Template
          </div>
          <div className="w-8 h-px bg-border" />
          <div className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
            step === 'details' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-surface-elevated text-muted-foreground'
          )}>
            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white/20 text-xs">2</span>
            Details
          </div>
        </div>

        {step === 'template' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TEMPLATE_CONFIGS.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplate === template.id}
                  onSelect={() => handleTemplateSelect(template.id)}
                />
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!selectedTemplate}
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
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Selected template preview */}
            {selectedConfig && (
              <div className={cn(
                'flex items-center gap-3 p-3 rounded-lg',
                'bg-surface-elevated'
              )}>
                <div className="p-2 rounded-lg bg-primary/10">
                  <selectedConfig.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{selectedConfig.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedConfig.description}</p>
                </div>
                <span className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium',
                  CATEGORY_COLORS[selectedConfig.category]
                )}>
                  {CATEGORY_LABELS[selectedConfig.category]}
                </span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Project Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="my-project"
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
                placeholder="What does this project do?"
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
                onClick={handlePrevStep}
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
                Create Project
                <Check size={16} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

interface TemplateCardProps {
  template: TemplateConfig;
  isSelected: boolean;
  onSelect: () => void;
}

const TemplateCard = ({ template, isSelected, onSelect }: TemplateCardProps) => {
  const Icon = template.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group text-left p-4 rounded-xl',
        'transition-all duration-200',
        'border-2',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-transparent bg-surface-elevated hover:bg-surface-elevated/80'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          'p-2.5 rounded-lg transition-colors',
          isSelected ? 'bg-primary/20' : 'bg-card group-hover:bg-primary/10'
        )}>
          <Icon className={cn(
            'w-5 h-5 transition-colors',
            isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
          )} />
        </div>
        <div className="flex items-center gap-2">
          {template.supportsVisualEditor && (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/10 text-purple-400">
              Visual Editor
            </span>
          )}
          <span className={cn(
            'px-2 py-0.5 rounded text-xs font-medium',
            CATEGORY_COLORS[template.category]
          )}>
            {CATEGORY_LABELS[template.category]}
          </span>
        </div>
      </div>

      <h3 className={cn(
        'font-medium mb-1 transition-colors',
        isSelected ? 'text-primary' : 'text-foreground'
      )}>
        {template.name}
      </h3>
      <p className="text-sm text-muted-foreground line-clamp-2">
        {template.description}
      </p>

      {isSelected && (
        <div className="mt-3 flex items-center gap-1 text-xs text-primary">
          <Check size={14} />
          Selected
        </div>
      )}
    </button>
  );
};
