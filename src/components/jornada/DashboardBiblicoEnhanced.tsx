import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Calendar, 
  Target, 
  TrendingUp, 
  Clock, 
  Star,
  ChevronRight,
  Flame,
  Trophy,
  Play
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStudyStreak } from '@/hooks/useStudyStreak';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';
import { supabase } from '@/integrations/supabase/client';

interface VersiculoDia {
  referencia: string;
  texto: string;
  tema: string;
}

interface LeituraRecomendada {
  titulo: string;
  referencia: string;
  descricao: string;
  tempo_estimado: number;
}

const DashboardBiblicoEnhanced: React.FC = () => {
  const { sequenciaAtual, melhorSequencia, diasEsteMes } = useStudyStreak();
  const { pessoa } = useCurrentPerson();
  const [loading, setLoading] = useState(false);
  const [livrosBiblia, setLivrosBiblia] = useState<any[]>([]);
  const [planosRecomendados, setPlanosRecomendados] = useState<any[]>([]);
  
  const [versiculoDia] = useState<VersiculoDia>({
    referencia: 'João 3:16',
    texto: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
    tema: 'Amor de Deus'
  });

  const [leiturasRecomendadas] = useState<LeituraRecomendada[]>([
    {
      titulo: 'Salmo do Dia',
      referencia: `Salmo ${new Date().getDate()}`,
      descricao: 'Salmo correspondente ao dia do mês atual',
      tempo_estimado: 5
    },
    {
      titulo: 'Provérbios da Sabedoria',
      referencia: `Provérbios ${new Date().getDate()}`,
      descricao: 'Sabedoria prática para o dia a dia',
      tempo_estimado: 3
    },
    {
      titulo: 'Evangelho de Marcos',
      referencia: 'Marcos 1:1-20',
      descricao: 'Continuando a jornada através dos Evangelhos',
      tempo_estimado: 8
    }
  ]);

  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      try {
        // Carregar livros da Bíblia via edge function
        const { data: livrosData, error: livrosError } = await supabase.functions
          .invoke('bible-import', {
            body: { action: 'getBooks', bibleId: 'de4e12af7f28f599-02' }
          });

        if (livrosError) {
          console.error('Erro ao carregar livros:', livrosError);
        } else if (livrosData?.books) {
          setLivrosBiblia(livrosData.books.slice(0, 6)); // Primeiros 6 livros
        }

        // Carregar planos de leitura recomendados do banco
        const { data: planosData, error: planosError } = await supabase
          .from('planos_de_leitura')
          .select('*')
          .eq('ativo', true)
          .limit(3);

        if (!planosError && planosData) {
          setPlanosRecomendados(planosData);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  const getMotivationalMessage = () => {
    if (sequenciaAtual === 0) {
      return "Comece hoje sua jornada de crescimento espiritual!";
    } else if (sequenciaAtual < 7) {
      return `Excelente! Você está no ${sequenciaAtual}º dia consecutivo.`;
    } else if (sequenciaAtual < 30) {
      return `Incrível! ${sequenciaAtual} dias de dedicação consecutiva!`;
    } else {
      return `Extraordinário! ${sequenciaAtual} dias seguidos de crescimento!`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com Versículo do Dia */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/5 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-blue-600" />
            Versículo do Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <blockquote className="text-lg italic text-center mb-4 text-primary">
            "{versiculoDia.texto}"
          </blockquote>
          <div className="text-center">
            <Badge variant="secondary">{versiculoDia.referencia}</Badge>
            <span className="text-sm text-muted-foreground ml-2">• {versiculoDia.tema}</span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold text-orange-600">{sequenciaAtual}</div>
            <div className="text-sm text-muted-foreground">Sequência Atual</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold text-yellow-600">{melhorSequencia}</div>
            <div className="text-sm text-muted-foreground">Melhor Sequência</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-600">{diasEsteMes}</div>
            <div className="text-sm text-muted-foreground">Dias Este Mês</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-600">
              {diasEsteMes > 0 ? Math.round((diasEsteMes / new Date().getDate()) * 100) : 0}%
            </div>
            <div className="text-sm text-muted-foreground">Consistência</div>
          </CardContent>
        </Card>
      </div>

      {/* Motivational Message */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-primary" />
            <p className="font-medium">{getMotivationalMessage()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Leituras Recomendadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-600" />
            Leituras Recomendadas para Hoje
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {leiturasRecomendadas.map((leitura, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-100">
                  <BookOpen className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium">{leitura.titulo}</h4>
                  <p className="text-sm text-muted-foreground">{leitura.referencia}</p>
                  <p className="text-xs text-muted-foreground">{leitura.descricao}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right text-sm text-muted-foreground">
                  <Clock className="h-3 w-3 inline mr-1" />
                  {leitura.tempo_estimado} min
                </div>
                <Button size="sm" variant="ghost" asChild>
                  <Link to="/jornada/biblia/livros">
                    <Play className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/jornada/planos-leitura" className="block">
            <CardContent className="p-6 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold mb-2">Planos de Leitura</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Jornadas estruturadas através das Escrituras
              </p>
              <div className="flex items-center justify-center text-sm text-blue-600">
                Ver Planos <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </CardContent>
          </Link>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/jornada/desafios" className="block">
            <CardContent className="p-6 text-center">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
              <h3 className="text-lg font-semibold mb-2">Desafios Bíblicos</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Gamificação para tornar o estudo mais dinâmico
              </p>
              <div className="flex items-center justify-center text-sm text-yellow-600">
                Participar <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Resumo do Progresso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Meta mensal (20 dias)</span>
              <span>{diasEsteMes} / 20 dias</span>
            </div>
            <Progress value={Math.min((diasEsteMes / 20) * 100, 100)} className="h-2" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="text-lg font-semibold text-green-600">
                {diasEsteMes >= 20 ? '✅' : '🎯'}
              </div>
              <div className="text-muted-foreground">Meta Mensal</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">
                {sequenciaAtual >= 7 ? '🔥' : '📈'}
              </div>
              <div className="text-muted-foreground">Sequência Semanal</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-purple-600">
                {melhorSequencia >= 30 ? '👑' : '⭐'}
              </div>
              <div className="text-muted-foreground">Conquista Especial</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardBiblicoEnhanced;