import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Send, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ConvocacaoEquipeProps {
  eventoId: string;
  nomeEvento: string;
}

interface MembroEquipe {
  id: string;
  nome_completo: string;
  email: string;
  cargo_id: string;
  nome_cargo: string;
  cor_cargo: string;
  status_atual?: string;
}

export function ConvocacaoEquipe({ eventoId, nomeEvento }: ConvocacaoEquipeProps) {
  const queryClient = useQueryClient();

  // Buscar status atual das convocações
  const { data: statusConvocacoes } = useQuery({
    queryKey: ['status-convocacoes', eventoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('escalas_membros')
        .select(`
          *,
          pessoas!inner(nome_completo),
          louvor_cargos!inner(nome_cargo, cor)
        `)
        .eq('evento_id', eventoId);
      
      if (error) throw error;
      return data;
    }
  });

  // Mutation para convocar equipe
  const convocarEquipe = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('convocar-equipe', {
        body: {
          evento_id: eventoId
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['status-convocacoes', eventoId] });
      toast.success(data.message || 'Convites enviados com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao convocar equipe:', error);
      toast.error('Erro ao enviar convites. Tente novamente.');
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmado': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'recusado': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pendente': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default: return <Users className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmado': return 'Confirmado';
      case 'recusado': return 'Recusado';
      case 'pendente': return 'Pendente';
      default: return 'Não convidado';
    }
  };

  const stats = statusConvocacoes ? {
    total: statusConvocacoes.length,
    confirmados: statusConvocacoes.filter(s => s.status === 'confirmado').length,
    pendentes: statusConvocacoes.filter(s => s.status === 'pendente').length,
    recusados: statusConvocacoes.filter(s => s.status === 'recusado').length
  } : { total: 0, confirmados: 0, pendentes: 0, recusados: 0 };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Convocação da Equipe
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {nomeEvento}
            </p>
          </div>
          
          <Button 
            onClick={() => convocarEquipe.mutate()}
            disabled={convocarEquipe.isPending || stats.pendentes === 0}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {convocarEquipe.isPending ? 'Enviando...' : 'Publicar e Notificar Equipe'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Convidados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.confirmados}</div>
            <div className="text-xs text-muted-foreground">Confirmados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pendentes}</div>
            <div className="text-xs text-muted-foreground">Pendentes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.recusados}</div>
            <div className="text-xs text-muted-foreground">Recusados</div>
          </div>
        </div>

        {stats.pendentes > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <AlertCircle className="h-4 w-4 inline mr-1" />
              Há {stats.pendentes} membro(s) com status pendente que receberão notificação ao publicar.
            </p>
          </div>
        )}

        {statusConvocacoes && statusConvocacoes.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-3">Status dos Convites</h4>
            <div className="space-y-2">
              {statusConvocacoes.map(convocacao => (
                <div key={convocacao.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: convocacao.louvor_cargos.cor }}
                    />
                    <div>
                      <p className="font-medium">{convocacao.pessoas.nome_completo}</p>
                      <p className="text-xs text-muted-foreground">{convocacao.louvor_cargos.nome_cargo}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusIcon(convocacao.status)}
                    <Badge 
                      variant={
                        convocacao.status === 'confirmado' ? 'default' :
                        convocacao.status === 'recusado' ? 'destructive' :
                        'secondary'
                      }
                    >
                      {getStatusLabel(convocacao.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}