import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileWizardStep {
  title: string;
  content: React.ReactNode;
  isValid?: boolean;
}

interface MobileOptimizedFormProps {
  steps: MobileWizardStep[];
  onComplete: (data: any) => void;
  title?: string;
  className?: string;
  showProgress?: boolean;
}

export const MobileOptimizedForm: React.FC<MobileOptimizedFormProps> = ({
  steps,
  onComplete,
  title,
  className,
  showProgress = true
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (isLastStep) {
      onComplete(formData);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const canProceed = steps[currentStep]?.isValid !== false;

  return (
    <div className={cn("w-full", className)}>
      {/* Mobile: Full screen wizard */}
      <div className="block lg:hidden">
        <Card className="min-h-[80vh] flex flex-col">
          <CardHeader className="pb-4">
            {title && <CardTitle className="text-xl">{title}</CardTitle>}
            {showProgress && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Passo {currentStep + 1} de {steps.length}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
            <h3 className="text-lg font-medium">{steps[currentStep]?.title}</h3>
          </CardHeader>
          
          <CardContent className="flex-1 pb-6">
            <div className="space-y-6">
              {steps[currentStep]?.content}
            </div>
          </CardContent>
          
          {/* Navigation buttons */}
          <div className="p-6 pt-0 border-t border-border">
            <div className="flex justify-between gap-3">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isFirstStep}
                className="flex-1 h-12"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className="flex-1 h-12"
              >
                {isLastStep ? 'Finalizar' : 'Próximo'}
                {!isLastStep && <ChevronRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Desktop: Traditional form */}
      <div className="hidden lg:block">
        <Card>
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
          </CardHeader>
          <CardContent className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="space-y-4">
                <h3 className="text-lg font-medium border-b border-border pb-2">
                  {step.title}
                </h3>
                {step.content}
              </div>
            ))}
            <div className="pt-6">
              <Button onClick={() => onComplete(formData)} className="w-full">
                Salvar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Hook para gerenciar dados do formulário wizard
export const useMobileFormData = (initialData = {}) => {
  const [data, setData] = useState(initialData);

  const updateData = (stepData: any) => {
    setData(prev => ({ ...prev, ...stepData }));
  };

  const resetData = () => {
    setData(initialData);
  };

  return { data, updateData, resetData };
};