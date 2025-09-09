import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  Clock, 
  Calendar, 
  BookOpen, 
  Target, 
  ArrowLeft,
  Settings,
  Smartphone,
  Mail,
  MessageSquare,
  Moon,
  Sun,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';
import { toast } from 'sonner';

interface LembreteConfig {
  id: string;
  tipo: 'estudo_diario' | 'plano_leitura' | 'desafio' | 'oracao' | 'jejum';
  titulo: string;
  descricao: string;
  ativo: boolean;
  horario: string;
  dias_semana: string[];
  metodo: 'push' | 'email' | 'sms';
  icone: React.ComponentType<any>;
  cor: string;
}

const JornadaLembretesPage: React.FC = () => {
  const navigate = useNavigate();
  const { pessoa } = useCurrentPerson();
  const [lembretes, setLembretes] = useState<LembreteConfig[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Lembretes Inteligentes | Jornada de Crescimento';
    
    // Configurações de lembretes padrão
    const lembretesDefault: LembreteConfig[] = [
      {
        id: '1',
        tipo: 'estudo_diario',
        titulo: 'Estudo Bíblico Diário',
        descricao: 'Lembrete para manter sua sequência de estudos',
        ativo: true,
        horario: '07:00',
        dias_semana: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'],
        metodo: 'push',
        icone: BookOpen,
        cor: 'text-blue-600'
      },
      {
        id: '2',
        tipo: 'plano_leitura',
        titulo: 'Plano de Leitura',
        descricao: 'Continue seu plano de leitura ativo',
        ativo: false,
        horario: '19:00',
        dias_semana: ['seg', 'ter', 'qua', 'qui', 'sex'],
        metodo: 'push',
        icone: Calendar,
        cor: 'text-green-600'
      },
      {
        id: '3',
        tipo: 'desafio',
        titulo: 'Desafios Semanais',
        descricao: 'Verificar progresso dos desafios gamificados',
        ativo: true,
        horario: '20:00',
        dias_semana: ['dom'],
        metodo: 'push',
        icone: Target,
        cor: 'text-purple-600'
      },
      {
        id: '4',
        tipo: 'oracao',
        titulo: 'Momento de Oração',
        descricao: 'Dedique tempo para oração e meditação',
        ativo: false,
        horario: '06:30',
        dias_semana: ['seg', 'qua', 'sex'],
        metodo: 'push',
        icone: Moon,
        cor: 'text-indigo-600'
      }
    ];
    
    setLembretes(lembretesDefault);
  }, []);

  const handleToggleLembrete = async (lembreteId: string) => {
    setLembretes(prev => 
      prev.map(lembrete => 
        lembrete.id === lembreteId 
          ? { ...lembrete, ativo: !lembrete.ativo }
          : lembrete
      )
    );

    const lembrete = lembretes.find(l => l.id === lembreteId);
    if (lembrete) {
      toast.success(
        lembrete.ativo 
          ? `Lembrete "${lembrete.titulo}" desativado` 
          : `Lembrete "${lembrete.titulo}" ativado`
      );
    }
  };

  const handleUpdateHorario = (lembreteId: string, novoHorario: string) => {
    setLembretes(prev => 
      prev.map(lembrete => 
        lembrete.id === lembreteId 
          ? { ...lembrete, horario: novoHorario }
          : lembrete
      )
    );
  };

  const getMetodoIcon = (metodo: string) => {
    switch (metodo) {
      case 'push': return Smartphone;
      case 'email': return Mail;
      case 'sms': return MessageSquare;
      default: return Bell;
    }
  };

  const diasSemanaTexto = {
    'seg': 'Segunda',
    'ter': 'Terça', 
    'qua': 'Quarta',
    'qui': 'Quinta',
    'sex': 'Sexta',
    'sab': 'Sábado',
    'dom': 'Domingo'
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
            <h1 className="text-3xl font-bold tracking-tight">Lembretes Inteligentes</h1>
            <p className="text-muted-foreground">
              Configure lembretes personalizados para manter sua jornada de crescimento.
            </p>
          </div>
        </div>

        {/* Status dos Lembretes */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Bell className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">Status dos Lembretes</h3>
                <p className="text-muted-foreground">
                  {lembretes.filter(l => l.ativo).length} de {lembretes.length} lembretes ativos
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {Math.round((lembretes.filter(l => l.ativo).length / lembretes.length) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Configurado</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Lembretes */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Configurar Lembretes</h2>
          
          {lembretes.map((lembrete) => {
            const IconeComponent = lembrete.icone;
            const MetodoIcon = getMetodoIcon(lembrete.metodo);
            
            return (
              <Card key={lembrete.id} className={`border-l-4 ${
                lembrete.ativo ? 'border-l-primary bg-primary/5' : 'border-l-muted'
              }`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full bg-muted ${lembrete.cor}`}>
                        <IconeComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {lembrete.titulo}
                          <Switch
                            checked={lembrete.ativo}
                            onCheckedChange={() => handleToggleLembrete(lembrete.id)}
                          />
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {lembrete.descricao}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Horário */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Horário
                      </label>
                      <input
                        type="time"
                        value={lembrete.horario}
                        onChange={(e) => handleUpdateHorario(lembrete.id, e.target.value)}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                        disabled={!lembrete.ativo}
                      />
                    </div>

                    {/* Método */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <MetodoIcon className="h-4 w-4" />
                        Método
                      </label>
                      <Badge variant="outline" className="justify-start p-2 w-full">
                        <MetodoIcon className="h-4 w-4 mr-2" />
                        {lembrete.metodo === 'push' ? 'Notificação' : 
                         lembrete.metodo === 'email' ? 'E-mail' : 'SMS'}
                      </Badge>
                    </div>

                    {/* Frequência */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Frequência
                      </label>
                      <div className="text-sm">
                        {lembrete.dias_semana.length === 7 ? 'Todos os dias' : 
                         lembrete.dias_semana.length === 1 ? 
                         diasSemanaTexto[lembrete.dias_semana[0] as keyof typeof diasSemanaTexto] :
                         `${lembrete.dias_semana.length} vezes/semana`}
                      </div>
                    </div>
                  </div>

                  {lembrete.ativo && (
                    <div className="flex flex-wrap gap-2">
                      {lembrete.dias_semana.map(dia => (
                        <Badge key={dia} variant="secondary" className="text-xs">
                          {diasSemanaTexto[dia as keyof typeof diasSemanaTexto]}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Dicas e Configurações Avançadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações Avançadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  Lembretes Inteligentes
                </h4>
                <p className="text-sm text-muted-foreground">
                  Os horários são ajustados automaticamente baseados no seu histórico de atividade
                  para maximizar o engajamento.
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Sun className="h-4 w-4 text-orange-600" />
                  Modo Não Perturbe
                </h4>
                <p className="text-sm text-muted-foreground">
                  Configure horários em que não deseja receber lembretes, 
                  como durante o sono ou trabalho.
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" className="flex-1">
                <Settings className="h-4 w-4 mr-2" />
                Configurações Avançadas
              </Button>
              <Button variant="outline" className="flex-1">
                <Bell className="h-4 w-4 mr-2" />
                Testar Lembretes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default JornadaLembretesPage;