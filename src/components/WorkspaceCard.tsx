import { Folder, Clock, ChevronRight } from 'lucide-react';
import { Workspace } from '@/types/workspace';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface WorkspaceCardProps {
  workspace: Workspace;
  onClick: () => void;
}

export const WorkspaceCard = ({ workspace, onClick }: WorkspaceCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group w-full text-left p-5 rounded-xl',
        'bg-card hover:bg-card-hover',
        'transition-all duration-300 ease-out',
        'hover-lift'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-surface-elevated group-hover:bg-primary/10 transition-colors">
            <Folder className="w-5 h-5 text-primary" />
          </div>
          
          <div className="space-y-1">
            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
              {workspace.name}
            </h3>
            <p className="text-sm text-muted-foreground font-mono">
              {workspace.path}
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {formatDistanceToNow(workspace.lastOpened, { addSuffix: true })}
              </span>
              <span>{workspace.projectCount} projects</span>
            </div>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>
    </button>
  );
};
