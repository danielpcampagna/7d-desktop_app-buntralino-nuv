import { FileCode2, Clock, Play, Circle } from 'lucide-react';
import { Project } from '@/types/workspace';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  viewMode?: 'card' | 'list';
}

const StatusIndicator = ({ status }: { status: Project['status'] }) => {
  const colors = {
    idle: 'text-text-muted',
    running: 'text-emerald-400 animate-pulse',
    deploying: 'text-amber-400 animate-pulse',
  };

  return <Circle className={cn('w-2 h-2 fill-current', colors[status])} />;
};

export const ProjectCard = ({ project, onClick, viewMode = 'card' }: ProjectCardProps) => {
  if (viewMode === 'list') {
    return (
      <button
        onClick={onClick}
        className={cn(
          'group w-full text-left p-4 rounded-lg',
          'bg-card hover:bg-card-hover',
          'transition-all duration-200',
          'flex items-center gap-4'
        )}
      >
        <div className="p-2 rounded-md bg-surface-elevated group-hover:bg-primary/10 transition-colors">
          <FileCode2 className="w-4 h-4 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <StatusIndicator status={project.status} />
            <h3 className="font-mono font-medium text-foreground truncate">
              {project.name}
            </h3>
          </div>
          {project.description && (
            <p className="text-sm text-muted-foreground truncate mt-0.5">
              {project.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-text-muted">
          <span className="font-mono">Python {project.pythonVersion}</span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatDistanceToNow(project.lastModified, { addSuffix: true })}
          </span>
        </div>

        {project.status === 'running' && (
          <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'group text-left p-5 rounded-xl',
        'bg-card hover:bg-card-hover',
        'transition-all duration-300 ease-out',
        'hover-lift'
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-lg bg-surface-elevated group-hover:bg-primary/10 transition-colors">
          <FileCode2 className="w-5 h-5 text-primary" />
        </div>
        
        <div className="flex items-center gap-2">
          <StatusIndicator status={project.status} />
          <span className="text-xs text-text-muted capitalize">{project.status}</span>
        </div>
      </div>

      <h3 className="font-mono font-medium text-foreground group-hover:text-primary transition-colors mb-1">
        {project.name}
      </h3>
      
      {project.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {project.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-text-muted">
        <span className="font-mono px-2 py-1 rounded bg-surface-elevated">
          Python {project.pythonVersion}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {formatDistanceToNow(project.lastModified, { addSuffix: true })}
        </span>
      </div>
    </button>
  );
};
