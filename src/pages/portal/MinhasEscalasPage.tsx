import React, { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Users, CheckCircle, Music, MapPin } from 'lucide-react';
import { MinhasEscalasList } from '@/components/louvor/MinhasEscalasList';
import { ConvitesPendentes } from '@/components/louvor/ConvitesPendentes';
import { IndisponibilidadeManager } from '@/components/louvor/IndisponibilidadeManager';

export default function MinhasEscalasPage() {
  useEffect(() => {
    document.title = 'Minhas Escalas | Portal do Louvor';
    const desc = 'Portal pessoal para membros do ministério de louvor: escalas, convites e disponibilidade.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);

    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', window.location.origin + '/portal/minhas-escalas');
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Music className="h-8 w-8 text-primary" />
            Portal do Louvor
          </h1>
          <p className="text-muted-foreground mt-2">
            Suas escalas, convites e disponibilidade no ministério de louvor.
          </p>
        </div>

        {/* Cards de resumo */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximas Escalas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                Confirmadas este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Convites Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">
                Aguardando resposta
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground">
                Participações confirmadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa Presença</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">95%</div>
              <p className="text-xs text-muted-foreground">
                Últimos 3 meses
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="escalas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="escalas" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Minhas Escalas
            </TabsTrigger>
            <TabsTrigger value="convites" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Convites Pendentes
            </TabsTrigger>
            <TabsTrigger value="disponibilidade" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Disponibilidade
            </TabsTrigger>
          </TabsList>

          <TabsContent value="escalas" className="space-y-6">
            <MinhasEscalasList />
          </TabsContent>

          <TabsContent value="convites" className="space-y-6">
            <ConvitesPendentes />
          </TabsContent>

          <TabsContent value="disponibilidade" className="space-y-6">
            <IndisponibilidadeManager />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}