import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bell, Clock, Calendar, Smartphone, Mail, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Lembrete {
  id: string;
  titulo: string;
  horario: string;
  dias_semana: string[];
  tipo_notificacao: 'push' | 'email' | 'ambos';
  ativo: boolean;
  mensagem_personalizada?: string;
}

const diasSemana = [
  { value: 'dom', label: 'Dom' },
  { value: 'seg', label: 'Seg' },
  { value: 'ter', label: 'Ter' },
  { value: 'qua', label: 'Qua' },
  { value: 'qui', label: 'Qui' },
  { value: 'sex', label: 'Sex' },
  { value: 'sab', label: 'Sáb' },
];

export const LembretesInteligentes: React.FC = () => {
  const { toast } = useToast();
  const [lembretes, setLembretes] = useState<Lembrete[]>([
    {
      id: '1',
      titulo: 'Devocional Matutino',
      horario: '07:00',
      dias_semana: ['seg', 'ter', 'qua', 'qui', 'sex'],
      tipo_notificacao: 'push',
      ativo: true,
      mensagem_personalizada: 'Comece seu dia com a Palavra de Deus! 📖'
    }
  ]);

  const [novoLembrete, setNovoLembrete] = useState<Partial<Lembrete>>({
    titulo: '',
    horario: '08:00',
    dias_semana: [],
    tipo_notificacao: 'push',
    ativo: true,
    mensagem_personalizada: ''
  });

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const adicionarLembrete = () => {
    if (!novoLembrete.titulo || !novoLembrete.horario || !novoLembrete.dias_semana?.length) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha título, horário e selecione pelo menos um dia.',
        variant: 'destructive'
      });
      return;
    }

    const lembrete: Lembrete = {
      id: Date.now().toString(),
      titulo: novoLembrete.titulo!,
      horario: novoLembrete.horario!,
      dias_semana: novoLembrete.dias_semana!,
      tipo_notificacao: novoLembrete.tipo_notificacao!,
      ativo: novoLembrete.ativo!,
      mensagem_personalizada: novoLembrete.mensagem_personalizada
    };

    setLembretes([...lembretes, lembrete]);
    setNovoLembrete({
      titulo: '',
      horario: '08:00',
      dias_semana: [],
      tipo_notificacao: 'push',
      ativo: true,
      mensagem_personalizada: ''
    });
    setMostrarFormulario(false);

    toast({
      title: 'Lembrete criado!',
      description: 'Seu lembrete foi configurado com sucesso.'
    });
  };

  const removerLembrete = (id: string) => {
    setLembretes(lembretes.filter(l => l.id !== id));
    toast({
      title: 'Lembrete removido',
      description: 'O lembrete foi excluído com sucesso.'
    });
  };

  const alternarLembrete = (id: string, ativo: boolean) => {
    setLembretes(lembretes.map(l => 
      l.id === id ? { ...l, ativo } : l
    ));
  };

  const toggleDiaSemana = (dia: string) => {
    const diasAtuais = novoLembrete.dias_semana || [];
    if (diasAtuais.includes(dia)) {
      setNovoLembrete({
        ...novoLembrete,
        dias_semana: diasAtuais.filter(d => d !== dia)
      });
    } else {
      setNovoLembrete({
        ...novoLembrete,
        dias_semana: [...diasAtuais, dia]
      });
    }
  };

  const getTipoNotificacaoIcon = (tipo: string) => {
    switch (tipo) {
      case 'push': return <Smartphone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'ambos': return <Bell className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const formatarDiasSemana = (dias: string[]) => {
    return dias.map(dia => diasSemana.find(d => d.value === dia)?.label).join(', ');
  };

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{lembretes.filter(l => l.ativo).length}</p>
                <p className="text-sm text-muted-foreground">Lembretes Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">85%</p>
                <p className="text-sm text-muted-foreground">Taxa de Leitura</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Dias Consecutivos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lembretes Existentes */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Meus Lembretes
            </CardTitle>
            <Button onClick={() => setMostrarFormulario(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Lembrete
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {lembretes.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum lembrete configurado</p>
            </div>
          ) : (
            lembretes.map((lembrete) => (
              <div key={lembrete.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getTipoNotificacaoIcon(lembrete.tipo_notificacao)}
                    <Switch
                      checked={lembrete.ativo}
                      onCheckedChange={(checked) => alternarLembrete(lembrete.id, checked)}
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{lembrete.titulo}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {lembrete.horario}
                      <span>•</span>
                      {formatarDiasSemana(lembrete.dias_semana)}
                    </div>
                    {lembrete.mensagem_personalizada && (
                      <p className="text-xs text-muted-foreground mt-1">
                        "{lembrete.mensagem_personalizada}"
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removerLembrete(lembrete.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Formulário de Novo Lembrete */}
      {mostrarFormulario && (
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Lembrete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="titulo">Título do Lembrete</Label>
              <Input
                id="titulo"
                value={novoLembrete.titulo}
                onChange={(e) => setNovoLembrete({ ...novoLembrete, titulo: e.target.value })}
                placeholder="Ex: Devocional da Tarde"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="horario">Horário</Label>
                <Input
                  id="horario"
                  type="time"
                  value={novoLembrete.horario}
                  onChange={(e) => setNovoLembrete({ ...novoLembrete, horario: e.target.value })}
                />
              </div>
              <div>
                <Label>Tipo de Notificação</Label>
                <Select
                  value={novoLembrete.tipo_notificacao}
                  onValueChange={(value: 'push' | 'email' | 'ambos') => 
                    setNovoLembrete({ ...novoLembrete, tipo_notificacao: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="push">Push Notification</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="ambos">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Dias da Semana</Label>
              <div className="flex gap-2 mt-2">
                {diasSemana.map((dia) => (
                  <Button
                    key={dia.value}
                    variant={novoLembrete.dias_semana?.includes(dia.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleDiaSemana(dia.value)}
                  >
                    {dia.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="mensagem">Mensagem Personalizada (Opcional)</Label>
              <Input
                id="mensagem"
                value={novoLembrete.mensagem_personalizada}
                onChange={(e) => setNovoLembrete({ ...novoLembrete, mensagem_personalizada: e.target.value })}
                placeholder="Ex: Hora do seu encontro com Deus! 🙏"
              />
            </div>

            <Separator />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setMostrarFormulario(false)}>
                Cancelar
              </Button>
              <Button onClick={adicionarLembrete}>
                Criar Lembrete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dicas */}
      <Card className="border-dashed">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Dicas para Lembretes Eficazes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <strong>🌅 Manhã (6h-9h):</strong> Ideal para começar o dia com reflexão e propósito.
            </div>
            <div>
              <strong>🌙 Noite (19h-22h):</strong> Perfeito para reflexão sobre o dia e gratidão.
            </div>
            <div>
              <strong>⏰ Consistência:</strong> Escolha horários que você consegue manter regularmente.
            </div>
            <div>
              <strong>📱 Notificações:</strong> Use mensagens personalizadas para maior motivação.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};