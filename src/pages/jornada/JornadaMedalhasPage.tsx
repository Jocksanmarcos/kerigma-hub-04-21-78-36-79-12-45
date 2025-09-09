import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Award, Trophy, Star, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';

interface Medalha {
  id: string;
  tipo_conquista: string;
  pontos_ganhos: number;
  detalhes: any;
  created_at: string;
}

const JornadaMedalhasPage: React.FC = () => {
  const [medalhas, setMedalhas] = useState<Medalha[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { pessoa } = useCurrentPerson();

  useEffect(() => {
    document.title = 'Medalhas | Jornada de Crescimento';
    if (pessoa?.id) {
      fetchMedalhas();
    }
  }, [pessoa]);

  const fetchMedalhas = async () => {
    if (!pessoa?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('conquistas_ensino')
        .select('*')
        .eq('pessoa_id', pessoa.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedalhas(data || []);
    } catch (error) {
      console.error('Erro ao carregar medalhas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalhaIcon = (tipo: string) => {
    switch (tipo) {
      case 'curso_concluido': return <Trophy className="h-8 w-8 text-yellow-600" />;
      case 'trilha_concluida': return <Award className="h-8 w-8 text-purple-600" />;
      case 'licao_completa': return <BookOpen className="h-8 w-8 text-blue-600" />;
      case 'estudo_biblico': return <Star className="h-8 w-8 text-green-600" />;
      default: return <Award className="h-8 w-8 text-gray-600" />;
    }
  };

  const getMedalhaTitulo = (medalha: Medalha) => {
    const detalhes = medalha.detalhes;
    switch (medalha.tipo_conquista) {
      case 'curso_concluido':
        return detalhes?.badge_obtido || 'Curso Concluído';
      case 'trilha_concluida':
        return 'Mestre da Trilha';
      case 'licao_completa':
        return 'Estudante Dedicado';
      case 'estudo_biblico':
        return 'Leitor da Palavra';
      default:
        return 'Conquista';
    }
  };

  const getMedalhaDescricao = (medalha: Medalha) => {
    const detalhes = medalha.detalhes;
    switch (medalha.tipo_conquista) {
      case 'curso_concluido':
        return `Curso: ${detalhes?.curso_nome || 'Curso'}`;
      case 'trilha_concluida':
        return `Trilha: ${detalhes?.trilha_nome || 'Trilha de Formação'}`;
      case 'licao_completa':
        return `Lição: ${detalhes?.licao_nome || 'Lição'}`;
      case 'estudo_biblico':
        return 'Estudo bíblico concluído';
      default:
        return 'Conquista alcançada';
    }
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalXP = medalhas.reduce((acc, medalha) => acc + medalha.pontos_ganhos, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/jornada')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Minhas Medalhas</h1>
            <p className="text-muted-foreground">
              Acompanhe suas conquistas e reconhecimentos na jornada.
            </p>
          </div>
        </div>

        {/* Resumo */}
        <Card className="bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Resumo das Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{medalhas.length}</div>
                <div className="text-sm text-muted-foreground">Total de Medalhas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{totalXP.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">XP Total Ganho</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {new Set(medalhas.map(m => m.tipo_conquista)).size}
                </div>
                <div className="text-sm text-muted-foreground">Tipos Diferentes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Medalhas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              Suas Medalhas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border rounded-md">
                    <div className="w-16 h-16 bg-muted animate-pulse rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted animate-pulse rounded w-1/3"></div>
                      <div className="h-3 bg-muted animate-pulse rounded w-1/2"></div>
                    </div>
                    <div className="h-6 bg-muted animate-pulse rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : medalhas.length > 0 ? (
              <div className="space-y-4">
                {medalhas.map((medalha) => (
                  <div
                    key={medalha.id}
                    className="flex items-center space-x-4 p-4 border rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {getMedalhaIcon(medalha.tipo_conquista)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{getMedalhaTitulo(medalha)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {getMedalhaDescricao(medalha)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatarData(medalha.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">
                        +{medalha.pontos_ganhos} XP
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma medalha ainda</h3>
                <p className="text-muted-foreground mb-4">
                  Complete cursos e atividades para ganhar suas primeiras medalhas!
                </p>
                <Button asChild>
                  <span onClick={() => navigate('/jornada/trilhas')}>
                    Explorar Cursos
                  </span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default JornadaMedalhasPage;