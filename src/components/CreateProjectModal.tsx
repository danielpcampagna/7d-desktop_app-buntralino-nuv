import { useState } from 'react';
import { X, FilePlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string, pythonVersion: string) => void;
}

const pythonVersions = ['3.12', '3.11', '3.10', '3.9'];

export const CreateProjectModal = ({ isOpen, onClose, onCreate }: CreateProjectModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pythonVersion, setPythonVersion] = useState('3.12');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name) {
      onCreate(name, description, pythonVersion);
      setName('');
      setDescription('');
      setPythonVersion('3.12');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className={cn(
        'relative w-full max-w-md p-6 rounded-2xl',
        'bg-card island-shadow',
        'animate-slide-up'
      )}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-primary/10">
            <FilePlus className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">New Project</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button
            type="submit"
            disabled={!name}
            className={cn(
              'w-full py-3 rounded-lg font-medium',
              'bg-primary text-primary-foreground',
              'hover:opacity-90 transition-opacity',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            Create Project
          </button>
        </form>
      </div>
    </div>
  );
};
