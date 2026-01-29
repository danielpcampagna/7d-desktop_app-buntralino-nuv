import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderPlus, Sparkles, Folder } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { WorkspaceCard } from '@/components/WorkspaceCard';
import { CreateWorkspaceModal } from '@/components/CreateWorkspaceModal';
import { BottomIsland } from '@/components/BottomIsland';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { cn } from '@/lib/utils';

const Index = () => {
  const navigate = useNavigate();
  const { workspaces, addWorkspace, setCurrentWorkspace } = useWorkspaceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenWorkspace = (workspace: typeof workspaces[0]) => {
    setCurrentWorkspace(workspace);
    navigate(`/workspace/${workspace.id}`);
  };

  const handleCreateWorkspace = (name: string, path: string) => {
    const newWorkspace = {
      id: Date.now().toString(),
      name,
      path,
      lastOpened: new Date(),
      projectCount: 0,
    };
    addWorkspace(newWorkspace);
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    createWorkspace: useCallback(() => setIsModalOpen(true), []),
    goHome: useCallback(() => navigate('/'), [navigate]),
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 pb-24">
      <div className="w-full max-w-2xl animate-fade-in">
        {/* Logo & Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-6 animate-float">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-semibold mb-2">
            Welcome to <span className="text-gradient">PyDeploy</span>
          </h1>
          <p className="text-muted-foreground">
            Create, run, and deploy Python projects with ease
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <button
            onClick={() => setIsModalOpen(true)}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-lg',
              'bg-primary text-primary-foreground',
              'hover:opacity-90 transition-opacity',
              'font-medium'
            )}
          >
            <FolderPlus size={18} />
            New Workspace
          </button>
          <button
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-lg',
              'bg-secondary text-secondary-foreground',
              'hover:bg-card-hover transition-colors',
              'font-medium'
            )}
          >
            <Folder size={18} />
            Open Folder
          </button>
        </div>

        {/* Recent Workspaces */}
        {workspaces.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Recent Workspaces
            </h2>
            <div className="space-y-3">
              {workspaces
                .sort((a, b) => b.lastOpened.getTime() - a.lastOpened.getTime())
                .map((workspace, index) => (
                  <div
                    key={workspace.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <WorkspaceCard
                      workspace={workspace}
                      onClick={() => handleOpenWorkspace(workspace)}
                    />
                  </div>
                ))}
            </div>
          </div>
        )}

        {workspaces.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-surface-elevated mb-4">
              <Folder className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              No workspaces yet. Create one to get started.
            </p>
          </div>
        )}
      </div>

      <BottomIsland />

      <CreateWorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateWorkspace}
      />
    </div>
  );
};

export default Index;
