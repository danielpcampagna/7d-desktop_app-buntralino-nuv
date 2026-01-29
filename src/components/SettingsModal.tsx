import { useState } from 'react';
import { X, Keyboard, RotateCcw, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useShortcutsStore, formatShortcutReadable } from '@/stores/shortcutsStore';
import { useRecordShortcut } from '@/hooks/useKeyboardShortcuts';
import { ShortcutAction, Shortcut } from '@/types/shortcuts';
import { cn } from '@/lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutEditorProps {
  shortcut: Shortcut;
  onUpdate: (id: ShortcutAction, keys: string[]) => void;
  onReset: (id: ShortcutAction) => void;
}

const ShortcutEditor = ({ shortcut, onUpdate, onReset }: ShortcutEditorProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedKeys, setRecordedKeys] = useState<string[]>([]);

  useRecordShortcut(isRecording, (keys) => {
    setRecordedKeys(keys);
    onUpdate(shortcut.id, keys);
    setIsRecording(false);
  });

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordedKeys([]);
  };

  const handleCancel = () => {
    setIsRecording(false);
    setRecordedKeys([]);
  };

  return (
    <div className="flex items-center justify-between py-3 group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{shortcut.label}</p>
        <p className="text-xs text-muted-foreground truncate">{shortcut.description}</p>
      </div>
      
      <div className="flex items-center gap-2">
        {isRecording ? (
          <div className="flex items-center gap-2">
            <div className={cn(
              'px-3 py-1.5 rounded-md text-sm font-mono',
              'bg-primary/10 text-primary border border-primary/30',
              'animate-pulse'
            )}>
              {recordedKeys.length > 0 
                ? formatShortcutReadable(recordedKeys)
                : 'Press keys...'}
            </div>
            <button
              onClick={handleCancel}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={handleStartRecording}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-mono',
                'bg-surface-elevated text-muted-foreground',
                'hover:bg-card-hover hover:text-foreground',
                'transition-colors cursor-pointer'
              )}
            >
              {formatShortcutReadable(shortcut.keys)}
            </button>
            <button
              onClick={() => onReset(shortcut.id)}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                'text-muted-foreground hover:text-foreground hover:bg-surface-elevated',
                'opacity-0 group-hover:opacity-100'
              )}
              title="Reset to default"
            >
              <RotateCcw size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { shortcuts, updateShortcut, resetShortcut, resetAllShortcuts } = useShortcutsStore();

  const navigationShortcuts = shortcuts.filter((s) => s.category === 'navigation');
  const projectShortcuts = shortcuts.filter((s) => s.category === 'project');
  const editorShortcuts = shortcuts.filter((s) => s.category === 'editor');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader className="pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Keyboard size={20} className="text-primary" />
            Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="shortcuts" className="mt-4">
          <TabsList className="bg-surface-elevated border border-border">
            <TabsTrigger 
              value="shortcuts" 
              className="data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              Keyboard Shortcuts
            </TabsTrigger>
            <TabsTrigger 
              value="general"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              General
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shortcuts" className="mt-4 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Click on a shortcut to customize it
              </p>
              <button
                onClick={resetAllShortcuts}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm',
                  'text-muted-foreground hover:text-foreground',
                  'hover:bg-surface-elevated transition-colors'
                )}
              >
                <RotateCcw size={14} />
                Reset All
              </button>
            </div>

            {/* Navigation shortcuts */}
            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Navigation
              </h3>
              <div className="bg-surface-elevated rounded-lg px-4 divide-y divide-border">
                {navigationShortcuts.map((shortcut) => (
                  <ShortcutEditor
                    key={shortcut.id}
                    shortcut={shortcut}
                    onUpdate={updateShortcut}
                    onReset={resetShortcut}
                  />
                ))}
              </div>
            </div>

            {/* Project shortcuts */}
            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Project
              </h3>
              <div className="bg-surface-elevated rounded-lg px-4 divide-y divide-border">
                {projectShortcuts.map((shortcut) => (
                  <ShortcutEditor
                    key={shortcut.id}
                    shortcut={shortcut}
                    onUpdate={updateShortcut}
                    onReset={resetShortcut}
                  />
                ))}
              </div>
            </div>

            {/* Editor shortcuts */}
            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Editor
              </h3>
              <div className="bg-surface-elevated rounded-lg px-4 divide-y divide-border">
                {editorShortcuts.map((shortcut) => (
                  <ShortcutEditor
                    key={shortcut.id}
                    shortcut={shortcut}
                    onUpdate={updateShortcut}
                    onReset={resetShortcut}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="general" className="mt-4">
            <div className="space-y-6">
              {/* Theme section placeholder */}
              <div>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Appearance
                </h3>
                <div className="bg-surface-elevated rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Dark Theme</p>
                      <p className="text-xs text-muted-foreground">Use dark color scheme</p>
                    </div>
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
                      <Check size={16} className="text-primary" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Python settings placeholder */}
              <div>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Python
                </h3>
                <div className="bg-surface-elevated rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Default Python Version</p>
                      <p className="text-xs text-muted-foreground">Used when creating new projects</p>
                    </div>
                    <span className="px-2 py-1 rounded-md bg-background text-sm font-mono">
                      3.12
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
