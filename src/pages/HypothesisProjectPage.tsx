import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  BarChart3,
  FileText,
  Code,
  Check,
  ChevronRight,
  FlaskConical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useHypothesisStore } from '@/stores/hypothesisStore';
import { mockFinalizeHypothesisToETL } from '@/services/mockHypothesisService';
import { BottomIsland } from '@/components/BottomIsland';
import { DatasetUploader } from '@/components/hypothesis/DatasetUploader';
import { DatasetProfilingViewer } from '@/components/hypothesis/DatasetProfilingViewer';
import { DataCleanupChat } from '@/components/hypothesis/DataCleanupChat';
import { HypothesisEditor } from '@/components/hypothesis/HypothesisEditor';
import { GeneratedCodeReview } from '@/components/hypothesis/GeneratedCodeReview';
import {
  Dataset,
  DatasetProfiling,
  DataCleanupOperation,
  GeneratedPipeline,
  HypothesisStep,
  HypothesisETLTarget,
  RefinementMessage,
} from '@/types/hypothesis';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/types/templates';
import { toast } from 'sonner';

const STEPS: { id: HypothesisStep; label: string; icon: typeof Upload }[] = [
  { id: 'datasets', label: 'Upload Datasets', icon: Upload },
  { id: 'profiling', label: 'Data Profiling', icon: BarChart3 },
  { id: 'hypothesis', label: 'Write Hypothesis', icon: FileText },
  { id: 'review', label: 'Review & Refine', icon: Code },
];

