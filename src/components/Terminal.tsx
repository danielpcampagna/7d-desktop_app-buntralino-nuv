import { Terminal as TerminalIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TerminalProps {
  output?: string[];
}

export const Terminal = ({ output = [] }: TerminalProps) => {
  const defaultOutput = [
    '$ python main.py',
    '>>> Starting application...',
    '>>> Server running on http://localhost:8000',
    '',
  ];

  const lines = output.length > 0 ? output : defaultOutput;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Terminal header */}
      <div className="flex items-center gap-2 h-8 px-4 bg-card">
        <TerminalIcon className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-mono text-muted-foreground">Terminal</span>
      </div>

      {/* Terminal content */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="font-mono text-sm">
          {lines.map((line, index) => (
            <div
              key={index}
              className={cn(
                'leading-6',
                line.startsWith('$') && 'text-primary',
                line.startsWith('>>>') && 'text-emerald-400',
                line.startsWith('Error') && 'text-destructive',
                !line.startsWith('$') && !line.startsWith('>>>') && !line.startsWith('Error') && 'text-foreground'
              )}
            >
              {line || '\u00A0'}
            </div>
          ))}
          <div className="flex items-center text-primary">
            <span>$</span>
            <span className="ml-2 w-2 h-4 bg-primary animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};
