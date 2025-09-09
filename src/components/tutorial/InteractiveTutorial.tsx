import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play,
  Pause,
  SkipForward,
  CheckCircle,
  Circle,
  ArrowRight,
  X,
  Lightbulb,
  Navigation,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for highlighting
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
  validation?: () => boolean;
  optional?: boolean;
}

interface InteractiveTutorialProps {
  tutorialId: string;
  title: string;
  description: string;
  steps: TutorialStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  autoStart?: boolean;
}

export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
  tutorialId,
  title,
  description,
  steps,
  onComplete,
  onSkip,
  autoStart = false
}) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if tutorial was already completed
    const completed = localStorage.getItem(`tutorial-${tutorialId}-completed`);
    if (!completed && autoStart) {
      setIsActive(true);
    }
  }, [tutorialId, autoStart]);

  useEffect(() => {
    if (isActive && isPlaying) {
      highlightElement(steps[currentStep]?.target);
    } else {
      removeHighlight();
    }

    return () => removeHighlight();
  }, [isActive, isPlaying, currentStep, steps]);

  const highlightElement = (selector?: string) => {
    removeHighlight();
    
    if (!selector) return;

    const element = document.querySelector(selector);
    if (element) {
      element.classList.add('tutorial-highlight');
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const removeHighlight = () => {
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight');
    });
  };

  const startTutorial = () => {
    setIsActive(true);
    setIsPlaying(true);
    setCurrentStep(0);
    toast({
      title: "Tutorial iniciado! 🎯",
      description: "Siga os passos destacados para aprender a usar esta funcionalidade."
    });
  };

  const nextStep = () => {
    const currentStepData = steps[currentStep];
    
    // Validate step if validation function exists
    if (currentStepData.validation && !currentStepData.validation()) {
      toast({
        title: "Ação necessária",
        description: "Complete a ação atual antes de prosseguir.",
        variant: "destructive"
      });
      return;
    }

    // Mark step as completed
    setCompletedSteps(prev => new Set([...prev, currentStepData.id]));

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipStep = () => {
    const currentStepData = steps[currentStep];
    if (currentStepData.optional) {
      nextStep();
    }
  };

  const completeTutorial = () => {
    setIsActive(false);
    setIsPlaying(false);
    
    // Mark tutorial as completed
    localStorage.setItem(`tutorial-${tutorialId}-completed`, 'true');
    
    toast({
      title: "Tutorial concluído! 🎉",
      description: "Parabéns! Você aprendeu a usar esta funcionalidade."
    });

    onComplete?.();
    removeHighlight();
  };

  const skipTutorial = () => {
    setIsActive(false);
    setIsPlaying(false);
    localStorage.setItem(`tutorial-${tutorialId}-skipped`, 'true');
    onSkip?.();
    removeHighlight();
  };

  const pauseTutorial = () => {
    setIsPlaying(false);
    removeHighlight();
  };

  const resumeTutorial = () => {
    setIsPlaying(true);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  if (!isActive) {
    // Check if tutorial was completed or skipped
    const completed = localStorage.getItem(`tutorial-${tutorialId}-completed`);
    const skipped = localStorage.getItem(`tutorial-${tutorialId}-skipped`);
    
    if (completed || skipped) {
      return null; // Don't show tutorial trigger if already done
    }

    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-80 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">{title}</h4>
                <p className="text-xs text-muted-foreground mb-3">{description}</p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={startTutorial} className="gap-1">
                    <Play className="h-3 w-3" />
                    Iniciar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={skipTutorial}>
                    Pular
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Navigation className="h-5 w-5" />
              {title}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={skipTutorial}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Passo {currentStep + 1} de {steps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Current Step */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-full mt-1">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-2">{currentStepData.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {currentStepData.description}
                </p>
                
                {currentStepData.optional && (
                  <Badge variant="secondary" className="text-xs">
                    Opcional
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previousStep}
                >
                  Anterior
                </Button>
              )}
              
              {currentStepData.optional && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipStep}
                  className="gap-1"
                >
                  <SkipForward className="h-3 w-3" />
                  Pular
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isPlaying ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={pauseTutorial}
                  className="gap-1"
                >
                  <Pause className="h-3 w-3" />
                  Pausar
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resumeTutorial}
                  className="gap-1"
                >
                  <Play className="h-3 w-3" />
                  Continuar
                </Button>
              )}

              <Button
                onClick={nextStep}
                disabled={!isPlaying}
                className="gap-1"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    Concluir
                  </>
                ) : (
                  <>
                    Próximo
                    <ArrowRight className="h-3 w-3" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Steps List */}
          <div className="pt-4 border-t">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Progresso</h4>
              <div className="space-y-1">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-2 text-sm ${
                      index === currentStep ? 'text-primary font-medium' :
                      completedSteps.has(step.id) ? 'text-muted-foreground' :
                      'text-muted-foreground/60'
                    }`}
                  >
                    {completedSteps.has(step.id) ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : index === currentStep ? (
                      <Circle className="h-3 w-3 fill-primary text-primary" />
                    ) : (
                      <Circle className="h-3 w-3" />
                    )}
                    <span className="truncate">{step.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};