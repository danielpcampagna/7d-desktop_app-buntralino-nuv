import { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Send,
  Loader2,
  Check,
  X,
  Copy,
  CheckCheck,
  Sparkles,
  Code,
  Bot,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dataset, DataCleanupOperation } from '@/types/hypothesis';
import { mockGenerateCleanupCode } from '@/services/mockHypothesisService';

interface DataCleanupChatProps {
  dataset: Dataset;
  operations: DataCleanupOperation[];
  onAddOperation: (operation: DataCleanupOperation) => void;
  onUpdateOperationStatus: (operationId: string, status: DataCleanupOperation['status']) => void;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  code?: string;
  operationId?: string;
  timestamp: Date;
}

export const DataCleanupChat = ({
  dataset,
  operations,
  onAddOperation,
  onUpdateOperationStatus,
  onClose,
}: DataCleanupChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'initial',
      role: 'assistant',
      content: `Hi! I can help you clean the **${dataset.name}** dataset. Describe what you'd like to fix or improve, and I'll generate the cleanup code for you.\n\nSome examples:\n- "Remove rows with missing values"\n- "Handle duplicate entries"\n- "Normalize the date columns"\n- "Remove outliers from numeric columns"`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);

    try {
      // Generate cleanup code
      const code = await mockGenerateCleanupCode(userMessage.content, dataset);

      // Create operation
      const operation: DataCleanupOperation = {
        id: `op-${Date.now()}`,
        datasetId: dataset.id,
        description: userMessage.content,
        code,
        appliedAt: new Date(),
        status: 'pending',
      };

      onAddOperation(operation);

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: `Here's the cleanup code based on your request. Review it and click **Apply** to execute it on your dataset.`,
        code,
        operationId: operation.id,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error generating the cleanup code. Please try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleApply = (operationId: string) => {
    onUpdateOperationStatus(operationId, 'applied');
    setMessages((prev) => [
      ...prev,
      {
        id: `applied-${Date.now()}`,
        role: 'assistant',
        content: `The cleanup operation has been applied to **${dataset.name}**. You can continue with more cleanup operations or go back to view the updated profiling.`,
        timestamp: new Date(),
      },
    ]);
  };

  const handleReject = (operationId: string) => {
    onUpdateOperationStatus(operationId, 'rejected');
    setMessages((prev) => [
      ...prev,
      {
        id: `rejected-${Date.now()}`,
        role: 'assistant',
        content: `No problem! The cleanup was not applied. Feel free to describe a different approach or ask for modifications.`,
        timestamp: new Date(),
      },
    ]);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getOperationStatus = (operationId: string) => {
    return operations.find((op) => op.id === operationId)?.status;
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-border bg-card">
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-surface-elevated transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Data Cleanup Assistant
          </h2>
          <p className="text-sm text-muted-foreground">
            Cleaning: {dataset.name}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="px-2 py-1 rounded bg-surface-elevated">
            {dataset.columns.length} columns
          </span>
          <span className="px-2 py-1 rounded bg-surface-elevated">
            {dataset.rowCount.toLocaleString()} rows
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3',
              message.role === 'user' ? 'flex-row-reverse' : ''
            )}
          >
            {/* Avatar */}
            <div
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                message.role === 'user'
                  ? 'bg-primary/10'
                  : 'bg-surface-elevated'
              )}
            >
              {message.role === 'user' ? (
                <User className="w-4 h-4 text-primary" />
              ) : (
                <Bot className="w-4 h-4 text-muted-foreground" />
              )}
            </div>

            {/* Content */}
            <div
              className={cn(
                'flex-1 max-w-2xl',
                message.role === 'user' ? 'text-right' : ''
              )}
            >
              <div
                className={cn(
                  'inline-block px-4 py-3 rounded-xl text-sm',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border'
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>

              {/* Code block */}
              {message.code && (
                <div className="mt-3 rounded-lg bg-[#1a1a2e] border border-border overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-[#16162a] border-b border-border">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Python
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyCode(message.code!)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copiedCode === message.code ? (
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
                  <pre className="p-4 overflow-x-auto text-sm text-gray-300">
                    <code>{message.code}</code>
                  </pre>

                  {/* Action buttons */}
                  {message.operationId && (
                    <div className="px-4 py-3 bg-[#16162a] border-t border-border">
                      {getOperationStatus(message.operationId) === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApply(message.operationId!)}
                            className={cn(
                              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
                              'bg-emerald-600 text-white',
                              'hover:bg-emerald-700 transition-colors'
                            )}
                          >
                            <Check className="w-4 h-4" />
                            Apply
                          </button>
                          <button
                            onClick={() => handleReject(message.operationId!)}
                            className={cn(
                              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
                              'bg-surface-elevated text-foreground',
                              'hover:bg-surface-elevated/80 transition-colors'
                            )}
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div
                          className={cn(
                            'flex items-center gap-2 text-sm',
                            getOperationStatus(message.operationId) === 'applied'
                              ? 'text-emerald-400'
                              : 'text-muted-foreground'
                          )}
                        >
                          {getOperationStatus(message.operationId) === 'applied' ? (
                            <>
                              <Check className="w-4 h-4" />
                              Applied
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4" />
                              Not applied
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-elevated flex items-center justify-center">
              <Bot className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-card border border-border">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                Generating cleanup code...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-3 max-w-3xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you want to clean or fix..."
              rows={1}
              className={cn(
                'w-full px-4 py-3 pr-12 rounded-xl resize-none',
                'bg-surface-elevated',
                'text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-primary/50',
                'transition-all'
              )}
              style={{ minHeight: '48px', maxHeight: '120px' }}
              disabled={isGenerating}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isGenerating}
              className={cn(
                'absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors',
                input.trim() && !isGenerating
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface-elevated text-muted-foreground'
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};
