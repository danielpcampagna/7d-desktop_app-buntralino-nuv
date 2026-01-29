export interface Workspace {
  id: string;
  name: string;
  path: string;
  lastOpened: Date;
  projectCount: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  createdAt: Date;
  lastModified: Date;
  pythonVersion: string;
  status: 'idle' | 'running' | 'deploying';
}

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  extension?: string;
}
