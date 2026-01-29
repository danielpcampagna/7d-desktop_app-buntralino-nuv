export type ShortcutAction =
  | 'createProject'
  | 'createWorkspace'
  | 'runCode'
  | 'deployProject'
  | 'toggleTerminal'
  | 'goHome'
  | 'goBack'
  | 'openSettings'
  | 'searchFiles'
  | 'saveFile';

export interface Shortcut {
  id: ShortcutAction;
  label: string;
  description: string;
  keys: string[];
  category: 'navigation' | 'project' | 'editor';
}

export interface ShortcutEvent {
  action: ShortcutAction;
  preventDefault: () => void;
}

export const DEFAULT_SHORTCUTS: Shortcut[] = [
  {
    id: 'goHome',
    label: 'Go to Home',
    description: 'Navigate to the home page',
    keys: ['Ctrl', 'Shift', 'H'],
    category: 'navigation',
  },
  {
    id: 'goBack',
    label: 'Go Back',
    description: 'Navigate to the previous page',
    keys: ['Ctrl', 'Backspace'],
    category: 'navigation',
  },
  {
    id: 'openSettings',
    label: 'Open Settings',
    description: 'Open the settings modal',
    keys: ['Ctrl', ','],
    category: 'navigation',
  },
  {
    id: 'createWorkspace',
    label: 'New Workspace',
    description: 'Create a new workspace',
    keys: ['Ctrl', 'Shift', 'N'],
    category: 'project',
  },
  {
    id: 'createProject',
    label: 'New Project',
    description: 'Create a new project in current workspace',
    keys: ['Ctrl', 'N'],
    category: 'project',
  },
  {
    id: 'runCode',
    label: 'Run Code',
    description: 'Execute the current project',
    keys: ['Ctrl', 'Enter'],
    category: 'editor',
  },
  {
    id: 'deployProject',
    label: 'Deploy Project',
    description: 'Deploy the current project',
    keys: ['Ctrl', 'Shift', 'D'],
    category: 'editor',
  },
  {
    id: 'toggleTerminal',
    label: 'Toggle Terminal',
    description: 'Show or hide the terminal panel',
    keys: ['Ctrl', '`'],
    category: 'editor',
  },
  {
    id: 'searchFiles',
    label: 'Search Files',
    description: 'Open file search dialog',
    keys: ['Ctrl', 'P'],
    category: 'editor',
  },
  {
    id: 'saveFile',
    label: 'Save File',
    description: 'Save the current file',
    keys: ['Ctrl', 'S'],
    category: 'editor',
  },
];
