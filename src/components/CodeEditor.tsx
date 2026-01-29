import { cn } from '@/lib/utils';

interface CodeEditorProps {
  fileName: string;
  content: string;
  language?: string;
}

export const CodeEditor = ({ fileName, content }: CodeEditorProps) => {
  const lines = content.split('\n');

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Tab bar */}
      <div className="flex items-center h-10 bg-card px-2">
        <div className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-t-lg',
          'bg-background text-sm font-mono'
        )}>
          <span className="text-foreground">{fileName}</span>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            ×
          </button>
        </div>
      </div>

      {/* Editor content */}
      <div className="flex-1 overflow-auto">
        <div className="flex min-h-full">
          {/* Line numbers */}
          <div className="flex-shrink-0 py-4 px-3 text-right select-none bg-card">
            {lines.map((_, index) => (
              <div
                key={index}
                className="text-xs font-mono text-text-muted leading-6"
              >
                {index + 1}
              </div>
            ))}
          </div>

          {/* Code content */}
          <pre className="flex-1 py-4 px-4 overflow-x-auto">
            <code className="text-sm font-mono leading-6">
              {lines.map((line, index) => (
                <div key={index} className="whitespace-pre">
                  {colorizeCode(line)}
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};

// Simple syntax highlighting for Python
function colorizeCode(line: string): React.ReactNode {
  const keywords = ['def', 'class', 'import', 'from', 'return', 'if', 'else', 'elif', 'for', 'while', 'try', 'except', 'with', 'as', 'in', 'not', 'and', 'or', 'True', 'False', 'None', 'async', 'await'];
  const builtins = ['print', 'len', 'range', 'str', 'int', 'float', 'list', 'dict', 'set', 'tuple', 'open', 'input'];

  // Handle comments
  if (line.trim().startsWith('#')) {
    return <span className="text-syntax-comment">{line}</span>;
  }

  // Handle strings
  if (line.includes('"') || line.includes("'")) {
    return <span>{highlightStrings(line, keywords, builtins)}</span>;
  }

  // Highlight keywords and builtins
  const parts = line.split(/(\s+)/);
  return parts.map((part, i) => {
    if (keywords.includes(part)) {
      return <span key={i} className="text-syntax-keyword">{part}</span>;
    }
    if (builtins.includes(part)) {
      return <span key={i} className="text-syntax-builtin">{part}</span>;
    }
    if (/^\d+$/.test(part)) {
      return <span key={i} className="text-syntax-number">{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
}

function highlightStrings(line: string, keywords: string[], builtins: string[]): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let currentIndex = 0;
  const regex = /(['"])(.*?)\1/g;
  let match;

  while ((match = regex.exec(line)) !== null) {
    // Add text before the string
    if (match.index > currentIndex) {
      const beforeText = line.slice(currentIndex, match.index);
      parts.push(...highlightKeywords(beforeText, keywords, builtins, parts.length));
    }
    // Add the string
    parts.push(
      <span key={`str-${match.index}`} className="text-syntax-string">
        {match[0]}
      </span>
    );
    currentIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (currentIndex < line.length) {
    parts.push(...highlightKeywords(line.slice(currentIndex), keywords, builtins, parts.length));
  }

  return parts;
}

function highlightKeywords(text: string, keywords: string[], builtins: string[], keyOffset: number): React.ReactNode[] {
  const words = text.split(/(\s+)/);
  return words.map((word, i) => {
    if (keywords.includes(word)) {
      return <span key={keyOffset + i} className="text-syntax-keyword">{word}</span>;
    }
    if (builtins.includes(word)) {
      return <span key={keyOffset + i} className="text-syntax-builtin">{word}</span>;
    }
    return <span key={keyOffset + i}>{word}</span>;
  });
}
