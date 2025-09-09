import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, Send, RefreshCw, MessageSquare } from 'lucide-react';
import { useAIRecommendations } from '@/hooks/useAIRecommendations';
import { useToast } from '@/hooks/use-toast';

export const AIRecommendations: React.FC = () => {
  const { 
    recommendations, 
    loading, 
    error, 
    refreshRecommendations,
    askQuestion 
  } = useAIRecommendations();
  
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [showQuestionMode, setShowQuestionMode] = useState(false);
  const { toast } = useToast();

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    try {
      setAskingQuestion(true);
      const response = await askQuestion(question);
      setAiResponse(response);
      setQuestion('');
      toast({
        title: "Pergunta respondida!",
        description: "A IA analisou sua pergunta e gerou uma resposta.",
      });
    } catch (error) {
      console.error('Erro ao fazer pergunta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível obter resposta da IA.",
        variant: "destructive"
      });
    } finally {
      setAskingQuestion(false);
    }
  };

  const handleRefresh = () => {
    setAiResponse('');
    setShowQuestionMode(false);
    refreshRecommendations();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Assistente de Estudos (IA)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Assistente de Estudos (IA)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Conteúdo da IA */}
        <div className="min-h-[120px] p-4 bg-muted rounded-lg">
          {error ? (
            <p className="text-sm text-muted-foreground">
              Erro ao carregar recomendações da IA.
            </p>
          ) : aiResponse ? (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-primary mb-2">Resposta da IA:</h4>
              <div className="text-sm whitespace-pre-line">{aiResponse}</div>
            </div>
          ) : recommendations ? (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-primary mb-2">Recomendações Personalizadas:</h4>
              <div className="text-sm whitespace-pre-line">{recommendations}</div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhuma recomendação disponível no momento.
            </p>
          )}
        </div>

        {/* Modo de pergunta */}
        {showQuestionMode && (
          <div className="space-y-3">
            <Textarea
              placeholder="Faça uma pergunta sobre os cursos ou peça uma recomendação específica..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleAskQuestion}
                disabled={!question.trim() || askingQuestion}
                className="flex-1"
              >
                {askingQuestion ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {askingQuestion ? 'Processando...' : 'Perguntar'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowQuestionMode(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Botões de ação */}
        {!showQuestionMode && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowQuestionMode(true)}
              className="flex-1"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Fazer Pergunta
            </Button>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        )}

        {/* Dicas rápidas */}
        <div className="text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg">
          <strong>💡 Dicas:</strong> Pergunte sobre cursos específicos, peça recomendações baseadas em seu perfil, 
          ou solicite um plano de estudos personalizado.
        </div>
      </CardContent>
    </Card>
  );
};