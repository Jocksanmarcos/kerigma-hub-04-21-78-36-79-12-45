import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Necessidade {
  id: string;
  descricao_necessidade: string;
  categoria: string;
  created_at: string;
  status: string;
}

export function NecessidadesComunidade() {
  const { data: necessidades, isLoading } = useQuery({
    queryKey: ['necessidades-comunidade'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mural_pedidos_ajuda')
        .select(`
          id,
          descricao_necessidade,
          categoria,
          created_at,
          status
        `)
        .eq('publicado_anonimamente', true)
        .in('status', ['pendente', 'em_atendimento'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Necessidade[];
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!necessidades?.length) {
    return (
      <div className="text-center py-12">
        <Heart className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
          Nenhuma necessidade publicada
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          A equipe de Diaconia ainda não publicou necessidades da comunidade. 
          As solicitações de ajuda são analisadas com cuidado e publicadas anonimamente quando apropriado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-primary mb-2">
          Necessidades Identificadas pela Diaconia
        </h3>
        <p className="text-sm text-muted-foreground">
          Estas são necessidades reais da nossa comunidade, publicadas de forma anônima 
          e discreta pela equipe de Diaconia. Sua generosidade pode fazer a diferença na vida de alguém.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {necessidades.map((necessidade) => (
          <Card key={necessidade.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <Badge variant="outline" className="mb-2">
                  {necessidade.categoria}
                </Badge>
                <Badge variant={necessidade.status === 'pendente' ? 'destructive' : 'secondary'}>
                  {necessidade.status === 'pendente' ? 'Precisando de Ajuda' : 'Em Atendimento'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed">
                {necessidade.descricao_necessidade}
              </p>
              
              <div className="flex items-center text-xs text-muted-foreground pt-2 border-t">
                <Clock className="h-3 w-3 mr-1" />
                Publicado {formatDistanceToNow(new Date(necessidade.created_at), { 
                  addSuffix: true,
                  locale: ptBR 
                })}
              </div>

              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  💝 <strong>Como ajudar:</strong> Se você pode contribuir com esta necessidade, 
                  entre em contato com a equipe de Diaconia da igreja ou fale com um dos pastores.
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}