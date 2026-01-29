import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Shortcut, ShortcutAction, DEFAULT_SHORTCUTS } from '@/types/shortcuts';

interface ShortcutsState {
  shortcuts: Shortcut[];
  updateShortcut: (id: ShortcutAction, keys: string[]) => void;
  resetShortcut: (id: ShortcutAction) => void;
  resetAllShortcuts: () => void;
  getShortcut: (id: ShortcutAction) => Shortcut | undefined;
}

export const useShortcutsStore = create<ShortcutsState>()(
  persist(
    (set, get) => ({
      shortcuts: DEFAULT_SHORTCUTS,
      
      updateShortcut: (id, keys) =>
        set((state) => ({
          shortcuts: state.shortcuts.map((s) =>
            s.id === id ? { ...s, keys } : s
          ),
        })),
      
      resetShortcut: (id) =>
        set((state) => ({
          shortcuts: state.shortcuts.map((s) =>
            s.id === id
              ? { ...s, keys: DEFAULT_SHORTCUTS.find((d) => d.id === id)?.keys || s.keys }
              : s
          ),
        })),
      
      resetAllShortcuts: () =>
        set({ shortcuts: DEFAULT_SHORTCUTS }),
      
      getShortcut: (id) => get().shortcuts.find((s) => s.id === id),
    }),
    {
      name: 'pydeploy-shortcuts',
    }
  )
);

export const formatShortcut = (keys: string[]): string => {
  return keys
    .map((key) => {
      if (key === 'Ctrl') return '⌃';
      if (key === 'Shift') return '⇧';
      if (key === 'Alt') return '⌥';
      if (key === 'Meta' || key === 'Cmd') return '⌘';
      if (key === 'Enter') return '↵';
      if (key === 'Backspace') return '⌫';
      if (key === 'Escape') return 'Esc';
      if (key === '`') return '`';
      return key.toUpperCase();
    })
    .join(' ');
};

export const formatShortcutReadable = (keys: string[]): string => {
  return keys.join(' + ');
};
