import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, CheckCircle, Circle } from 'lucide-react';

interface QuizQuestion {
  id: string;
  reference_id: string;
  texto_pergunta: string;
  opcoes: Array<{
    id: string;
    texto: string;
  }>;
  resposta_correta: string;
}

interface QuizInterfaceProps {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  userAnswers: Record<string, string>;
  onAnswerSelect: (questionId: string, answerId: string) => void;
  onNext: () => void;
  onSubmitQuiz: () => void;
  isLastQuestion: boolean;
  isLoading?: boolean;
}

export const QuizInterface: React.FC<QuizInterfaceProps> = ({
  questions,
  currentQuestionIndex,
  userAnswers,
  onAnswerSelect,
  onNext,
  onSubmitQuiz,
  isLastQuestion,
  isLoading = false,
}) => {
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const selectedAnswer = userAnswers[currentQuestion.id];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Quiz de Conhecimento
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            Pergunta {currentQuestionIndex + 1} de {questions.length}
          </span>
        </div>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pergunta */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium leading-relaxed">
            {currentQuestion.texto_pergunta}
          </h3>
        </div>

        {/* Opções de Resposta */}
        <div className="space-y-3">
          {currentQuestion.opcoes.map((opcao) => (
            <Button
              key={opcao.id}
              variant={selectedAnswer === opcao.id ? "default" : "outline"}
              className="w-full justify-start text-left p-4 h-auto min-h-[60px]"
              onClick={() => onAnswerSelect(currentQuestion.id, opcao.id)}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="shrink-0">
                  {selectedAnswer === opcao.id ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium mb-1">Opção {opcao.id}</div>
                  <div className="text-sm opacity-90">{opcao.texto}</div>
                </div>
              </div>
            </Button>
          ))}
        </div>

        {/* Botão de Navegação */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={isLastQuestion ? onSubmitQuiz : onNext}
            disabled={!selectedAnswer || isLoading}
            size="lg"
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Processando...
              </div>
            ) : (
              isLastQuestion ? 'Ver Resultado' : 'Próxima Pergunta'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};