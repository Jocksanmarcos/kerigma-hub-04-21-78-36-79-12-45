import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DoacoesGrid } from "@/components/mural-generosidade/DoacoesGrid";
import { FormularioDoacao } from "@/components/mural-generosidade/FormularioDoacao";
import { MinhasDoacoes } from "@/components/mural-generosidade/MinhasDoacoes";
import { NotificacoesDoador } from "@/components/mural-generosidade/NotificacoesDoador";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Plus, Package, Bell } from "lucide-react";

export default function MuralGenerosidadePage() {
  const [activeTab, setActiveTab] = useState("mural");

  // Buscar notificações não lidas
  const { data: notificacoesNaoLidas } = useQuery({
    queryKey: ['notificacoes-nao-lidas'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return 0;

      const { data: pessoa } = await supabase
        .from('pessoas')
        .select('id')
        .eq('user_id', user.user.id)
        .single();

      if (!pessoa) return 0;

      const { data } = await supabase
        .from('mural_notificacoes_doador')
        .select('id')
        .eq('doador_id', pessoa.id)
        .eq('lida', false);

      return data?.length || 0;
    },
    refetchInterval: 30000, // Verificar a cada 30 segundos
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mural da Generosidade</h1>
        <p className="text-muted-foreground">
          Compartilhe doações e ajude quem precisa na sua comunidade
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="mural" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Mural</span>
          </TabsTrigger>
          <TabsTrigger value="doar" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Doar</span>
          </TabsTrigger>
          <TabsTrigger value="minhas" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Minhas Doações</span>
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificações</span>
            {notificacoesNaoLidas ? (
              <Badge variant="destructive" className="ml-1 text-xs">
                {notificacoesNaoLidas}
              </Badge>
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mural" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Doações Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DoacoesGrid />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="doar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Oferecer Doação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormularioDoacao onSuccess={() => setActiveTab("minhas")} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="minhas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Minhas Doações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MinhasDoacoes />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações
                {notificacoesNaoLidas ? (
                  <Badge variant="destructive" className="ml-2">
                    {notificacoesNaoLidas} nova{notificacoesNaoLidas > 1 ? 's' : ''}
                  </Badge>
                ) : null}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NotificacoesDoador />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}