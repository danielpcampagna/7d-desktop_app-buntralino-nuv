import { useState } from 'react';
import { Home, FolderOpen, Code2, Play, Upload, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { SettingsModal } from '@/components/SettingsModal';
import { useShortcutsStore, formatShortcut } from '@/stores/shortcutsStore';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface IslandButtonProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  isActive?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'accent';
}

const IslandButton = ({ icon, label, shortcut, isActive, onClick, variant = 'default' }: IslandButtonProps) => (
  <TooltipProvider delayDuration={300}>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            'flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-200',
            'hover:bg-surface-overlay',
            isActive && 'text-primary',
            !isActive && 'text-muted-foreground hover:text-foreground',
            variant === 'accent' && 'text-primary hover:text-primary'
          )}
        >
          <span className={cn(
            'transition-transform duration-200',
            isActive && 'scale-110'
          )}>
            {icon}
          </span>
          <span className="text-[10px] font-medium tracking-wide uppercase">{label}</span>
        </button>
      </TooltipTrigger>
      {shortcut && (
        <TooltipContent side="top" className="bg-card border-border">
          <span className="font-mono text-xs">{shortcut}</span>
        </TooltipContent>
      )}
    </Tooltip>
  </TooltipProvider>
);

interface BottomIslandProps {
  showProjectActions?: boolean;
  onRun?: () => void;
  onDeploy?: () => void;
}

export const BottomIsland = ({ showProjectActions = false, onRun, onDeploy }: BottomIslandProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { getShortcut } = useShortcutsStore();

  const getShortcutDisplay = (id: string) => {
    const shortcut = getShortcut(id as any);
    return shortcut ? formatShortcut(shortcut.keys) : undefined;
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-1 px-2 py-2 bg-card/90 backdrop-blur-xl rounded-2xl island-shadow">
          <IslandButton
            icon={<Home size={20} />}
            label="Home"
            shortcut={getShortcutDisplay('goHome')}
            isActive={location.pathname === '/'}
            onClick={() => navigate('/')}
          />
          
          {location.pathname.startsWith('/workspace') && (
            <IslandButton
              icon={<FolderOpen size={20} />}
              label="Projects"
              isActive={location.pathname.includes('/workspace/') && !location.pathname.includes('/project/')}
              onClick={() => {
                const workspaceId = location.pathname.split('/workspace/')[1]?.split('/')[0];
                if (workspaceId) navigate(`/workspace/${workspaceId}`);
              }}
            />
          )}

          {showProjectActions && (
            <>
              <div className="w-px h-8 bg-border mx-2" />
              
              <IslandButton
                icon={<Code2 size={20} />}
                label="Editor"
                isActive
              />
              
              <IslandButton
                icon={<Play size={20} />}
                label="Run"
                shortcut={getShortcutDisplay('runCode')}
                variant="accent"
                onClick={onRun}
              />
              
              <IslandButton
                icon={<Upload size={20} />}
                label="Deploy"
                shortcut={getShortcutDisplay('deployProject')}
                onClick={onDeploy}
              />
            </>
          )}

          <div className="w-px h-8 bg-border mx-2" />
          
          <IslandButton
            icon={<Settings size={20} />}
            label="Settings"
            shortcut={getShortcutDisplay('openSettings')}
            onClick={() => setSettingsOpen(true)}
          />
        </div>
      </div>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
};
