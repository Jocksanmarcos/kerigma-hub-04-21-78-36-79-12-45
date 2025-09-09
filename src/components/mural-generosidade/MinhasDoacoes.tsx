import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Package, Eye, Check, X, MessageSquare } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Doacao {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  status: string;
  created_at: string;
  data_entrega?: string;
  observacoes_entrega?: string;
}

interface Interessado {
  id: string;
  mensagem: string;
  created_at: string;
  interessado_id: string;
  pessoas: {
    nome_completo: string;
    telefone?: string;
    email?: string;
  };
}

export function MinhasDoacoes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDoacao, setSelectedDoacao] = useState<string | null>(null);
  const [interessadosOpen, setInteressadosOpen] = useState(false);
  const [entregaOpen, setEntregaOpen] = useState(false);
  const [observacoes, setObservacoes] = useState("");

  const { data: doacoes, isLoading } = useQuery({
    queryKey: ['minhas-doacoes'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Usuário não autenticado");

      const { data: pessoa } = await supabase
        .from('pessoas')
        .select('id')
        .eq('user_id', user.user.id)
        .single();

      if (!pessoa) throw new Error("Pessoa não encontrada");

      const { data: doacoesData, error } = await supabase
        .from('mural_doacoes')
        .select('*')
        .eq('doador_id', pessoa.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return doacoesData as Doacao[];
    }
  });

  const { data: interessados } = useQuery({
    queryKey: ['interessados-doacao', selectedDoacao],
    queryFn: async () => {
      if (!selectedDoacao) return [];

      const { data: interessadosData, error } = await supabase
        .from('mural_interessados')
        .select('id, mensagem, created_at, interessado_id')
        .eq('doacao_id', selectedDoacao)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Buscar dados das pessoas interessadas
      const pessoaIds = interessadosData.map(i => i.interessado_id);
      const { data: pessoasData } = await supabase
        .from('pessoas')
        .select('id, nome_completo, telefone, email')
        .in('id', pessoaIds);

      // Combinar os dados
      const interessadosComPessoas = interessadosData.map(interessado => ({
        ...interessado,
        pessoas: pessoasData?.find(p => p.id === interessado.interessado_id) || {
          nome_completo: 'Usuário removido',
          telefone: '',
          email: ''
        }
      }));
      return interessadosComPessoas as Interessado[];
    },
    enabled: !!selectedDoacao
  });

  const marcarComoEntregue = useMutation({
    mutationFn: async ({ doacaoId, pessoaId }: { doacaoId: string; pessoaId: string }) => {
      const { error } = await supabase
        .from('mural_doacoes')
        .update({
          status: 'entregue',
          data_entrega: new Date().toISOString(),
          entregue_para_id: pessoaId,
          observacoes_entrega: observacoes
        })
        .eq('id', doacaoId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Doação marcada como entregue",
        description: "A doação foi removida do mural e marcada como concluída.",
      });
      queryClient.invalidateQueries({ queryKey: ['minhas-doacoes'] });
      queryClient.invalidateQueries({ queryKey: ['mural-doacoes'] });
      setEntregaOpen(false);
      setInteressadosOpen(false);
      setObservacoes("");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao marcar entrega",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removerDoacao = useMutation({
    mutationFn: async (doacaoId: string) => {
      const { error } = await supabase
        .from('mural_doacoes')
        .update({ status: 'removida' })
        .eq('id', doacaoId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Doação removida",
        description: "A doação foi removida do mural.",
      });
      queryClient.invalidateQueries({ queryKey: ['minhas-doacoes'] });
      queryClient.invalidateQueries({ queryKey: ['mural-doacoes'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover doação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponivel': return 'default';
      case 'reservado': return 'secondary';
      case 'entregue': return 'default';
      case 'removida': return 'destructive';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'disponivel': return 'Disponível';
      case 'reservado': return 'Reservado';
      case 'entregue': return 'Entregue';
      case 'removida': return 'Removida';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-muted rounded w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!doacoes?.length) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
          Nenhuma doação cadastrada
        </h3>
        <p className="text-muted-foreground">
          Você ainda não ofereceu nenhuma doação no mural.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {doacoes.map((doacao) => (
          <Card key={doacao.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{doacao.titulo}</CardTitle>
                <Badge variant={getStatusColor(doacao.status)}>
                  {getStatusText(doacao.status)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {doacao.descricao}
              </p>
              
              <div className="text-xs text-muted-foreground">
                Categoria: {doacao.categoria} • Criada em {new Date(doacao.created_at).toLocaleDateString('pt-BR')}
              </div>

              {doacao.status === 'entregue' && doacao.data_entrega && (
                <div className="bg-success/10 p-3 rounded-lg">
                  <p className="text-sm font-medium text-success">
                    Entregue em {new Date(doacao.data_entrega).toLocaleDateString('pt-BR')}
                  </p>
                  {doacao.observacoes_entrega && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {doacao.observacoes_entrega}
                    </p>
                  )}
                </div>
              )}

              {(doacao.status === 'disponivel' || doacao.status === 'reservado') && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedDoacao(doacao.id);
                      setInteressadosOpen(true);
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Interessados
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removerDoacao.mutate(doacao.id)}
                    disabled={removerDoacao.isPending}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remover
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de Interessados */}
      <Dialog open={interessadosOpen} onOpenChange={setInteressadosOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Pessoas Interessadas
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {interessados?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum interesse registrado ainda.
              </p>
            ) : (
              interessados?.map((interessado) => (
                <Card key={interessado.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{interessado.pessoas.nome_completo}</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {interessado.pessoas.telefone && (
                            <p>📞 {interessado.pessoas.telefone}</p>
                          )}
                          {interessado.pessoas.email && (
                            <p>✉️ {interessado.pessoas.email}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {new Date(interessado.created_at).toLocaleDateString('pt-BR')}
                      </Badge>
                    </div>
                    
                    <div className="bg-muted/50 p-3 rounded-lg mb-3">
                      <p className="text-sm">{interessado.mensagem}</p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedDoacao(interessado.interessado_id);
                        setEntregaOpen(true);
                      }}
                      className="w-full"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Marcar como Entregue para esta Pessoa
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Entrega */}
      <Dialog open={entregaOpen} onOpenChange={setEntregaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Entrega</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tem certeza que deseja marcar esta doação como entregue? Esta ação removerá a doação do mural.
            </p>

            <div>
              <label className="text-sm font-medium">Observações (opcional)</label>
              <Textarea
                placeholder="Adicione observações sobre a entrega..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setEntregaOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={() => {
                  const doacaoAtual = doacoes?.find(d => d.id === selectedDoacao);
                  if (doacaoAtual && selectedDoacao) {
                    marcarComoEntregue.mutate({ 
                      doacaoId: doacaoAtual.id, 
                      pessoaId: selectedDoacao 
                    });
                  }
                }}
                disabled={marcarComoEntregue.isPending}
                className="flex-1"
              >
                {marcarComoEntregue.isPending ? "Marcando..." : "Confirmar Entrega"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}