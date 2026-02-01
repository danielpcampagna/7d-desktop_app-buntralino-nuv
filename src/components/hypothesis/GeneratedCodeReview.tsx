import { useState, useRef, useEffect } from 'react';
import {
  Code,
  GitBranch,
  Workflow,
  Send,
  Loader2,
  Check,
  RefreshCw,
  Copy,
  CheckCheck,
  Bot,
  User,
  History,
  ChevronDown,
  Sparkles,
  FileCode,
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import {
  Dataset,
  GeneratedPipeline,
  RefinementMessage,
  HypothesisETLTarget,
} from '@/types/hypothesis';
import {
  mockGeneratePipeline,
  mockRefinePipeline,
} from '@/services/mockHypothesisService';

interface GeneratedCodeReviewProps {
  datasets: Dataset[];
  targetTemplate: HypothesisETLTarget;
  hypothesisText: string;
  pipeline: GeneratedPipeline | null;
  isGenerating: boolean;
  onPipelineGenerated: (pipeline: GeneratedPipeline) => void;
  onCodeUpdated: (code: string) => void;
  onRefinementMessage: (message: RefinementMessage) => void;
  onFinalize: () => void;
  onSetGenerating: (isGenerating: boolean) => void;
}

type EditorView = 'code' | 'visual';

export const GeneratedCodeReview = ({
  datasets,
  targetTemplate,
  hypothesisText,
  pipeline,
  isGenerating,
  onPipelineGenerated,
  onCodeUpdated,
  onRefinementMessage,
  onFinalize,
  onSetGenerating,
}: GeneratedCodeReviewProps) => {
  const [editorView, setEditorView] = useState<EditorView>('code');
  const [refinementInput, setRefinementInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [pipeline?.refinementHistory]);

  // Generate initial pipeline
  const handleGenerate = async () => {
    if (!hypothesisText.trim()) return;

    onSetGenerating(true);
    try {
      const generatedPipeline = await mockGeneratePipeline(
        hypothesisText,
        datasets,
        targetTemplate
      );
      onPipelineGenerated(generatedPipeline);
    } finally {
      onSetGenerating(false);
    }
  };

  // Handle refinement request
  const handleRefine = async () => {
    if (!refinementInput.trim() || !pipeline || isRefining) return;

    const userMessage: RefinementMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: refinementInput.trim(),
      timestamp: new Date(),
    };

    onRefinementMessage(userMessage);
    setRefinementInput('');
    setIsRefining(true);

    try {
      const { code, message } = await mockRefinePipeline(
        pipeline.code,
        refinementInput,
        datasets,
        targetTemplate
      );

      onCodeUpdated(code);
      onRefinementMessage(message);
    } catch (error) {
      const errorMessage: RefinementMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error while refining the code. Please try again.',
        timestamp: new Date(),
      };
      onRefinementMessage(errorMessage);
    } finally {
      setIsRefining(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleRefine();
    }
  };

  const handleCopyCode = () => {
    if (pipeline?.code) {
      navigator.clipboard.writeText(pipeline.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const getTargetIcon = () => {
    switch (targetTemplate) {
      case 'dagster':
        return GitBranch;
      default:
        return Workflow;
    }
  };

  const TargetIcon = getTargetIcon();

  // No pipeline yet - show generation prompt
  if (!pipeline && !isGenerating) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="p-4 rounded-2xl bg-primary/10 mb-6">
          <FileCode className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Generate ETL Pipeline</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Based on your hypothesis, I'll generate a {targetTemplate.charAt(0).toUpperCase() + targetTemplate.slice(1)} ETL pipeline. You can then refine it through conversation.
        </p>

        <div className="p-4 rounded-lg bg-surface-elevated max-w-lg mb-6">
          <p className="text-sm text-muted-foreground mb-2">Your hypothesis:</p>
          <p className="text-sm line-clamp-4">{hypothesisText || 'No hypothesis provided'}</p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!hypothesisText.trim()}
          className={cn(
            'flex items-center gap-2 px-6 py-3 rounded-xl font-medium',
            'bg-primary text-primary-foreground',
            'hover:opacity-90 transition-opacity',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <Sparkles className="w-5 h-5" />
          Generate Pipeline
        </button>
      </div>
    );
  }

  // Generating state
  if (isGenerating) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <h2 className="text-lg font-semibold mb-2">Generating Pipeline</h2>
        <p className="text-muted-foreground">
          Creating your {targetTemplate} ETL pipeline...
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TargetIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Generated Pipeline</h2>
              <p className="text-sm text-muted-foreground">
                {targetTemplate.charAt(0).toUpperCase() + targetTemplate.slice(1)} • Version {pipeline?.version}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pipeline?.status === 'finalized' ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-medium">
                <Check className="w-4 h-4" />
                Finalized
              </span>
            ) : (
              <>
                <button
                  onClick={handleGenerate}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm',
                    'bg-surface-elevated text-foreground',
                    'hover:bg-surface-elevated/80 transition-colors'
                  )}
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </button>
                <button
                  onClick={onFinalize}
                  className={cn(
                    'flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium',
                    'bg-emerald-600 text-white',
                    'hover:bg-emerald-700 transition-colors'
                  )}
                >
                  <Check className="w-4 h-4" />
                  Accept & Finalize
                </button>
              </>
            )}
          </div>
        </div>

        {/* View tabs */}
        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-lg bg-surface-elevated p-1">
            <button
              onClick={() => setEditorView('code')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                editorView === 'code'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Code className="w-4 h-4" />
              Code
            </button>
            <button
              onClick={() => setEditorView('visual')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                editorView === 'visual'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <TargetIcon className="w-4 h-4" />
              Visual
            </button>
          </div>

          {pipeline && pipeline.refinementHistory.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
                showHistory
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <History className="w-4 h-4" />
              History ({pipeline.refinementHistory.length})
              <ChevronDown
                className={cn(
                  'w-4 h-4 transition-transform',
                  showHistory && 'rotate-180'
                )}
              />
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code/Visual editor */}
        <div className={cn('flex-1 overflow-hidden', showHistory && 'border-r border-border')}>
          {editorView === 'code' ? (
            <div className="h-full flex flex-col">
              {/* Code toolbar */}
              <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a2e] border-b border-border">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {targetTemplate === 'dagu' ? 'YAML' : 'Python'}
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copiedCode ? (
                    <>
                      <CheckCheck className="w-3 h-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              {/* Code content with syntax highlighting */}
              <div className="flex-1 overflow-auto bg-[#1a1a2e] [&>pre]:!m-0 [&>pre]:!rounded-none">
                <SyntaxHighlighter
                  language={targetTemplate === 'dagu' ? 'yaml' : 'python'}
                  style={oneDark}
                  customStyle={{
                    margin: 0,
                    padding: '1rem',
                    fontSize: '0.875rem',
                    background: 'transparent',
                    minHeight: '100%',
                  }}
                  showLineNumbers
                  wrapLongLines
                  codeTagProps={{ style: { fontFamily: 'ui-monospace, monospace' } }}
                >
                  {pipeline?.code ?? ''}
                </SyntaxHighlighter>
              </div>
            </div>
          ) : (
            <VisualPlaceholder targetTemplate={targetTemplate} />
          )}
        </div>

        {/* Refinement history panel */}
        {showHistory && (
          <div className="w-96 flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-card">
              <h3 className="font-medium">Refinement History</h3>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {pipeline?.refinementHistory.map((message) => (
                <div
                  key={message.id}
                  className={cn('flex gap-2', message.role === 'user' && 'flex-row-reverse')}
                >
                  <div
                    className={cn(
                      'w-6 h-6 rounded flex items-center justify-center flex-shrink-0',
                      message.role === 'user' ? 'bg-primary/10' : 'bg-surface-elevated'
                    )}
                  >
                    {message.role === 'user' ? (
                      <User className="w-3 h-3 text-primary" />
                    ) : (
                      <Bot className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                  <div
                    className={cn(
                      'max-w-[280px] px-3 py-2 rounded-lg text-sm overflow-hidden',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-surface-elevated'
                    )}
                  >
                    {message.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-strong:text-foreground prose-code:text-pink-400 prose-code:bg-surface-elevated prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    )}
                    <p className="text-xs opacity-60 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Refinement input */}
      {pipeline?.status !== 'finalized' && (
        <div className="p-4 border-t border-border bg-card">
          <div className="flex gap-3 max-w-3xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={refinementInput}
                onChange={(e) => setRefinementInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Request changes... (e.g., 'Add data validation', 'Use parallel processing')"
                rows={1}
                className={cn(
                  'w-full px-4 py-3 pr-12 rounded-xl resize-none',
                  'bg-surface-elevated',
                  'text-foreground placeholder:text-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50',
                  'transition-all'
                )}
                style={{ minHeight: '48px', maxHeight: '120px' }}
                disabled={isRefining}
              />
              <button
                onClick={handleRefine}
                disabled={!refinementInput.trim() || isRefining}
                className={cn(
                  'absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors',
                  refinementInput.trim() && !isRefining
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-surface-elevated text-muted-foreground'
                )}
              >
                {isRefining ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Describe changes you'd like to make to the generated code
          </p>
        </div>
      )}
    </div>
  );
};

// Visual placeholder component
const VisualPlaceholder = ({ targetTemplate }: { targetTemplate: HypothesisETLTarget }) => {
  const Icon = targetTemplate === 'dagster' ? GitBranch : Workflow;

  return (
    <div className="h-full flex flex-col items-center justify-center bg-background p-8">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <Icon className="w-8 h-8 text-primary" />
        </div>

        <h3 className="text-lg font-semibold mb-2">Visual DAG Editor</h3>

        <p className="text-sm text-muted-foreground mb-6">
          {targetTemplate.charAt(0).toUpperCase() + targetTemplate.slice(1)} workflows can be viewed and edited visually using a drag-and-drop interface.
        </p>

        <div className="flex flex-col gap-2 text-left bg-surface-elevated rounded-lg p-4">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Coming Soon
          </h4>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            View pipeline as visual graph
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Drag and drop workflow nodes
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Edit node configurations visually
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Real-time sync with code
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Switch to the <strong>Code</strong> tab to view and refine the pipeline code
        </p>
      </div>
    </div>
  );
};
