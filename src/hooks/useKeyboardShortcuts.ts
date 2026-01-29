import { useEffect, useCallback } from 'react';
import { useShortcutsStore } from '@/stores/shortcutsStore';
import { ShortcutAction } from '@/types/shortcuts';

type ShortcutHandlers = Partial<Record<ShortcutAction, () => void>>;

export const useKeyboardShortcuts = (handlers: ShortcutHandlers) => {
  const { shortcuts } = useShortcutsStore();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow some shortcuts even in inputs
        const allowedInInputs: ShortcutAction[] = ['saveFile', 'runCode'];
        const matchingShortcut = shortcuts.find((s) =>
          matchesShortcut(event, s.keys) && allowedInInputs.includes(s.id)
        );
        
        if (!matchingShortcut) return;
      }

      for (const shortcut of shortcuts) {
        if (matchesShortcut(event, shortcut.keys)) {
          const handler = handlers[shortcut.id];
          if (handler) {
            event.preventDefault();
            event.stopPropagation();
            handler();
            return;
          }
        }
      }
    },
    [shortcuts, handlers]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

const matchesShortcut = (event: KeyboardEvent, keys: string[]): boolean => {
  const pressedKeys: string[] = [];
  
  if (event.ctrlKey || event.metaKey) pressedKeys.push('Ctrl');
  if (event.shiftKey) pressedKeys.push('Shift');
  if (event.altKey) pressedKeys.push('Alt');
  
  // Get the actual key pressed
  let key = event.key;
  
  // Normalize some keys
  if (key === ' ') key = 'Space';
  if (key === ',') key = ',';
  if (key === '`') key = '`';
  
  // Don't add modifier keys as the main key
  if (!['Control', 'Shift', 'Alt', 'Meta'].includes(key)) {
    pressedKeys.push(key.length === 1 ? key.toUpperCase() : key);
  }
  
  // Normalize expected keys for comparison
  const normalizedExpected = keys.map((k) => {
    if (k === 'Enter') return 'Enter';
    if (k === 'Backspace') return 'Backspace';
    if (k === 'Escape') return 'Escape';
    if (k === '`') return '`';
    if (k === ',') return ',';
    return k.length === 1 ? k.toUpperCase() : k;
  });
  
  // Check if arrays match (order doesn't matter for modifiers)
  if (pressedKeys.length !== normalizedExpected.length) return false;
  
  return pressedKeys.every((k) => normalizedExpected.includes(k));
};

export const useRecordShortcut = (
  isRecording: boolean,
  onRecord: (keys: string[]) => void
) => {
  useEffect(() => {
    if (!isRecording) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      
      const keys: string[] = [];
      
      if (event.ctrlKey || event.metaKey) keys.push('Ctrl');
      if (event.shiftKey) keys.push('Shift');
      if (event.altKey) keys.push('Alt');
      
      let key = event.key;
      
      // Skip if only modifier keys are pressed
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(key)) return;
      
      // Normalize the key
      if (key === ' ') key = 'Space';
      
      keys.push(key.length === 1 ? key.toUpperCase() : key);
      
      onRecord(keys);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRecording, onRecord]);
};
