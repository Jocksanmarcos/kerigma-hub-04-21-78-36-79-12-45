import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Star, TrendingUp, CheckCircle } from 'lucide-react';
import { QuizResult } from '@/hooks/useQuizSession';
import { motion } from 'framer-motion';

interface QuizResultsProps {
  result: QuizResult;
  onClose: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({ result, onClose }) => {
  const percentual = result.total_perguntas > 0 
    ? Math.round((result.acertos / result.total_perguntas) * 100) 
    : 0;

  const getPerformanceMessage = () => {
    if (percentual >= 90) return 'Excelente! Você domina o assunto!';
    if (percentual >= 70) return 'Muito bem! Continue assim!';
    if (percentual >= 50) return 'Bom trabalho! Continue estudando!';
    return 'Continue se dedicando, você vai conseguir!';
  };

  const getPerformanceColor = () => {
    if (percentual >= 90) return 'text-green-600';
    if (percentual >= 70) return 'text-blue-600';
    if (percentual >= 50) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md"
      >
        <Card className="bg-gradient-to-br from-background to-background/80 border-2 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Trophy className="h-16 w-16 text-yellow-500" />
                {result.subiu_de_nivel && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute -top-2 -right-2"
                  >
                    <Star className="h-6 w-6 text-yellow-400 fill-current" />
                  </motion.div>
                )}
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              {result.subiu_de_nivel ? 'Nível Subiu!' : 'Quiz Concluído!'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Resultado Principal */}
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {result.acertos}/{result.total_perguntas}
              </div>
              <div className={`text-lg font-medium ${getPerformanceColor()}`}>
                {percentual}% de aproveitamento
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {getPerformanceMessage()}
              </p>
            </div>

            {/* Pontos Ganhos */}
            <div className="bg-primary/10 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="h-5 w-5 text-primary" />
                <span className="font-medium">Pontos de Sabedoria</span>
              </div>
              <div className="text-2xl font-bold text-primary">
                +{result.pontos_ganhos}
              </div>
              <div className="text-sm text-muted-foreground">
                Total: {result.novo_total_pontos} pontos
              </div>
            </div>

            {/* Level Up */}
            {result.subiu_de_nivel && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-4 text-center border border-yellow-500/30"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800 dark:text-yellow-200">
                    Parabéns! Nível Alcançado
                  </span>
                </div>
                <div className="text-xl font-bold text-yellow-800 dark:text-yellow-200">
                  {result.novo_nivel}
                </div>
              </motion.div>
            )}

            {/* Detalhes por Pergunta */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Acertos</span>
                </div>
                <div className="text-lg font-bold text-green-600">
                  {result.acertos}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="h-4 w-4 rounded-full bg-red-100 border-2 border-red-600"></span>
                  <span className="text-sm font-medium">Erros</span>
                </div>
                <div className="text-lg font-bold text-red-600">
                  {result.total_perguntas - result.acertos}
                </div>
              </div>
            </div>

            {/* Botão Continuar */}
            <Button 
              onClick={onClose}
              className="w-full mt-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              size="lg"
            >
              Continuar Jornada
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};