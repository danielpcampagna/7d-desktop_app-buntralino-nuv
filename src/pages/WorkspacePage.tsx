import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FilePlus, LayoutGrid, List, Search, Upload } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { ProjectCard } from '@/components/ProjectCard';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import { ImportProjectModal } from '@/components/ImportProjectModal';
import { BottomIsland } from '@/components/BottomIsland';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { cn } from '@/lib/utils';
import { ProjectTemplate, getTemplateConfig } from '@/types/templates';

type ViewMode = 'card' | 'list';

const WorkspacePage = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { workspaces, projects, addProject, setCurrentProject } = useWorkspaceStore();
  
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const workspace = workspaces.find((w) => w.id === workspaceId);
  
  const workspaceProjects = useMemo(() => {
    return projects
      .filter((p) => p.workspaceId === workspaceId)
      .filter((p) => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
  }, [projects, workspaceId, searchQuery]);

  const handleOpenProject = (project: typeof projects[0]) => {
    setCurrentProject(project);
    navigate(`/workspace/${workspaceId}/project/${project.id}`);
  };

  const handleCreateProject = (name: string, description: string, pythonVersion: string, template: ProjectTemplate) => {
    const templateConfig = getTemplateConfig(template);
    const newProject = {
      id: Date.now().toString(),
      name,
      description: description || undefined,
      workspaceId: workspaceId!,
      createdAt: new Date(),
      lastModified: new Date(),
      pythonVersion,
      status: 'idle' as const,
      template,
      supportsVisualEditor: templateConfig?.supportsVisualEditor ?? false,
    };
    addProject(newProject);
  };

  const handleImportProject = (
    name: string, 
    description: string, 
    pythonVersion: string, 
    targetTemplate: ProjectTemplate,
    _sourceFile: File | null
  ) => {
    const templateConfig = getTemplateConfig(targetTemplate);
    const newProject = {
      id: Date.now().toString(),
      name,
      description: description || `Imported from Data Guru`,
      workspaceId: workspaceId!,
      createdAt: new Date(),
      lastModified: new Date(),
      pythonVersion,
      status: 'idle' as const,
      template: targetTemplate,
      supportsVisualEditor: templateConfig?.supportsVisualEditor ?? false,
    };
    addProject(newProject);
    // Note: Actual file conversion will be handled by the backend API
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    createProject: useCallback(() => setIsCreateModalOpen(true), []),
    goHome: useCallback(() => navigate('/'), [navigate]),
    goBack: useCallback(() => navigate('/'), [navigate]),
  });

  if (!workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Workspace not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-8 pb-24">
      {/* Header */}
      <div className="max-w-4xl mx-auto w-full mb-8 animate-fade-in">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Back to Home</span>
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold mb-1">{workspace.name}</h1>
            <p className="text-sm text-muted-foreground font-mono">{workspace.path}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg',
                'bg-surface-elevated text-foreground',
                'hover:bg-surface-elevated/80 transition-colors',
                'font-medium text-sm'
              )}
            >
              <Upload size={16} />
              Import
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg',
                'bg-primary text-primary-foreground',
                'hover:opacity-90 transition-opacity',
                'font-medium text-sm'
              )}
            >
              <FilePlus size={16} />
              New Project
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="max-w-4xl mx-auto w-full mb-6 animate-fade-in">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className={cn(
                'w-full pl-10 pr-4 py-2 rounded-lg',
                'bg-card text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-primary/50',
                'text-sm font-mono'
              )}
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center rounded-lg bg-card p-1">
            <button
              onClick={() => setViewMode('card')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'card'
                  ? 'bg-surface-elevated text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'list'
                  ? 'bg-surface-elevated text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="max-w-4xl mx-auto w-full flex-1">
        {workspaceProjects.length > 0 ? (
          <div className={cn(
            viewMode === 'card'
              ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
              : 'space-y-2'
          )}>
            {workspaceProjects.map((project, index) => (
              <div
                key={project.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <ProjectCard
                  project={project}
                  onClick={() => handleOpenProject(project)}
                  viewMode={viewMode}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-surface-elevated mb-4">
              <FilePlus className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? 'No projects match your search'
                : 'No projects in this workspace'}
            </p>
            {!searchQuery && (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="text-primary hover:underline text-sm"
                >
                  Create your first project
                </button>
                <span className="text-muted-foreground">or</span>
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="text-primary hover:underline text-sm"
                >
                  Import from Data Guru
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomIsland />

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateProject}
      />

      <ImportProjectModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportProject}
      />
    </div>
  );
};

export default WorkspacePage;
