import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, TrendingUp, MessageSquare, Phone, Plus, FileText, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';
import { RelatorioSemanalDialog } from '../RelatorioSemanalDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CelulaData {
  id: string;
  nome: string;
  membros: number;
  presentes_ultima_reuniao: number;
  visitantes_ultima_reuniao: number;
  data_ultima_reuniao: string | null;
  proxima_reuniao: string | null;
  status_relatorio: 'pendente' | 'enviado' | 'atrasado';
}

interface MembroCelula {
  id: string;
  nome_completo: string;
  telefone: string | null;
  status: 'ativo' | 'visitante' | 'inativo';
  data_nascimento: string | null;
}

export const DashboardLiderCelula: React.FC = () => {
  const [showRelatorio, setShowRelatorio] = useState(false);
  const { pessoa } = useCurrentPerson();

  // Buscar dados da célula do líder
  const { data: celulaData, isLoading: loadingCelula } = useQuery({
    queryKey: ['celula-lider', pessoa?.id],
    queryFn: async () => {
      if (!pessoa?.id) return null;

      const { data, error } = await supabase
        .from('celulas')
        .select(`
          id,
          nome,
          pessoas!celula_id(count),
          relatorios_celulas!celula_id(
            data_reuniao,
            presentes,
            visitantes,
            status,
            created_at
          )
        `)
        .eq('lider_id', pessoa.id)
        .single();

      if (error) {
        console.error('Erro ao buscar célula:', error);
        return null;
      }

      const ultimoRelatorio = data.relatorios_celulas?.[0];
      const hoje = new Date();
      const proximaSegunda = new Date(hoje);
      proximaSegunda.setDate(hoje.getDate() + (1 + 7 - hoje.getDay()) % 7);

      return {
        id: data.id,
        nome: data.nome,
        membros: data.pessoas?.[0]?.count || 0,
        presentes_ultima_reuniao: ultimoRelatorio?.presentes || 0,
        visitantes_ultima_reuniao: ultimoRelatorio?.visitantes || 0,
        data_ultima_reuniao: ultimoRelatorio?.data_reuniao,
        proxima_reuniao: format(proximaSegunda, 'yyyy-MM-dd'),
        status_relatorio: ultimoRelatorio?.status === 'pendente' ? 'pendente' : 'enviado'
      } as CelulaData;
    },
    enabled: !!pessoa?.id
  });

  // Buscar membros da célula
  const { data: membros, isLoading: loadingMembros } = useQuery({
    queryKey: ['membros-celula', celulaData?.id],
    queryFn: async () => {
      if (!celulaData?.id) return [];

      const { data, error } = await supabase
        .from('pessoas')
        .select('id, nome_completo, telefone, situacao, data_nascimento')
        .eq('celula_id', celulaData.id)
        .eq('situacao', 'ativo');

      if (error) {
        console.error('Erro ao buscar membros:', error);
        return [];
      }

      return data.map(pessoa => ({
        id: pessoa.id,
        nome_completo: pessoa.nome_completo,
        telefone: pessoa.telefone,
        status: 'ativo' as const,
        data_nascimento: pessoa.data_nascimento
      })) as MembroCelula[];
    },
    enabled: !!celulaData?.id
  });

  const aniversariantesEstaSemana = membros?.filter(membro => {
    if (!membro.data_nascimento) return false;
    const hoje = new Date();
    const nascimento = new Date(membro.data_nascimento);
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6);
    
    nascimento.setFullYear(hoje.getFullYear());
    return nascimento >= inicioSemana && nascimento <= fimSemana;
  }) || [];

  if (loadingCelula) {
    return <div className="p-6">Carregando dados da célula...</div>;
  }

  if (!celulaData) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p>Você não está cadastrado como líder de nenhuma célula.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Header da Célula */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 min-w-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold">Minha Célula</h1>
          <p className="text-muted-foreground truncate">{celulaData.nome}</p>
        </div>
        <Button onClick={() => setShowRelatorio(true)} className="gap-2 w-full sm:w-auto shrink-0">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novo Relatório</span>
          <span className="sm:hidden">Relatório</span>
        </Button>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 min-w-0">
        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{celulaData.membros}</div>
            <p className="text-xs text-muted-foreground">Total de membros ativos</p>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Reunião</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{celulaData.presentes_ultima_reuniao}</div>
            <p className="text-xs text-muted-foreground">
              {celulaData.visitantes_ultima_reuniao} visitantes
            </p>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próxima Reunião</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-base sm:text-lg font-bold">
              {celulaData.proxima_reuniao ? 
                format(new Date(celulaData.proxima_reuniao), 'dd/MM', { locale: ptBR }) : 
                'Não agendada'
              }
            </div>
            <p className="text-xs text-muted-foreground">Segunda-feira</p>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Relatório</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            <Badge variant={celulaData.status_relatorio === 'pendente' ? 'destructive' : 'default'}>
              {celulaData.status_relatorio === 'pendente' ? 'Pendente' : 'Enviado'}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">Esta semana</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-w-0">
        {/* Lista de Membros */}
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 shrink-0" />
              Membros da Célula ({membros?.length || 0})
            </CardTitle>
            <CardDescription>Gerencie e acompanhe seus membros</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {loadingMembros ? (
                <p>Carregando membros...</p>
              ) : membros?.length === 0 ? (
                <p className="text-muted-foreground">Nenhum membro cadastrado</p>
              ) : (
                membros?.map(membro => (
                  <div key={membro.id} className="flex items-center justify-between p-3 bg-muted rounded-lg min-w-0">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{membro.nome_completo}</p>
                      <p className="text-sm text-muted-foreground truncate">{membro.telefone || 'Sem telefone'}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {membro.telefone && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(`tel:${membro.telefone}`)}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          // TODO: Abrir modal de detalhes do membro
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alertas e Lembretes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Alertas e Lembretes
            </CardTitle>
            <CardDescription>Acompanhe itens importantes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {celulaData.status_relatorio === 'pendente' && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="font-medium text-destructive">Relatório Pendente</p>
                  <p className="text-sm text-muted-foreground">Envie o relatório da última reunião</p>
                  <Button 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setShowRelatorio(true)}
                  >
                    Enviar Agora
                  </Button>
                </div>
              )}

              {aniversariantesEstaSemana.length > 0 && (
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="font-medium text-primary">Aniversários Esta Semana</p>
                  {aniversariantesEstaSemana.map(aniversariante => (
                    <p key={aniversariante.id} className="text-sm text-muted-foreground">
                      {aniversariante.nome_completo} - {
                        aniversariante.data_nascimento ? 
                        format(new Date(aniversariante.data_nascimento), 'dd/MM') :
                        'Data não informada'
                      }
                    </p>
                  ))}
                </div>
              )}

              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">Próxima Reunião</p>
                <p className="text-sm text-muted-foreground">
                  {celulaData.proxima_reuniao ? 
                    `${format(new Date(celulaData.proxima_reuniao), 'dd/MM/yyyy')} às 19:30` :
                    'Reunião não agendada'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Ferramentas para gestão da sua célula</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Button variant="outline" onClick={() => setShowRelatorio(true)} className="text-xs sm:text-sm">
              <FileText className="h-4 w-4 mr-2" />
              Relatório
            </Button>
            <Button variant="outline" className="text-xs sm:text-sm">
              <Users className="h-4 w-4 mr-2" />
              Membros
            </Button>
            <Button variant="outline" className="text-xs sm:text-sm">
              <Calendar className="h-4 w-4 mr-2" />
              Agendar
            </Button>
            <Button variant="outline" className="text-xs sm:text-sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Contatos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Relatório */}
      <RelatorioSemanalDialog 
        open={showRelatorio}
        onOpenChange={setShowRelatorio}
      />
    </div>
  );
};