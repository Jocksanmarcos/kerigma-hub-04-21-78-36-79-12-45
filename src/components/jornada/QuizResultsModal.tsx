import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Award, Sparkles } from 'lucide-react';

interface QuizResult {
  correct_answers: number;
  total_questions: number;
  points_earned: number;
  percentage: number;
  badges_earned?: Array<{
    name: string;
    description: string;
    icon_url?: string;
  }>;
}

interface QuizResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: QuizResult | null;
  chapterReference: string;
}

export const QuizResultsModal: React.FC<QuizResultsModalProps> = ({
  isOpen,
  onClose,
  result,
  chapterReference,
}) => {
  if (!result) return null;

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 90) return "Excelente! Você domina este conteúdo!";
    if (percentage >= 70) return "Muito bom! Continue assim!";
    if (percentage >= 50) return "Bom trabalho! Continue estudando!";
    return "Continue se dedicando aos estudos!";
  };

  const getPerformanceIcon = (percentage: number) => {
    if (percentage >= 90) return <Trophy className="h-16 w-16 text-yellow-500" />;
    if (percentage >= 70) return <Award className="h-16 w-16 text-blue-500" />;
    return <Star className="h-16 w-16 text-purple-500" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Resultado do Quiz</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Ícone de Performance */}
          <div className="flex justify-center">
            {getPerformanceIcon(result.percentage)}
          </div>

          {/* Resultado Principal */}
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold">
              {result.correct_answers} de {result.total_questions}
            </h3>
            <p className="text-muted-foreground">
              {getPerformanceMessage(result.percentage)}
            </p>
            <div className="text-sm text-muted-foreground">
              Capítulo: {chapterReference}
            </div>
          </div>

          {/* Pontos Ganhos */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold text-primary">
                +{result.points_earned} Pontos de Sabedoria
              </span>
            </div>
          </div>

          {/* Medalhas/Badges (se houver) */}
          {result.badges_earned && result.badges_earned.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-center">Medalhas Desbloqueadas!</h4>
              <div className="space-y-2">
                {result.badges_earned.map((badge, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Award className="h-6 w-6 text-yellow-500" />
                    <div>
                      <div className="font-medium">{badge.name}</div>
                      <div className="text-sm text-muted-foreground">{badge.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Porcentagem */}
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {result.percentage.toFixed(0)}%
            </div>
            <div className="text-sm text-muted-foreground">
              Taxa de Acerto
            </div>
          </div>
        </div>

        {/* Botão Continuar */}
        <div className="flex justify-center pt-4">
          <Button 
            onClick={onClose} 
            size="lg"
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            Continuar Jornada
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};