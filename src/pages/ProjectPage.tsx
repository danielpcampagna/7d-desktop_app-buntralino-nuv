import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Search, Plus } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { FileTree } from '@/components/FileTree';
import { CodeEditor } from '@/components/CodeEditor';
import { Terminal } from '@/components/Terminal';
import { BottomIsland } from '@/components/BottomIsland';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { FileNode } from '@/types/workspace';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Mock file structure
const mockFiles: FileNode[] = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    path: 'src',
    children: [
      {
        id: '2',
        name: 'main.py',
        type: 'file',
        path: 'src/main.py',
        extension: 'py',
      },
      {
        id: '3',
        name: 'utils.py',
        type: 'file',
        path: 'src/utils.py',
        extension: 'py',
      },
      {
        id: '4',
        name: 'api',
        type: 'folder',
        path: 'src/api',
        children: [
          {
            id: '5',
            name: 'routes.py',
            type: 'file',
            path: 'src/api/routes.py',
            extension: 'py',
          },
        ],
      },
    ],
  },
  {
    id: '6',
    name: 'tests',
    type: 'folder',
    path: 'tests',
    children: [
      {
        id: '7',
        name: 'test_main.py',
        type: 'file',
        path: 'tests/test_main.py',
        extension: 'py',
      },
    ],
  },
  {
    id: '8',
    name: 'requirements.txt',
    type: 'file',
    path: 'requirements.txt',
    extension: 'txt',
  },
  {
    id: '9',
    name: 'README.md',
    type: 'file',
    path: 'README.md',
    extension: 'md',
  },
  {
    id: '10',
    name: 'pyproject.toml',
    type: 'file',
    path: 'pyproject.toml',
    extension: 'toml',
  },
];

const mockCode = `from fastapi import FastAPI
from typing import Optional

app = FastAPI()

@app.get("/")
async def root():
    """Return a welcome message."""
    return {"message": "Hello, World!"}

@app.get("/items/{item_id}")
async def read_item(item_id: int, q: Optional[str] = None):
    """Get an item by ID with optional query parameter."""
    return {"item_id": item_id, "q": q}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
`;

const ProjectPage = () => {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const { projects, workspaces } = useWorkspaceStore();
  
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [terminalVisible, setTerminalVisible] = useState(true);

  const project = projects.find((p) => p.id === projectId);
  const workspace = workspaces.find((w) => w.id === workspaceId);

  // Action handlers
  const handleRun = useCallback(() => {
    toast.success('Running project...', {
      description: `Executing ${project?.name || 'project'}`,
    });
  }, [project]);

  const handleDeploy = useCallback(() => {
    toast.info('Deploy started', {
      description: `Deploying ${project?.name || 'project'} to production`,
    });
  }, [project]);

  const handleSave = useCallback(() => {
    toast.success('File saved');
  }, []);

  const handleToggleTerminal = useCallback(() => {
    setTerminalVisible((prev) => !prev);
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    runCode: handleRun,
    deployProject: handleDeploy,
    saveFile: handleSave,
    toggleTerminal: handleToggleTerminal,
    goHome: useCallback(() => navigate('/'), [navigate]),
    goBack: useCallback(() => navigate(`/workspace/${workspaceId}`), [navigate, workspaceId]),
  });

  if (!project || !workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between h-12 px-4 bg-card">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/workspace/${workspaceId}`)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{workspace.name}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium font-mono">{project.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={cn(
            'px-2 py-0.5 rounded text-xs font-mono',
            'bg-surface-elevated text-muted-foreground'
          )}>
            Python {project.pythonVersion}
          </span>
          
          {project.status === 'running' && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Running
            </span>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File explorer */}
        <div className="w-64 flex-shrink-0 bg-card overflow-hidden flex flex-col">
          {/* Explorer header */}
          <div className="flex items-center justify-between h-10 px-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Explorer
              </span>
              <ChevronDown size={14} className="text-muted-foreground" />
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1 rounded hover:bg-surface-elevated text-muted-foreground hover:text-foreground transition-colors">
                <Plus size={14} />
              </button>
              <button className="p-1 rounded hover:bg-surface-elevated text-muted-foreground hover:text-foreground transition-colors">
                <Search size={14} />
              </button>
            </div>
          </div>

          {/* File tree */}
          <div className="flex-1 overflow-auto">
            <FileTree
              files={mockFiles}
              onSelectFile={setSelectedFile}
              selectedPath={selectedFile?.path}
            />
          </div>
        </div>

        {/* Editor & Terminal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor */}
          <div 
            className="flex-1 overflow-hidden" 
            style={{ height: terminalVisible ? `calc(100% - ${terminalHeight}px)` : '100%' }}
          >
            {selectedFile ? (
              <CodeEditor
                fileName={selectedFile.name}
                content={mockCode}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p className="text-sm">Select a file to edit</p>
              </div>
            )}
          </div>

          {terminalVisible && (
            <>
              {/* Resizer */}
              <div
                className="h-1 bg-border hover:bg-primary/50 cursor-row-resize transition-colors"
                onMouseDown={(e) => {
                  const startY = e.clientY;
                  const startHeight = terminalHeight;
                  
                  const handleMouseMove = (e: MouseEvent) => {
                    const delta = startY - e.clientY;
                    setTerminalHeight(Math.max(100, Math.min(400, startHeight + delta)));
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              />

              {/* Terminal */}
              <div style={{ height: `${terminalHeight}px` }}>
                <Terminal />
              </div>
            </>
          )}
        </div>
      </div>

      <BottomIsland 
        showProjectActions 
        onRun={handleRun}
        onDeploy={handleDeploy}
      />
    </div>
  );
};

export default ProjectPage;
