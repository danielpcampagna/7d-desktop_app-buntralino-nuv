import { useState, useRef, useEffect, useCallback } from 'react';
import { FileText, Database, Columns3, Info, Type, List, ListOrdered, Quote, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dataset, MentionItem, HypothesisETLTarget } from '@/types/hypothesis';
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from '@/components/ui/popover';

type SimpleContentValue = { text: string };

interface HypothesisEditorProps {
  datasets: Dataset[];
  targetTemplate: HypothesisETLTarget;
  value: SimpleContentValue | null;
  onChange: (value: SimpleContentValue, plainText: string) => void;
  onTargetChange: (target: HypothesisETLTarget) => void;
}

const TARGET_OPTIONS: { value: HypothesisETLTarget; label: string; description: string }[] = [
  { value: 'dagster', label: 'Dagster', description: 'Asset-based data orchestration' },
  { value: 'prefect', label: 'Prefect', description: 'Workflow orchestration with flows & tasks' },
  { value: 'airflow', label: 'Airflow', description: 'DAG-based workflow scheduling' },
  { value: 'dagu', label: 'Dagu', description: 'YAML-based workflow engine' },
];

// Slash command options (like Notion/Yoopta)
const SLASH_COMMANDS = [
  { id: 'h1', label: 'Heading 1', prefix: '# ', icon: Type },
  { id: 'h2', label: 'Heading 2', prefix: '## ', icon: Type },
  { id: 'h3', label: 'Heading 3', prefix: '### ', icon: Type },
  { id: 'bullet', label: 'Bullet list', prefix: '- ', icon: List },
  { id: 'numbered', label: 'Numbered list', prefix: '1. ', icon: ListOrdered },
  { id: 'quote', label: 'Quote', prefix: '> ', icon: Quote },
  { id: 'divider', label: 'Divider', prefix: '\n---\n', icon: Minus },
];

