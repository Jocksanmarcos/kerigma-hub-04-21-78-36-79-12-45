import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Bell, BellOff, Heart, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  created_at: string;
  tipo_notificacao: string;
  metadata: any;
}

export function NotificacoesDoador() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notificacoes, isLoading } = useQuery({
    queryKey: ['notificacoes-doador'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Usuário não autenticado");

      const { data: pessoa } = await supabase
        .from('pessoas')
        .select('id')
        .eq('user_id', user.user.id)
        .single();

      if (!pessoa) throw new Error("Pessoa não encontrada");

      const { data: notificacoesData, error } = await supabase
        .from('mural_notificacoes_doador')
        .select('*')
        .eq('doador_id', pessoa.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return notificacoesData as Notificacao[];
    }
  });

  const marcarComoLida = useMutation({
    mutationFn: async (notificacaoId: string) => {
      const { error } = await supabase
        .from('mural_notificacoes_doador')
        .update({ 
          lida: true,
          data_leitura: new Date().toISOString()
        })
        .eq('id', notificacaoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacoes-doador'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao marcar notificação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const marcarTodasComoLidas = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Usuário não autenticado");

      const { data: pessoa } = await supabase
        .from('pessoas')
        .select('id')
        .eq('user_id', user.user.id)
        .single();

      if (!pessoa) throw new Error("Pessoa não encontrada");

      const { error } = await supabase
        .from('mural_notificacoes_doador')
        .update({ 
          lida: true,
          data_leitura: new Date().toISOString()
        })
        .eq('doador_id', pessoa.id)
        .eq('lida', false);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Notificações marcadas como lidas",
        description: "Todas as notificações foram marcadas como lidas.",
      });
      queryClient.invalidateQueries({ queryKey: ['notificacoes-doador'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao marcar notificações",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const naoLidas = notificacoes?.filter(n => !n.lida).length || 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!notificacoes?.length) {
    return (
      <div className="text-center py-12">
        <Bell className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
          Nenhuma notificação
        </h3>
        <p className="text-muted-foreground">
          Você será notificado quando alguém demonstrar interesse nas suas doações.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {naoLidas > 0 && (
        <div className="flex items-center justify-between bg-primary/10 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <span className="font-medium">
              {naoLidas} notificação{naoLidas > 1 ? 'ões' : ''} não lida{naoLidas > 1 ? 's' : ''}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => marcarTodasComoLidas.mutate()}
            disabled={marcarTodasComoLidas.isPending}
          >
            <BellOff className="mr-2 h-4 w-4" />
            Marcar todas como lidas
          </Button>
        </div>
      )}

      {notificacoes.map((notificacao) => (
        <Card 
          key={notificacao.id} 
          className={`cursor-pointer transition-colors ${
            !notificacao.lida ? 'border-primary/50 bg-primary/5' : ''
          }`}
          onClick={() => {
            if (!notificacao.lida) {
              marcarComoLida.mutate(notificacao.id);
            }
          }}
        >
          <CardContent className="pt-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {notificacao.tipo_notificacao === 'interesse_recebido' ? (
                  <Heart className="h-4 w-4 text-primary" />
                ) : (
                  <MessageSquare className="h-4 w-4 text-primary" />
                )}
                <h4 className="font-semibold">{notificacao.titulo}</h4>
              </div>
              <div className="flex items-center gap-2">
                {!notificacao.lida && (
                  <Badge variant="default" className="text-xs">Nova</Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notificacao.created_at), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">
              {notificacao.mensagem}
            </p>

            {notificacao.metadata?.mensagem_interesse && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Mensagem do interessado:
                </p>
                <p className="text-sm">
                  "{notificacao.metadata.mensagem_interesse}"
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}