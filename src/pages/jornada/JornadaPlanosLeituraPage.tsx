import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Users, 
  Star, 
  CheckCircle2, 
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  Heart,
  Scroll
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';
import { useStudyStreak } from '@/hooks/useStudyStreak';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PlanoLeitura {
  id: string;
  titulo: string;
  descricao: string;
  duracao_dias: number;
  categoria: string;
  nivel: 'Iniciante' | 'Intermediário' | 'Avançado';
  icone: React.ComponentType<any>;
  cor: string;
  progresso: number;
  ativo: boolean;
  data_inicio?: string;
  leituras_diarias: string[];
}

const JornadaPlanosLeituraPage: React.FC = () => {
  const navigate = useNavigate();
  const { pessoa } = useCurrentPerson();
  const { diasEsteMes, registrarAtividade } = useStudyStreak();
  const [planos, setPlanos] = useState<PlanoLeitura[]>([]);
  const [planoAtivo, setPlanoAtivo] = useState<PlanoLeitura | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Planos de Leitura | Jornada de Crescimento';
    
    const fetchPlanosLeitura = async () => {
      try {
        setLoading(true);
        
        // Buscar planos de leitura do banco de dados
        const { data: planosData, error: planosError } = await supabase
          .from('planos_de_leitura')
          .select('*')
          .eq('ativo', true)
          .order('created_at', { ascending: false });

        if (planosError) {
          console.error('Erro ao carregar planos:', planosError);
          return;
        }

        // Buscar progresso do usuário se estiver logado
        let progressoData = [];
        if (pessoa?.id) {
          const { data, error } = await supabase
            .from('progresso_planos_leitura')
            .select('*')
            .eq('pessoa_id', pessoa.id);

          if (!error) {
            progressoData = data || [];
          }
        }

        // Mapear dados para o formato esperado
        const planosFormatados: PlanoLeitura[] = (planosData || []).map(plano => {
          const progresso = progressoData.find(p => p.plano_id === plano.id);
          const leiturasDiarias = Array.isArray(plano.lista_de_capitulos) 
            ? plano.lista_de_capitulos.slice(0, 3).map((item: any) => 
                `${item.livro} ${item.capitulo} - ${item.titulo || 'Leitura diária'}`
              )
            : [];

          return {
            id: plano.id,
            titulo: plano.titulo,
            descricao: plano.descricao || '',
            duracao_dias: plano.duracao_dias,
            categoria: plano.categoria,
            nivel: (plano.nivel === 'iniciante' ? 'Iniciante' : 
                   plano.nivel === 'intermediario' ? 'Intermediário' : 'Avançado') as 'Iniciante' | 'Intermediário' | 'Avançado',
            icone: plano.categoria === 'evangelhos' ? BookOpen : 
                   plano.categoria === 'salmos' ? Heart : 
                   plano.categoria === 'epistolas' ? Scroll : BookOpen,
            cor: plano.cor || 'text-blue-600',
            progresso: progresso ? Math.round((progresso.dia_atual / plano.duracao_dias) * 100) : 0,
            ativo: !!progresso && !progresso.concluido,
            data_inicio: progresso?.data_inicio,
            leituras_diarias: leiturasDiarias
          };
        });
        
        setPlanos(planosFormatados);
        setPlanoAtivo(planosFormatados.find(p => p.ativo) || null);
      } catch (error) {
        console.error('Erro ao carregar planos de leitura:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanosLeitura();
  }, [pessoa?.id, diasEsteMes]);

  const handleIniciarPlano = async (plano: PlanoLeitura) => {
    try {
      // Pausar plano ativo atual se houver
      if (planoAtivo) {
        setPlanos(prev => prev.map(p => 
          p.id === planoAtivo.id ? { ...p, ativo: false } : p
        ));
      }

      // Ativar novo plano
      const novoPlano = {
        ...plano,
        ativo: true,
        data_inicio: new Date().toISOString(),
        progresso: 0
      };

      setPlanos(prev => prev.map(p => 
        p.id === plano.id ? novoPlano : p
      ));
      setPlanoAtivo(novoPlano);

      await registrarAtividade('plano_iniciado');
      toast.success(`Plano "${plano.titulo}" iniciado!`, {
        description: `Você terá ${plano.duracao_dias} dias de leituras organizadas.`,
      });
    } catch (error) {
      toast.error('Erro ao iniciar plano');
    }
  };

  const handlePausarPlano = async (plano: PlanoLeitura) => {
    setPlanos(prev => prev.map(p => 
      p.id === plano.id ? { ...p, ativo: false } : p
    ));
    setPlanoAtivo(null);
    
    toast.info(`Plano "${plano.titulo}" pausado`, {
      description: 'Você pode retomar quando quiser.',
    });
  };

  const handleReiniciarPlano = async (plano: PlanoLeitura) => {
    const planoReiniciado = {
      ...plano,
      ativo: true,
      data_inicio: new Date().toISOString(),
      progresso: 0
    };

    setPlanos(prev => prev.map(p => 
      p.id === plano.id ? planoReiniciado : p
    ));
    setPlanoAtivo(planoReiniciado);

    await registrarAtividade('plano_reiniciado');
    toast.success(`Plano "${plano.titulo}" reiniciado!`);
  };

  const getLeituraHoje = (plano: PlanoLeitura): string => {
    if (!plano.data_inicio) return plano.leituras_diarias[0];
    
    const diasPassados = Math.floor(
      (Date.now() - new Date(plano.data_inicio).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const indice = Math.min(diasPassados, plano.leituras_diarias.length - 1);
    return plano.leituras_diarias[indice] || plano.leituras_diarias[0];
  };

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
            <h1 className="text-3xl font-bold tracking-tight">Planos de Leitura</h1>
            <p className="text-muted-foreground">
              Jornadas estruturadas para aprofundar seu conhecimento das Escrituras.
            </p>
          </div>
        </div>

        {/* Plano Ativo */}
        {planoAtivo && (
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                Plano Ativo: {planoAtivo.titulo}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{Math.round(planoAtivo.progresso)}%</div>
                  <div className="text-sm text-muted-foreground">Concluído</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {planoAtivo.duracao_dias - Math.floor(planoAtivo.progresso * planoAtivo.duracao_dias / 100)}
                  </div>
                  <div className="text-sm text-muted-foreground">Dias Restantes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{planoAtivo.categoria}</div>
                  <div className="text-sm text-muted-foreground">Categoria</div>
                </div>
              </div>
              
              <Progress value={planoAtivo.progresso} className="h-2" />
              
              <div className="bg-white/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Leitura de Hoje:</h4>
                <p className="text-lg font-semibold text-primary">{getLeituraHoje(planoAtivo)}</p>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={() => navigate('/jornada/biblia/livros')}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Ler Agora
                </Button>
                <Button variant="outline" onClick={() => handlePausarPlano(planoAtivo)}>
                  <Pause className="h-4 w-4 mr-2" />
                  Pausar
                </Button>
                <Button variant="outline" onClick={() => handleReiniciarPlano(planoAtivo)}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reiniciar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Planos Disponíveis */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Planos Disponíveis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {planos.map((plano) => (
              <Card key={plano.id} className={`${
                plano.ativo ? 'ring-2 ring-primary' : ''
              }`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full bg-muted ${plano.cor}`}>
                        <plano.icone className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {plano.titulo}
                          {plano.ativo && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                              Ativo
                            </Badge>
                          )}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {plano.categoria} • {plano.nivel}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{plano.descricao}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {plano.duracao_dias} dias
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      ~15 min/dia
                    </div>
                  </div>
                  
                  {plano.progresso > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>{Math.round(plano.progresso)}%</span>
                      </div>
                      <Progress value={plano.progresso} className="h-2" />
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {!plano.ativo ? (
                      <Button 
                        onClick={() => handleIniciarPlano(plano)}
                        className="w-full"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {plano.progresso > 0 ? 'Continuar' : 'Iniciar'}
                      </Button>
                    ) : (
                      <Button variant="secondary" className="w-full" disabled>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Em Andamento
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tips Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              Dicas para o Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
                <span>Escolha um horário fixo do dia para sua leitura</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
                <span>Faça anotações sobre insights importantes</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
                <span>Compartilhe reflexões com outros membros da comunidade</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
                <span>Use o recurso de lembretes para manter a consistência</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default JornadaPlanosLeituraPage;