export const HypothesisEditor = ({
  datasets,
  targetTemplate,
  value,
  onChange,
  onTargetChange,
}: HypothesisEditorProps) => {
  const [showMentionHint, setShowMentionHint] = useState(true);
  const [text, setText] = useState(value?.text || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // @ mention dropdown
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionSelectedIndex, setMentionSelectedIndex] = useState(0);

  // / slash command dropdown
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [slashSelectedIndex, setSlashSelectedIndex] = useState(0);

  useEffect(() => {
    if (value?.text !== undefined && value.text !== text) {
      setText(value.text);
    }
  }, [value]);

  const mentionItems: MentionItem[] = [];
  for (const dataset of datasets) {
    mentionItems.push({
      id: `dataset-${dataset.id}`,
      type: 'dataset',
      label: dataset.name,
      datasetId: dataset.id,
    });
    for (const column of dataset.columns) {
      mentionItems.push({
        id: `column-${dataset.id}-${column.name}`,
        type: 'column',
        label: `${dataset.name}.${column.name}`,
        datasetId: dataset.id,
        columnName: column.name,
      });
    }
  }

  const filteredMentions = mentionQuery
    ? mentionItems.filter((m) =>
        m.label.toLowerCase().includes(mentionQuery.toLowerCase())
      )
    : mentionItems;

  const filteredSlashCommands = slashQuery
    ? SLASH_COMMANDS.filter((c) =>
        c.label.toLowerCase().includes(slashQuery.toLowerCase())
      )
    : SLASH_COMMANDS;

  const insertAtCursor = useCallback(
    (toInsert: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = text.slice(0, start) + toInsert + text.slice(end);
      setText(newText);
      onChange({ text: newText }, newText);

      setTimeout(() => {
        textarea.focus();
        const newPos = start + toInsert.length;
        textarea.setSelectionRange(newPos, newPos);
      }, 0);
    },
    [text, onChange]
  );

  const applyMention = useCallback(
    (mention: MentionItem) => {
      const toInsert = `@${mention.label}`;
      insertAtCursor(toInsert);
      setMentionOpen(false);
      setMentionQuery('');
      setMentionSelectedIndex(0);
    },
    [insertAtCursor]
  );

  const applySlashCommand = useCallback(
    (cmd: (typeof SLASH_COMMANDS)[0]) => {
      insertAtCursor(cmd.prefix);
      setSlashOpen(false);
      setSlashQuery('');
      setSlashSelectedIndex(0);
    },
    [insertAtCursor]
  );

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    const cursorPos = e.target.selectionStart ?? newText.length;

    setText(newText);
    onChange({ text: newText }, newText);

    // Detect @ for mention dropdown
    const textBeforeCursor = newText.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const afterAt = textBeforeCursor.slice(lastAtIndex + 1);
      if (!/\s/.test(afterAt)) {
        setMentionQuery(afterAt);
        setMentionOpen(true);
        setMentionSelectedIndex(0);
        setSlashOpen(false);
        return;
      }
    }
    setMentionOpen(false);

    // Detect / for slash command dropdown
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/');
    if (lastSlashIndex !== -1) {
      const afterSlash = textBeforeCursor.slice(lastSlashIndex + 1);
      if (!/\s/.test(afterSlash) && (lastSlashIndex === 0 || textBeforeCursor[lastSlashIndex - 1] === '\n')) {
        setSlashQuery(afterSlash);
        setSlashOpen(true);
        setSlashSelectedIndex(0);
        setMentionOpen(false);
        return;
      }
    }
    setSlashOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionOpen && filteredMentions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionSelectedIndex((i) => (i + 1) % filteredMentions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionSelectedIndex((i) => (i - 1 + filteredMentions.length) % filteredMentions.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        applyMention(filteredMentions[mentionSelectedIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setMentionOpen(false);
        return;
      }
    }

    if (slashOpen && filteredSlashCommands.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSlashSelectedIndex((i) => (i + 1) % filteredSlashCommands.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSlashSelectedIndex((i) => (i - 1 + filteredSlashCommands.length) % filteredSlashCommands.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        applySlashCommand(filteredSlashCommands[slashSelectedIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setSlashOpen(false);
        return;
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Hypothesis Specification</h2>
              <p className="text-sm text-muted-foreground">
                Describe your data pipeline in natural language
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Target ETL:</span>
          <div className="flex items-center gap-2">
            {TARGET_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onTargetChange(option.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  targetTemplate === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-surface-elevated text-muted-foreground hover:text-foreground'
                )}
                title={option.description}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-3 border-b border-border bg-surface-elevated/50">
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Available References:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {datasets.map((dataset) => (
              <div
                key={dataset.id}
                className="flex items-center gap-1.5 px-2 py-1 rounded bg-card border border-border text-xs"
              >
                <Database className="w-3 h-3 text-primary" />
                <span className="font-mono">@{dataset.name}</span>
                <span className="text-muted-foreground">
                  ({dataset.columns.length} cols)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showMentionHint && (
        <div className="mx-6 mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-blue-400">
              Type <span className="font-mono bg-blue-500/20 px-1 rounded">@</span> for datasets/columns or <span className="font-mono bg-blue-500/20 px-1 rounded">/</span> for formatting (headings, lists, quote). Use Enter or Tab to select.
            </p>
          </div>
          <button
            onClick={() => setShowMentionHint(false)}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Editor with dropdowns */}
      <div ref={containerRef} className="flex-1 overflow-auto relative">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Popover open={mentionOpen} onOpenChange={setMentionOpen}>
            <PopoverAnchor asChild>
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={handleTextChange}
                  onKeyDown={handleKeyDown}
                  placeholder={`Start describing your hypothesis here...

Type @ to reference datasets and columns (e.g. @customers, @orders.customer_id).
Type / for formatting: headings, lists, quote, divider.

Example:
"I want to analyze customer purchase behavior by joining @customers with @orders.
First, clean the data by removing duplicates. Then aggregate total purchases per customer."`}
                  className={cn(
                    'w-full min-h-[400px] p-4 rounded-lg border border-border bg-card',
                    'text-foreground placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50',
                    'resize-none font-mono text-sm leading-relaxed',
                    'transition-all'
                  )}
                  autoFocus
                />
              </div>
            </PopoverAnchor>
            <PopoverContent
              className="w-72 p-0"
              align="start"
              sideOffset={4}
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="max-h-64 overflow-auto py-1">
                <p className="px-3 py-1.5 text-xs text-muted-foreground border-b border-border">
                  Datasets & columns
                </p>
                {filteredMentions.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-muted-foreground">No matches</p>
                ) : (
                  filteredMentions.map((item, i) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => applyMention(item)}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                        i === mentionSelectedIndex
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-surface-elevated'
                      )}
                    >
                      <Database className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-mono">@{item.label}</span>
                      {item.type === 'column' && (
                        <span className="text-xs text-muted-foreground">column</span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Popover open={slashOpen} onOpenChange={setSlashOpen}>
            <PopoverAnchor asChild>
              <div className="relative" aria-hidden />
            </PopoverAnchor>
            <PopoverContent
              className="w-64 p-0"
              align="start"
              side="bottom"
              sideOffset={4}
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="max-h-64 overflow-auto py-1">
                <p className="px-3 py-1.5 text-xs text-muted-foreground border-b border-border">
                  Formatting
                </p>
                {filteredSlashCommands.map((cmd, i) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      type="button"
                      onClick={() => applySlashCommand(cmd)}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                        i === slashSelectedIndex
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-surface-elevated'
                      )}
                    >
                      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span>{cmd.label}</span>
                      <span className="text-xs text-muted-foreground font-mono ml-auto">
                        {cmd.prefix.trim() || '---'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="px-6 py-3 border-t border-border bg-card">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated text-foreground">/</kbd>{' '}
              formatting
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated text-foreground">@</kbd>{' '}
              references
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Columns3 className="w-3 h-3" />
            <span>{mentionItems.length} references available</span>
          </div>
        </div>
      </div>
    </div>
  );
};
