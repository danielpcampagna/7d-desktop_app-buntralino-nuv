# Component Structure & Patterns

## Modal Patterns

### Multi-Step Modal Pattern
Used by `CreateProjectModal` and `ImportProjectModal`.

```tsx
// State for step management
const [step, setStep] = useState<'step1' | 'step2' | 'step3'>('step1');
const [collectedData, setCollectedData] = useState({});

// Navigation handlers
const handleNext = () => setStep(nextStep);
const handlePrev = () => setStep(prevStep);

// Render based on step
return (
  <Dialog>
    <DialogContent>
      {/* Step indicator */}
      <div className="flex gap-2">
        {steps.map(s => (
          <div className={cn(
            "h-2 rounded-full",
            s === currentStep ? "bg-primary" : "bg-muted"
          )} />
        ))}
      </div>
      
      {/* Dynamic content */}
      {step === 'step1' && <Step1Content />}
      {step === 'step2' && <Step2Content />}
      
      {/* Navigation buttons */}
      <DialogFooter>
        {step !== 'step1' && <Button onClick={handlePrev}>Back</Button>}
        <Button onClick={handleNext}>
          {isLastStep ? 'Create' : 'Continue'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
```

### Dynamic Step Generation
`ImportProjectModal` generates steps dynamically based on import source:

```tsx
const steps = useMemo(() => {
  const baseSteps = ['source', 'location'];
  
  if (sourceConfig?.mode === 'convert') {
    baseSteps.push('target');
  }
  if (sourceConfig?.requiresEntryPoint) {
    baseSteps.push('config');
  }
  baseSteps.push('details');
  
  return baseSteps;
}, [sourceConfig]);
```

## Card Patterns

### Template Card (Selection Card)
Used for selectable items with visual feedback.

```tsx
const TemplateCard = ({ config, selected, onSelect }) => (
  <div
    className={cn(
      "p-4 rounded-lg border-2 cursor-pointer transition-all",
      selected 
        ? "border-primary bg-primary/5" 
        : "border-border hover:border-primary/50"
    )}
    onClick={onSelect}
  >
    {/* Icon */}
    <config.icon className="h-8 w-8 mb-3 text-primary" />
    
    {/* Title */}
    <h3 className="font-semibold">{config.name}</h3>
    
    {/* Description */}
    <p className="text-sm text-muted-foreground">{config.description}</p>
    
    {/* Category badge */}
    <Badge className={CATEGORY_COLORS[config.category]}>
      {CATEGORY_LABELS[config.category]}
    </Badge>
    
    {/* Feature indicator */}
    {config.supportsVisualEditor && (
      <span className="text-xs text-primary">Visual Editor</span>
    )}
  </div>
);
```

### Project Card (Display Card)
Used for displaying project information.

```tsx
const ProjectCard = ({ project }) => {
  const templateConfig = getTemplateConfig(project.template);
  const TemplateIcon = templateConfig?.icon || Package;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-2">
          <TemplateIcon className="h-5 w-5" />
          <CardTitle>{project.name}</CardTitle>
        </div>
        <Badge>{CATEGORY_LABELS[templateConfig?.category]}</Badge>
      </CardHeader>
      <CardContent>
        <p>{project.description}</p>
        {project.supportsVisualEditor && (
          <span>Visual Editor</span>
        )}
      </CardContent>
    </Card>
  );
};
```

## Form Input Patterns

### Standard Form Layout
```tsx
<div className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="name">Name</Label>
    <Input
      id="name"
      value={name}
      onChange={(e) => setName(e.target.value)}
      placeholder="Enter name"
    />
  </div>
  
  <div className="space-y-2">
    <Label htmlFor="description">Description</Label>
    <Textarea
      id="description"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      placeholder="Enter description"
    />
  </div>
</div>
```

### Preset Buttons Pattern
Used in `ImportProjectModal` for run command suggestions:

```tsx
<div className="flex flex-wrap gap-2">
  {UV_RUN_COMMAND_PRESETS.map(preset => (
    <Button
      key={preset.value}
      variant="outline"
      size="sm"
      onClick={() => setRunCommand(preset.value)}
      className={cn(runCommand === preset.value && "border-primary")}
    >
      {preset.label}
    </Button>
  ))}
</div>
```

## State Management with Zustand

### Store Structure
```tsx
// stores/workspaceStore.ts
interface WorkspaceStore {
  // State
  workspaces: Workspace[];
  projects: Project[];
  
  // Actions
  addWorkspace: (workspace: Omit<Workspace, 'id' | 'createdAt'>) => void;
  addProject: (workspaceId: string, project: Omit<Project, 'id' | 'createdAt'>) => void;
  getProjectsByWorkspace: (workspaceId: string) => Project[];
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  workspaces: mockWorkspaces,
  projects: mockProjects,
  
  addWorkspace: (workspace) => set((state) => ({
    workspaces: [...state.workspaces, {
      ...workspace,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }]
  })),
  
  addProject: (workspaceId, project) => set((state) => ({
    projects: [...state.projects, {
      ...project,
      id: generateId(),
      workspaceId,
      createdAt: new Date().toISOString(),
    }]
  })),
  
  getProjectsByWorkspace: (workspaceId) => 
    get().projects.filter(p => p.workspaceId === workspaceId),
}));
```

### Usage in Components
```tsx
const WorkspacePage = () => {
  const { addProject, getProjectsByWorkspace } = useWorkspaceStore();
  const projects = getProjectsByWorkspace(workspaceId);
  
  const handleCreate = (data) => {
    addProject(workspaceId, {
      name: data.name,
      description: data.description,
      template: data.template,
      supportsVisualEditor: getTemplateConfig(data.template)?.supportsVisualEditor,
    });
  };
};
```

## Styling Patterns

### Conditional Classes with cn()
```tsx
import { cn } from "@/lib/utils";

<div className={cn(
  "base-classes",
  condition && "conditional-classes",
  variant === 'primary' && "primary-classes",
  variant === 'secondary' && "secondary-classes"
)} />
```

### Category Color Maps
```tsx
export const CATEGORY_COLORS: Record<TemplateCategory, string> = {
  library: 'bg-blue-100 text-blue-800',
  api: 'bg-green-100 text-green-800',
  etl: 'bg-purple-100 text-purple-800',
  utilities: 'bg-orange-100 text-orange-800',
  generic: 'bg-gray-100 text-gray-800',
};
```

## Drag and Drop Pattern

Used in `ImportProjectModal` for file upload:

```tsx
const [isDragging, setIsDragging] = useState(false);

const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragging(true);
};

const handleDragLeave = () => setIsDragging(false);

const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragging(false);
  const file = e.dataTransfer.files[0];
  if (file) setSelectedFile(file);
};

<div
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  onDrop={handleDrop}
  className={cn(
    "border-2 border-dashed rounded-lg p-8 text-center",
    isDragging ? "border-primary bg-primary/5" : "border-muted"
  )}
>
  {selectedFile ? (
    <FileDisplay file={selectedFile} />
  ) : (
    <DropPrompt />
  )}
</div>
```