const HypothesisProjectPage = () => {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const { projects, workspaces, addProject, removeProject, setCurrentProject } = useWorkspaceStore();
  const {
    projects: hypothesisProjects,
    initializeProject,
    setCurrentStep,
    setTargetTemplate,
    addDataset,
    removeDataset,
    setActiveDataset,
    setProfiling,
    addCleanupOperation,
    updateCleanupStatus,
    setHypothesisContent,
    setGeneratedPipeline,
    updatePipelineCode,
    addRefinementMessage,
    finalizePipeline,
    setIsGenerating,
    canProceedToStep,
    removeHypothesisProject,
  } = useHypothesisStore();

  const [cleanupDatasetId, setCleanupDatasetId] = useState<string | null>(null);

  const project = projects.find((p) => p.id === projectId);
  const workspace = workspaces.find((w) => w.id === workspaceId);
  const hypothesisState = projectId ? hypothesisProjects[projectId] : undefined;

  // Initialize hypothesis project state
  useEffect(() => {
    if (projectId && !hypothesisState) {
      initializeProject(projectId, 'dagster');
    }
  }, [projectId, hypothesisState, initializeProject]);

  if (!project || !workspace || !hypothesisState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">
          {!project ? 'Project not found' : 'Loading...'}
        </p>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex((s) => s.id === hypothesisState.currentStep);

  const handleNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      const nextStep = STEPS[nextIndex].id;
      if (canProceedToStep(projectId!, nextStep)) {
        setCurrentStep(projectId!, nextStep);
      } else {
        toast.error('Complete the current step first');
      }
    }
  };

  const handlePrevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(projectId!, STEPS[prevIndex].id);
    }
  };

  const handleStepClick = (step: HypothesisStep) => {
    const targetIndex = STEPS.findIndex((s) => s.id === step);
    if (targetIndex <= currentStepIndex || canProceedToStep(projectId!, step)) {
      setCurrentStep(projectId!, step);
    }
  };

  // Cleanup chat handlers
  const cleanupDataset = hypothesisState.datasets.find((d) => d.id === cleanupDatasetId);
  const cleanupOperations = hypothesisState.cleanupOperations.filter(
    (op) => op.datasetId === cleanupDatasetId
  );

  if (cleanupDatasetId && cleanupDataset) {
    return (
      <DataCleanupChat
        dataset={cleanupDataset}
        operations={cleanupOperations}
        onAddOperation={(op) => addCleanupOperation(projectId!, op)}
        onUpdateOperationStatus={(opId, status) =>
          updateCleanupStatus(projectId!, opId, status)
        }
        onClose={() => setCleanupDatasetId(null)}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between h-12 px-4 bg-card border-b border-border">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/workspace/${workspaceId}`)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{workspace.name}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium font-mono">{project.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={cn(
            'px-2 py-0.5 rounded text-xs font-medium',
            CATEGORY_COLORS.hypothesis
          )}>
            {CATEGORY_LABELS.hypothesis}
          </span>

          <span className={cn(
            'px-2 py-0.5 rounded text-xs font-mono',
            'bg-surface-elevated text-muted-foreground'
          )}>
            Target: {hypothesisState.targetTemplate}
          </span>
        </div>
      </div>

      {/* Stepper */}
      <div className="px-6 py-4 bg-card border-b border-border">
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = step.id === hypothesisState.currentStep;
            const isCompleted = index < currentStepIndex;
            const canClick =
              index <= currentStepIndex || canProceedToStep(projectId!, step.id);

            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => handleStepClick(step.id)}
                  disabled={!canClick}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : isCompleted
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : canClick
                      ? 'bg-surface-elevated text-muted-foreground hover:text-foreground'
                      : 'bg-surface-elevated/50 text-muted-foreground/50 cursor-not-allowed'
                  )}
                >
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                      isActive
                        ? 'bg-white/20'
                        : isCompleted
                        ? 'bg-emerald-500/20'
                        : 'bg-surface-elevated'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="text-sm font-medium hidden md:block">
                    {step.label}
                  </span>
                  <StepIcon className="w-4 h-4 md:hidden" />
                </button>

                {index < STEPS.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-muted-foreground mx-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {hypothesisState.currentStep === 'datasets' && (
          <div className="h-full overflow-auto p-6">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Upload Your Datasets</h2>
                <p className="text-muted-foreground">
                  Upload the datasets you'll use in your ETL pipeline. Supported formats: CSV, Parquet, JSON, Excel.
                </p>
              </div>

              <DatasetUploader
                projectId={projectId!}
                datasets={hypothesisState.datasets}
                onDatasetAdded={(dataset) => addDataset(projectId!, dataset)}
                onDatasetRemoved={(datasetId) => removeDataset(projectId!, datasetId)}
              />
            </div>
          </div>
        )}

        {hypothesisState.currentStep === 'profiling' && (
          <DatasetProfilingViewer
            datasets={hypothesisState.datasets}
            profilings={hypothesisState.profilings}
            activeDatasetId={hypothesisState.activeDatasetId}
            onSetActiveDataset={(id) => setActiveDataset(projectId!, id)}
            onProfilingGenerated={(datasetId, profiling) =>
              setProfiling(projectId!, datasetId, profiling)
            }
            onOpenCleanup={setCleanupDatasetId}
          />
        )}

        {hypothesisState.currentStep === 'hypothesis' && (
          <HypothesisEditor
            datasets={hypothesisState.datasets}
            targetTemplate={hypothesisState.targetTemplate}
            value={hypothesisState.hypothesisContent}
            onChange={(content, plainText) =>
              setHypothesisContent(projectId!, content, plainText)
            }
            onTargetChange={(target) => setTargetTemplate(projectId!, target)}
          />
        )}

        {hypothesisState.currentStep === 'review' && (
          <GeneratedCodeReview
            datasets={hypothesisState.datasets}
            targetTemplate={hypothesisState.targetTemplate}
            hypothesisText={hypothesisState.hypothesisPlainText}
            pipeline={hypothesisState.generatedPipeline}
            isGenerating={hypothesisState.isGenerating}
            onPipelineGenerated={(pipeline) => setGeneratedPipeline(projectId!, pipeline)}
            onCodeUpdated={(code) => updatePipelineCode(projectId!, code)}
            onRefinementMessage={(message) => addRefinementMessage(projectId!, message)}
            onFinalize={async () => {
              try {
                const { newProject, docContent } = await mockFinalizeHypothesisToETL(
                  workspaceId!,
                  project!,
                  hypothesisState
                );
                finalizePipeline(projectId!);
                addProject(newProject);
                removeProject(projectId!);
                removeHypothesisProject(projectId!);
                setCurrentProject(newProject);
                navigate(`/workspace/${workspaceId}/project/${newProject.id}`);
                toast.success('Hypothesis converted to ETL project', {
                  description: `"${newProject.name}" is now a ${hypothesisState.targetTemplate} project. Documentation (${docContent.length} chars) is included.`,
                });
              } catch (err) {
                toast.error('Failed to finalize', {
                  description: err instanceof Error ? err.message : 'Please try again.',
                });
              }
            }}
            onSetGenerating={(generating) => setIsGenerating(projectId!, generating)}
          />
        )}
      </div>

      {/* Bottom navigation */}
      <div className="flex items-center justify-between px-6 py-4 bg-card border-t border-border">
        <button
          onClick={handlePrevStep}
          disabled={currentStepIndex === 0}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
            currentStepIndex === 0
              ? 'text-muted-foreground/50 cursor-not-allowed'
              : 'bg-surface-elevated text-foreground hover:bg-surface-elevated/80'
          )}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FlaskConical className="w-4 h-4" />
          Step {currentStepIndex + 1} of {STEPS.length}
        </div>

        {currentStepIndex < STEPS.length - 1 ? (
          <button
            onClick={handleNextStep}
            disabled={!canProceedToStep(projectId!, STEPS[currentStepIndex + 1]?.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
              canProceedToStep(projectId!, STEPS[currentStepIndex + 1]?.id)
                ? 'bg-primary text-primary-foreground hover:opacity-90'
                : 'bg-primary/50 text-primary-foreground/50 cursor-not-allowed'
            )}
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-24" /> // Spacer
        )}
      </div>
    </div>
  );
};

export default HypothesisProjectPage;
