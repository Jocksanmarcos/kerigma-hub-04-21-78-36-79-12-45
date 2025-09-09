import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  Clock, 
  Users, 
  Star, 
  CheckCircle2, 
  ArrowLeft,
  Zap,
  Calendar,
  BookOpen,
  Award,
  Flame
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';
import { useStudyStreak } from '@/hooks/useStudyStreak';
import { toast } from 'sonner';

interface Desafio {
  id: string;
  titulo: string;
  descricao: string;
  objetivo: number;
  progresso: number;
  tipo: 'sequencia' | 'leitura' | 'tempo' | 'capitulos';
  icone: React.ComponentType<any>;
  cor: string;
  premio: string;
  concluido: boolean;
}

const JornadaDesafiosPage: React.FC = () => {
  const navigate = useNavigate();
  const { pessoa } = useCurrentPerson();
  const { sequenciaAtual, diasEsteMes, registrarAtividade } = useStudyStreak();
  const [desafiosAtivos, setDesafiosAtivos] = useState<Desafio[]>([]);

  useEffect(() => {
    document.title = 'Desafios Gamificados | Jornada de Crescimento';
    
    // Simular desafios baseados no progresso real do usuário
    const desafios: Desafio[] = [
      {
        id: '1',
        titulo: 'Sequência de 7 Dias',
        descricao: 'Estude por 7 dias consecutivos',
        objetivo: 7,
        progresso: sequenciaAtual,
        tipo: 'sequencia',
        icone: Flame,
        cor: 'text-orange-600',
        premio: '100 XP + Badge "Disciplinado"',
        concluido: sequenciaAtual >= 7
      },
      {
        id: '2',
        titulo: 'Explorador das Escrituras',
        descricao: 'Leia 10 capítulos diferentes da Bíblia',
        objetivo: 10,
        progresso: Math.min(diasEsteMes, 10),
        tipo: 'capitulos',
        icone: BookOpen,
        cor: 'text-blue-600',
        premio: '150 XP + Badge "Explorador"',
        concluido: diasEsteMes >= 10
      },
      {
        id: '3',
        titulo: 'Mestre da Consistência',
        descricao: 'Estude por 15 dias neste mês',
        objetivo: 15,
        progresso: diasEsteMes,
        tipo: 'leitura',
        icone: Calendar,
        cor: 'text-green-600',
        premio: '200 XP + Badge "Mestre"',
        concluido: diasEsteMes >= 15
      },
      {
        id: '4',
        titulo: 'Velocista da Fé',
        descricao: 'Complete 3 estudos em um dia',
        objetivo: 3,
        progresso: 0, // Seria baseado em atividades do dia
        tipo: 'tempo',
        icone: Zap,
        cor: 'text-purple-600',
        premio: '75 XP + Badge "Velocista"',
        concluido: false
      }
    ];
    
    setDesafiosAtivos(desafios);
  }, [sequenciaAtual, diasEsteMes]);

  const handleParticiparDesafio = async (desafio: Desafio) => {
    if (desafio.concluido) {
      toast.success('Desafio já concluído!', {
        description: `Parabéns! Você ganhou: ${desafio.premio}`,
      });
      return;
    }

    // Registrar participação no desafio
    try {
      await registrarAtividade('desafio_iniciado');
      toast.success('Desafio aceito!', {
        description: `Continue progredindo para ganhar: ${desafio.premio}`,
      });
    } catch (error) {
      toast.error('Erro ao aceitar desafio');
    }
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
            <h1 className="text-3xl font-bold tracking-tight">Desafios Gamificados</h1>
            <p className="text-muted-foreground">
              Transforme seu estudo em uma jornada emocionante de conquistas.
            </p>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <div className="text-2xl font-bold">
                {desafiosAtivos.filter(d => d.concluido).length}
              </div>
              <div className="text-sm text-muted-foreground">Concluídos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{desafiosAtivos.length}</div>
              <div className="text-sm text-muted-foreground">Disponíveis</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{sequenciaAtual}</div>
              <div className="text-sm text-muted-foreground">Sequência Atual</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{diasEsteMes}</div>
              <div className="text-sm text-muted-foreground">Dias Este Mês</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Desafios */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Desafios Ativos</h2>
          
          {desafiosAtivos.map((desafio) => (
            <Card key={desafio.id} className={`border-l-4 ${
              desafio.concluido ? 'border-l-green-500 bg-green-50/50' : 'border-l-primary'
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full bg-muted ${desafio.cor}`}>
                      <desafio.icone className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {desafio.titulo}
                        {desafio.concluido && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Concluído
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {desafio.descricao}
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleParticiparDesafio(desafio)}
                    variant={desafio.concluido ? "secondary" : "default"}
                    size="sm"
                  >
                    {desafio.concluido ? (
                      <>
                        <Award className="h-4 w-4 mr-2" />
                        Concluído
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4 mr-2" />
                        Participar
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{desafio.progresso} / {desafio.objetivo}</span>
                  </div>
                  <Progress 
                    value={(desafio.progresso / desafio.objetivo) * 100} 
                    className="h-2" 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <Trophy className="h-4 w-4 inline mr-1" />
                    Prêmio: {desafio.premio}
                  </div>
                  <Badge variant="outline">
                    {Math.round((desafio.progresso / desafio.objetivo) * 100)}% completo
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Continue Progredindo!</h3>
            <p className="text-muted-foreground mb-4">
              Cada dia de estudo te aproxima de novas conquistas e crescimento espiritual.
            </p>
            <div className="flex gap-2 justify-center">
              <Button asChild>
                <Button onClick={() => navigate('/jornada/biblia')}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Estudar Agora
                </Button>
              </Button>
              <Button asChild variant="outline">
                <Button onClick={() => navigate('/jornada/ranking')}>
                  <Users className="h-4 w-4 mr-2" />
                  Ver Ranking
                </Button>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default JornadaDesafiosPage;