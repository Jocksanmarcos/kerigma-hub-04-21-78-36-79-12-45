import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, ArrowLeft, ChevronLeft, ChevronRight, Share, Copy, Trophy } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useJornadaProfile } from '@/hooks/useJornadaProfile';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';
import { QuizInterface } from '@/components/jornada/QuizInterface';
import { QuizResultsModal } from '@/components/jornada/QuizResultsModal';

interface ChapterContent {
  id: string;
  number: string;
  content: string;
  reference: string;
  copyright: string;
}

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

const BibliaLeituraPage: React.FC = () => {
  const navigate = useNavigate();
  const { chapterId } = useParams<{ chapterId: string }>();
  const { toast } = useToast();
  const [content, setContent] = useState<ChapterContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [registrandoLeitura, setRegistrandoLeitura] = useState(false);
  const { registrarLeitura, capitulos_lidos_ids } = useJornadaProfile();
  const { pessoa } = useCurrentPerson();
  
  // Quiz states
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [processingQuiz, setProcessingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  const jaLido = chapterId ? capitulos_lidos_ids.includes(chapterId) : false;

  useEffect(() => {
    if (chapterId) {
      loadChapterContent();
    }
  }, [chapterId]);

  const loadChapterContent = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('bible-import', {
        body: { 
          action: 'getChapterContent',
          chapterId
        }
      });

      if (error) throw error;

      if (data?.content) {
        setContent(data.content);
      }
      
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
      toast({
        title: 'Erro ao carregar capítulo',
        description: 'Não foi possível carregar o conteúdo do capítulo.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConcluirLeitura = async () => {
    if (!content || !chapterId || !registrarLeitura) return;
    
    try {
      setRegistrandoLeitura(true);
      
      // Extrair nome do livro e número do capítulo da referência
      const referenceParts = content.reference.split(' ');
      const bookName = referenceParts.slice(0, -1).join(' ');
      const chapterNumber = referenceParts[referenceParts.length - 1];
      
      await registrarLeitura(chapterId, bookName, chapterNumber);
      
      // Verificar se existe quiz para este capítulo
      const hasQuiz = await checkForQuiz(content.reference);
      
      // Se não houver quiz, mostrar notificação de sucesso padrão
      if (!hasQuiz) {
        toast({
          title: '🎉 Parabéns!',
          description: `Você leu ${bookName} ${chapterNumber} e ganhou 10 pontos de sabedoria!`,
          duration: 5000,
        });
      }
      
    } catch (error) {
      console.error('Erro ao registrar leitura:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar a leitura. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setRegistrandoLeitura(false);
    }
  };

  const checkForQuiz = async (reference: string): Promise<boolean> => {
    try {
      const { data: quizData, error: quizError } = await supabase
        .from('biblia_quiz_perguntas')
        .select('*')
        .eq('reference_id', reference);

      if (quizError) throw quizError;

      if (quizData && quizData.length > 0) {
        // Converter os dados do banco para o formato esperado
        const formattedQuestions: QuizQuestion[] = quizData.map(q => ({
          id: q.id,
          reference_id: q.reference_id,
          texto_pergunta: q.texto_pergunta,
          opcoes: Array.isArray(q.opcoes) ? q.opcoes : JSON.parse(q.opcoes as string),
          resposta_correta: q.resposta_correta
        }));
        
        setQuizQuestions(formattedQuestions);
        setShowQuiz(true);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        
        toast({
          title: '📚 Quiz Disponível!',
          description: 'Responda ao quiz para ganhar pontos extras de sabedoria!',
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao verificar quiz:', error);
      return false;
    }
  };

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!content || !pessoa) return;
    
    try {
      setProcessingQuiz(true);
      
      const { data: result, error } = await supabase.functions.invoke('processar-quiz', {
        body: {
          reference_id: content.reference,
          respostas: userAnswers,
          pessoa_id: pessoa.id
        }
      });

      if (error) throw error;

      if (result) {
        setQuizResult(result);
        setShowResults(true);
        setShowQuiz(false);
      }
      
    } catch (error) {
      console.error('Erro ao processar quiz:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível processar o quiz. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setProcessingQuiz(false);
    }
  };

  const handleCloseResults = () => {
    setShowResults(false);
    setShowQuiz(false);
    setQuizQuestions([]);
    setUserAnswers({});
    setQuizResult(null);
    setCurrentQuestionIndex(0);
  };

  const handleCopyContent = () => {
    if (content) {
      // Criar uma versão limpa do texto sem HTML
      const tempElement = document.createElement('div');
      tempElement.innerHTML = content.content;
      const cleanText = tempElement.textContent || tempElement.innerText || '';
      
      const textToCopy = `${content.reference}\n\n${cleanText}\n\n${content.copyright}`;
      navigator.clipboard.writeText(textToCopy);
      
      toast({
        title: 'Capítulo copiado!',
        description: 'O texto foi copiado para a área de transferência.'
      });
    }
  };

  const handleShare = async () => {
    if (content && navigator.share) {
      try {
        await navigator.share({
          title: content.reference,
          text: content.reference,
          url: window.location.href
        });
      } catch (error) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      handleCopyContent();
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {content ? content.reference : 'Carregando...'}
              </h1>
              <p className="text-muted-foreground">Leitura da Sagrada Escritura</p>
            </div>
          </div>
          
          {content && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyContent}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {content ? content.reference : 'Carregando capítulo...'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : content ? (
              <div className="space-y-6">
                <div 
                  className="prose prose-slate max-w-none dark:prose-invert
                             prose-headings:text-primary prose-p:leading-relaxed 
                             prose-p:text-base prose-strong:text-primary
                             [&_.v]:inline [&_.v]:mr-2 [&_.v]:text-sm 
                             [&_.v]:font-bold [&_.v]:text-primary
                             [&_.v]:bg-primary/10 [&_.v]:px-1.5 [&_.v]:py-0.5 
                             [&_.v]:rounded [&_.v]:border [&_.v]:border-primary/20"
                  dangerouslySetInnerHTML={{ __html: content.content }}
                />
                
                {content.copyright && (
                  <div className="mt-8 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      {content.copyright}
                    </p>
                  </div>
                )}

                {/* Botão Concluir Leitura */}
                <div className="mt-8 pt-6 border-t border-border">
                  <div className="flex flex-col items-center gap-4">
                    {jaLido ? (
                      <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                          <Trophy className="h-4 w-4" />
                          <span className="font-medium">Capítulo já lido!</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Você já ganhou pontos por este capítulo.
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Button 
                          onClick={handleConcluirLeitura} 
                          disabled={registrandoLeitura}
                          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                          size="lg"
                        >
                          {registrandoLeitura ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Registrando...
                            </>
                          ) : (
                            <>
                              <Trophy className="h-4 w-4 mr-2" />
                              Concluir Leitura (+10 pontos)
                            </>
                          )}
                        </Button>
                        <p className="text-sm text-muted-foreground mt-2">
                          Ganhe pontos de sabedoria por completar este capítulo!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">Não foi possível carregar o capítulo</p>
                <Button onClick={loadChapterContent}>
                  Tentar Novamente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Interface do Quiz */}
        {showQuiz && quizQuestions.length > 0 && (
          <div className="space-y-6">
            <QuizInterface
              questions={quizQuestions}
              currentQuestionIndex={currentQuestionIndex}
              userAnswers={userAnswers}
              onAnswerSelect={handleAnswerSelect}
              onNext={handleNextQuestion}
              onSubmitQuiz={handleSubmitQuiz}
              isLastQuestion={currentQuestionIndex === quizQuestions.length - 1}
            />
          </div>
        )}

        {/* Modal de Resultados */}
        <QuizResultsModal
          isOpen={showResults}
          onClose={handleCloseResults}
          result={quizResult}
          chapterReference={content?.reference || ''}
        />

        {/* Navegação entre capítulos */}
        {content && !showQuiz && (
          <div className="flex justify-between">
            <Button variant="outline">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Capítulo Anterior
            </Button>
            <Button variant="outline">
              Próximo Capítulo
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default BibliaLeituraPage;