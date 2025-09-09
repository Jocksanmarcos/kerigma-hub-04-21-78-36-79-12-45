import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Bookmark, Copy, Share, CheckCircle, Star, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';
import { QuizInterface } from '@/components/jornada/QuizInterface';
import { QuizResultsModal } from '@/components/jornada/QuizResultsModal';

interface Versao {
  id: string;
  nome: string;
  abreviacao: string;
  descricao?: string;
  idioma: string;
}

interface Livro {
  id: string;
  versao_id: string;
  nome: string;
  abreviacao: string;
  testamento: string;
  ordinal: number;
}

interface Versiculo {
  versao_id: string;
  livro_id: string;
  capitulo: number;
  versiculo: number;
  texto: string;
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

export const LeitorBiblico: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pessoa } = useCurrentPerson();
  const [versoes, setVersoes] = useState<Versao[]>([]);
  const [livros, setLivros] = useState<Livro[]>([]);
  const [versiculos, setVersiculos] = useState<Versiculo[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [versaoSelecionada, setVersaoSelecionada] = useState<string>('');
  const [livroSelecionado, setLivroSelecionado] = useState<string>('');
  const [capitulo, setCapitulo] = useState(1);
  const [totalCapitulos, setTotalCapitulos] = useState(1);
  
  // Quiz states
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [processingQuiz, setProcessingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    carregarVersoes();
    carregarLivros();
  }, []);

  useEffect(() => {
    if (versaoSelecionada && livroSelecionado) {
      carregarVersiculos();
    }
  }, [versaoSelecionada, livroSelecionado, capitulo]);

  const carregarVersoes = async () => {
    const { data } = await supabase
      .from('biblia_versoes')
      .select('*')
      .order('nome');
    
    if (data?.length) {
      setVersoes(data);
      setVersaoSelecionada(data[0].id);
    }
  };

  const carregarLivros = async () => {
    const { data } = await supabase
      .from('biblia_livros')
      .select('*')
      .order('ordinal');
    
    if (data?.length) {
      setLivros(data);
      setLivroSelecionado(data[0].id);
    }
  };

  const carregarVersiculos = async () => {
    if (!versaoSelecionada || !livroSelecionado) return;
    
    setLoading(true);
    const { data } = await supabase
      .from('biblia_versiculos')
      .select('*')
      .eq('versao_id', versaoSelecionada)
      .eq('livro_id', livroSelecionado)
      .eq('capitulo', capitulo)
      .order('versiculo');
    
    if (data) {
      setVersiculos(data);
      // Buscar total de capítulos
      const { data: caps } = await supabase
        .from('biblia_versiculos')
        .select('capitulo')
        .eq('versao_id', versaoSelecionada)
        .eq('livro_id', livroSelecionado)
        .order('capitulo', { ascending: false })
        .limit(1);
      
      if (caps?.length) {
        setTotalCapitulos(caps[0].capitulo);
      }
    }
    setLoading(false);
  };

  const copiarVersiculo = (versiculo: Versiculo) => {
    const livroNome = livros.find(l => l.id === livroSelecionado)?.nome || '';
    const texto = `${versiculo.texto} - ${livroNome} ${capitulo}:${versiculo.versiculo}`;
    navigator.clipboard.writeText(texto);
    toast({ title: 'Versículo copiado!' });
  };

  const marcarCapituloComoLido = async () => {
    if (!versaoSelecionada || !livroSelecionado) return;
    
    try {
      const { data, error } = await supabase.rpc('marcar_capitulo_lido', {
        p_livro_id: livroSelecionado,
        p_capitulo: capitulo,
        p_versao_id: versaoSelecionada
      });

      if (error) throw error;

      if (data) {
        // Verificar se existe quiz para este capítulo
        const referenceId = `${livroAtual?.nome} ${capitulo}`;
        const hasQuiz = await checkForQuiz(referenceId);
        
        // Se não houver quiz, mostrar notificação de sucesso padrão
        if (!hasQuiz) {
          toast({ 
            title: '🎉 Capítulo marcado como lido!', 
            description: `Você ganhou 50 XP por ler ${livroAtual?.nome} ${capitulo}`,
          });
        }
      } else {
        toast({ 
          title: 'Erro ao marcar capítulo', 
          description: 'Tente novamente em alguns instantes.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erro ao marcar capítulo:', error);
      toast({ 
        title: 'Erro ao marcar capítulo', 
        description: 'Não foi possível registrar sua leitura.',
        variant: 'destructive'
      });
    }
  };

  const checkForQuiz = async (referenceId: string): Promise<boolean> => {
    try {
      const { data: quizData, error: quizError } = await supabase
        .from('biblia_quiz_perguntas')
        .select('*')
        .eq('reference_id', referenceId);

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
    if (!pessoa) return;
    
    try {
      setProcessingQuiz(true);
      
      const referenceId = `${livroAtual?.nome} ${capitulo}`;
      const { data: result, error } = await supabase.functions.invoke('processar-quiz', {
        body: {
          reference_id: referenceId,
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

  const livroAtual = livros.find(l => l.id === livroSelecionado);

  return (
    <div className="space-y-6">
      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-primary" />
              Leitor Bíblico
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/jornada/biblia/livros')}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Navegar por Livros
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Versão</label>
              <Select value={versaoSelecionada} onValueChange={setVersaoSelecionada}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma versão" />
                </SelectTrigger>
                <SelectContent>
                  {versoes.map(versao => (
                    <SelectItem key={versao.id} value={versao.id}>
                      {versao.nome} {versao.abreviacao ? `(${versao.abreviacao.toUpperCase()})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Livro</label>
              <Select value={livroSelecionado} onValueChange={setLivroSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um livro" />
                </SelectTrigger>
                <SelectContent>
                  {livros.map(livro => (
                    <SelectItem key={livro.id} value={livro.id}>
                      {livro.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Capítulo</label>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setCapitulo(Math.max(1, capitulo - 1))}
                  disabled={capitulo <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Badge variant="secondary" className="px-3 py-1">
                  {capitulo} / {totalCapitulos}
                </Badge>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setCapitulo(Math.min(totalCapitulos, capitulo + 1))}
                  disabled={capitulo >= totalCapitulos}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Texto Bíblico */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {livroAtual?.nome} {capitulo}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {versiculos.map((versiculo) => (
                <div 
                  key={`${versiculo.versao_id}-${versiculo.livro_id}-${versiculo.capitulo}-${versiculo.versiculo}`} 
                  className="group flex gap-3 p-2 rounded hover:bg-muted/50 transition-colors"
                >
                  <Badge variant="outline" className="shrink-0 mt-1">
                    {versiculo.versiculo}
                  </Badge>
                  <p className="flex-1 text-sm leading-relaxed">
                    {versiculo.texto}
                  </p>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copiarVersiculo(versiculo)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {/* Marcar Capítulo como Lido */}
              {versiculos.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <Button 
                    onClick={marcarCapituloComoLido}
                    className="w-full"
                    variant="default"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar {livroAtual?.nome} {capitulo} como lido (+50 XP)
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interface do Quiz */}
      {showQuiz && quizQuestions.length > 0 && (
        <div className="mt-6">
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
        chapterReference={`${livroAtual?.nome} ${capitulo}`}
      />
    </div>
  );
};