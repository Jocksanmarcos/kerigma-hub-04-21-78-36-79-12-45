import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Image as ImageIcon, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { InteresseModal } from "./InteresseModal";

interface Doacao {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  fotos_urls: string[] | null;
  status: string;
  created_at: string;
  doador_id: string;
  pessoas?: {
    nome_completo: string;
  };
}

export function DoacoesGrid() {
  const [selectedDoacao, setSelectedDoacao] = useState<Doacao | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: doacoes, isLoading } = useQuery({
    queryKey: ['mural-doacoes'],
    queryFn: async () => {
      // Buscar doações
      const { data: doacoesData, error } = await supabase
        .from('mural_doacoes')
        .select('*')
        .in('status', ['disponivel'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Buscar dados dos doadores
      const doadorIds = doacoesData.map(d => d.doador_id);
      const { data: pessoasData } = await supabase
        .from('pessoas')
        .select('id, nome_completo')
        .in('id', doadorIds);

      // Combinar os dados
      const doacoesComDoadores = doacoesData.map(doacao => ({
        ...doacao,
        pessoas: pessoasData?.find(p => p.id === doacao.doador_id) || null
      }));

      return doacoesComDoadores as Doacao[];
    }
  });

  const handleInteresse = (doacao: Doacao) => {
    setSelectedDoacao(doacao);
    setModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
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

  if (!doacoes?.length) {
    return (
      <div className="text-center py-12">
        <Heart className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
          Nenhuma doação disponível
        </h3>
        <p className="text-muted-foreground">
          Seja o primeiro a oferecer algo para a comunidade!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doacoes.map((doacao) => (
          <Card key={doacao.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg line-clamp-2">{doacao.titulo}</CardTitle>
                <Badge variant={doacao.status === 'disponivel' ? 'default' : 'secondary'}>
                  {doacao.status === 'disponivel' ? 'Disponível' : 'Reservado'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {doacao.fotos_urls && doacao.fotos_urls.length > 0 ? (
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={doacao.fotos_urls[0]} 
                    alt={doacao.titulo}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}

              <div className="space-y-2">
                <Badge variant="outline" className="text-xs">
                  {doacao.categoria}
                </Badge>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {doacao.descricao}
                </p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDistanceToNow(new Date(doacao.created_at), { 
                    addSuffix: true,
                    locale: ptBR 
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Oferecido por: {doacao.pessoas?.nome_completo || 'Anônimo'}
                </p>
              </div>
            </CardContent>

            <CardFooter>
              <Button 
                className="w-full" 
                variant={doacao.status === 'disponivel' ? 'default' : 'secondary'}
                disabled={doacao.status !== 'disponivel'}
                onClick={() => handleInteresse(doacao)}
              >
                <Heart className="mr-2 h-4 w-4" />
                {doacao.status === 'disponivel' ? 'Tenho Interesse' : 'Já Reservado'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <InteresseModal 
        doacao={selectedDoacao}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}