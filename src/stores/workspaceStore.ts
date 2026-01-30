import { create } from 'zustand';
import { Workspace, Project } from '@/types/workspace';

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  projects: Project[];
  currentProject: Project | null;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  setCurrentProject: (project: Project | null) => void;
  addWorkspace: (workspace: Workspace) => void;
  addProject: (project: Project) => void;
}

// Mock data for demonstration
const mockWorkspaces: Workspace[] = [
  {
    id: '1',
    name: 'Personal Projects',
    path: '~/projects/personal',
    lastOpened: new Date('2024-01-15'),
    projectCount: 4,
  },
  {
    id: '2',
    name: 'Work',
    path: '~/projects/work',
    lastOpened: new Date('2024-01-20'),
    projectCount: 7,
  },
  {
    id: '3',
    name: 'Open Source',
    path: '~/projects/oss',
    lastOpened: new Date('2024-01-10'),
    projectCount: 2,
  },
];

const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'ml-pipeline',
    description: 'Machine learning data pipeline for processing large datasets',
    workspaceId: '1',
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-20'),
    pythonVersion: '3.11',
    status: 'idle',
    template: 'dagster',
    supportsVisualEditor: true,
  },
  {
    id: 'p2',
    name: 'api-server',
    description: 'FastAPI backend service',
    workspaceId: '1',
    createdAt: new Date('2024-01-05'),
    lastModified: new Date('2024-01-18'),
    pythonVersion: '3.12',
    status: 'running',
    template: 'fastapi',
    supportsVisualEditor: false,
  },
  {
    id: 'p3',
    name: 'automation-scripts',
    description: 'Collection of automation utilities',
    workspaceId: '1',
    createdAt: new Date('2024-01-08'),
    lastModified: new Date('2024-01-15'),
    pythonVersion: '3.10',
    status: 'idle',
    template: 'python-package',
    supportsVisualEditor: false,
  },
  {
    id: 'p4',
    name: 'data-workflows',
    description: 'Prefect workflows for data processing',
    workspaceId: '1',
    createdAt: new Date('2024-01-12'),
    lastModified: new Date('2024-01-19'),
    pythonVersion: '3.11',
    status: 'idle',
    template: 'prefect',
    supportsVisualEditor: true,
  },
];

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaces: mockWorkspaces,
  currentWorkspace: null,
  projects: mockProjects,
  currentProject: null,
  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
  setCurrentProject: (project) => set({ currentProject: project }),
  addWorkspace: (workspace) =>
    set((state) => ({ workspaces: [...state.workspaces, workspace] })),
  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),
}));
