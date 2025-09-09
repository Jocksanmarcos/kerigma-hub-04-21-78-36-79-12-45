import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Clock, AlertCircle, Plus, FileText, PhoneCall } from 'lucide-react';
import { RelatorioSemanalDialog } from './RelatorioSemanalDialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MembroCelula {
  id: string;
  nome_completo: string;
  telefone: string;
  funcao: string;
  status: string;
}

interface ProximaReuniao {
  data: string;
  horario: string;
  endereco: string;
  tema: string;
  presencaEsperada: number;
}

async function fetchDadosLiderCelula() {
  // Buscar membros da célula do líder atual (usando dados simulados enquanto não há relação)
  const membrosSimulados: MembroCelula[] = [
    {
      id: '1',
      nome_completo: 'Ana Silva',
      telefone: '(11) 99999-1111',
      funcao: 'Co-líder',
      status: 'ativo'
    },
    {
      id: '2', 
      nome_completo: 'João Santos',
      telefone: '(11) 99999-2222',
      funcao: 'Membro',
      status: 'ativo'
    }
  ];

  // Buscar próxima reunião (simulado por enquanto)
  const proximaReuniao: ProximaReuniao = {
    data: 'Quinta-feira',
    horario: '19:30',
    endereco: 'Rua das Flores, 123 - Jardim Europa',
    tema: 'O Poder da Oração',
    presencaEsperada: 12
  };

  return {
    membros: membrosSimulados,
    proximaReuniao
  };
}

const handleWhatsAppContact = (telefone: string, nome: string) => {
  if (!telefone) {
    toast.error('Telefone não disponível');
    return;
  }
  
  const numeroLimpo = telefone.replace(/\D/g, '');
  const mensagem = encodeURIComponent(`Olá ${nome}! Tudo bem? Lembrando da nossa reunião de célula hoje. Nos vemos lá! 🙏`);
  const url = `https://wa.me/55${numeroLimpo}?text=${mensagem}`;
  
  window.open(url, '_blank');
};

const handlePhoneCall = (telefone: string) => {
  if (!telefone) {
    toast.error('Telefone não disponível');
    return;
  }
  
  window.open(`tel:${telefone}`, '_self');
};

export const DashboardLiderCelula: React.FC = () => {
  const [showRelatorio, setShowRelatorio] = useState(false);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['lider-celula-data'],
    queryFn: fetchDadosLiderCelula,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  if (error) {
    toast.error('Erro ao carregar dados da célula');
  }

  return (
    <div className="space-y-6">
      {/* Próxima Reunião */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Próxima Reunião</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">
                {isLoading ? 'Carregando...' : `${data?.proximaReuniao.data}, ${data?.proximaReuniao.horario}`}
              </p>
              <p className="text-muted-foreground">
                {data?.proximaReuniao.endereco || 'Endereço não disponível'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Tema: "{data?.proximaReuniao.tema || 'Tema não definido'}"
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Presença esperada</p>
              <p className="text-xl font-bold text-emerald-600">
                {data?.proximaReuniao.presencaEsperada || 0} pessoas
              </p>
            </div>
          </div>
          <div className="flex space-x-2 mt-4">
            <Button size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Confirmar Reunião
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                data?.membros.forEach(membro => {
                  handleWhatsAppContact(membro.telefone, membro.nome_completo);
                });
                toast.success('Abrindo WhatsApp para todos os membros');
              }}
            >
              <PhoneCall className="h-4 w-4 mr-2" />
              Lembrete WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Meus Membros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Meus Membros</span>
              <Badge variant="secondary">{isLoading ? '...' : data?.membros.length || 0}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center text-muted-foreground py-4">
                  Carregando membros...
                </div>
              ) : data?.membros.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  Nenhum membro encontrado
                </div>
              ) : (
                data?.membros.map((membro) => (
                  <div key={membro.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">{membro.nome_completo}</p>
                      <p className="text-sm text-muted-foreground">{membro.funcao}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={membro.status === 'ativo' ? 'default' : 'destructive'}>
                        {membro.status}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handlePhoneCall(membro.telefone)}
                        disabled={!membro.telefone}
                      >
                        <PhoneCall className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button className="w-full mt-4" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Membro
            </Button>
          </CardContent>
        </Card>

        {/* Alertas Inteligentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Alertas Inteligentes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-orange-800 dark:text-orange-200">Relatório Pendente</span>
                </div>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  Relatório da reunião de quinta-feira ainda não foi enviado
                </p>
                <Button size="sm" className="mt-2" onClick={() => setShowRelatorio(true)}>
                  Enviar Agora
                </Button>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800 dark:text-blue-200">Aniversariante</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Ana Costa faz aniversário amanhã (15/12)
                </p>
                <Button size="sm" variant="outline" className="mt-2">
                  Enviar Parabéns
                </Button>
              </div>

              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-800 dark:text-red-200">Membro Ausente</span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Pedro Lima está ausente há 3 semanas
                </p>
                <Button size="sm" variant="outline" className="mt-2">
                  Fazer Contato
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-auto py-4"
              onClick={() => setShowRelatorio(true)}
            >
              <FileText className="h-6 w-6" />
              <span>Novo Relatório</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-auto py-4"
              onClick={() => toast.info('Em desenvolvimento: Lista detalhada de membros')}
            >
              <Users className="h-6 w-6" />
              <span>Listar Membros</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-auto py-4"
              onClick={() => toast.info('Em desenvolvimento: Agendamento de visitas')}
            >
              <Calendar className="h-6 w-6" />
              <span>Agendar Visita</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-auto py-4"
              onClick={() => toast.info('Em desenvolvimento: Histórico da célula')}
            >
              <Clock className="h-6 w-6" />
              <span>Histórico</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <RelatorioSemanalDialog open={showRelatorio} onOpenChange={setShowRelatorio} />
    </div>
  );
};