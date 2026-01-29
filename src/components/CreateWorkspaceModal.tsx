import { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, path: string) => void;
}

export const CreateWorkspaceModal = ({ isOpen, onClose, onCreate }: CreateWorkspaceModalProps) => {
  const [name, setName] = useState('');
  const [path, setPath] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && path) {
      onCreate(name, path);
      setName('');
      setPath('');
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
            <FolderPlus className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">New Workspace</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Workspace Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Workspace"
              className={cn(
                'w-full px-4 py-3 rounded-lg',
                'bg-surface-elevated',
                'text-foreground placeholder:text-text-muted',
                'focus:outline-none focus:ring-2 focus:ring-primary/50',
                'transition-all'
              )}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Path</label>
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="~/projects/my-workspace"
              className={cn(
                'w-full px-4 py-3 rounded-lg font-mono text-sm',
                'bg-surface-elevated',
                'text-foreground placeholder:text-text-muted',
                'focus:outline-none focus:ring-2 focus:ring-primary/50',
                'transition-all'
              )}
            />
          </div>

          <button
            type="submit"
            disabled={!name || !path}
            className={cn(
              'w-full py-3 rounded-lg font-medium',
              'bg-primary text-primary-foreground',
              'hover:opacity-90 transition-opacity',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            Create Workspace
          </button>
        </form>
      </div>
    </div>
  );
};
