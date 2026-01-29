import { useState } from 'react';
import { ChevronRight, File, Folder, FolderOpen } from 'lucide-react';
import { FileNode } from '@/types/workspace';
import { cn } from '@/lib/utils';

interface FileTreeItemProps {
  node: FileNode;
  depth: number;
  onSelect: (node: FileNode) => void;
  selectedPath?: string;
}

const FileTreeItem = ({ node, depth, onSelect, selectedPath }: FileTreeItemProps) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const isSelected = selectedPath === node.path;
  const isFolder = node.type === 'folder';

  const getFileIcon = (extension?: string) => {
    const iconClass = 'w-4 h-4';
    if (!extension) return <File className={cn(iconClass, 'text-muted-foreground')} />;
    
    const iconColors: Record<string, string> = {
      py: 'text-yellow-400',
      json: 'text-amber-400',
      md: 'text-blue-400',
      txt: 'text-text-muted',
      yml: 'text-pink-400',
      yaml: 'text-pink-400',
      toml: 'text-orange-400',
    };

    return <File className={cn(iconClass, iconColors[extension] || 'text-muted-foreground')} />;
  };

  return (
    <div>
      <button
        onClick={() => {
          if (isFolder) {
            setIsExpanded(!isExpanded);
          } else {
            onSelect(node);
          }
        }}
        className={cn(
          'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm',
          'hover:bg-surface-elevated transition-colors',
          isSelected && 'bg-primary/10 text-primary'
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isFolder && (
          <ChevronRight
            className={cn(
              'w-4 h-4 text-muted-foreground transition-transform',
              isExpanded && 'rotate-90'
            )}
          />
        )}
        {!isFolder && <span className="w-4" />}
        
        {isFolder ? (
          isExpanded ? (
            <FolderOpen className="w-4 h-4 text-primary" />
          ) : (
            <Folder className="w-4 h-4 text-primary" />
          )
        ) : (
          getFileIcon(node.extension)
        )}
        
        <span className="truncate font-mono text-xs">{node.name}</span>
      </button>

      {isFolder && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              selectedPath={selectedPath}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface FileTreeProps {
  files: FileNode[];
  onSelectFile: (node: FileNode) => void;
  selectedPath?: string;
}

export const FileTree = ({ files, onSelectFile, selectedPath }: FileTreeProps) => {
  return (
    <div className="py-2">
      {files.map((file) => (
        <FileTreeItem
          key={file.id}
          node={file}
          depth={0}
          onSelect={onSelectFile}
          selectedPath={selectedPath}
        />
      ))}
    </div>
  );
};
