import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Users, Calendar, Mic, Guitar } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { RequirePermission } from '@/components/security/RequirePermission';
import { EscalasLouvorManager } from '@/components/louvor/EscalasLouvorManager';
import { EquipesLouvorManager } from '@/components/louvor/EquipesLouvorManager';

export default function CentralLouvorPage() {
  useEffect(() => {
    document.title = 'Central de Louvor | Sistema de Gestão Ministerial';
    const desc = 'Central de Louvor: Gestão completa de repertório, escalas, equipes e comunicação do ministério de louvor.';
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
    link.setAttribute('href', window.location.origin + '/admin/louvor');
  }, []);

  return (
    <AppLayout>
      <RequirePermission action="read" subject="louvor">
        <div className="space-y-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Music className="h-8 w-8 text-primary" />
              Central de Louvor
            </h1>
            <p className="text-muted-foreground mt-2">
              Gestão completa do ministério de louvor: repertório, escalas, equipes e comunicação integrada.
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
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  +2 desde a semana passada
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Membros Ativos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  Distribuídos em 8 cargos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Repertório</CardTitle>
                <Mic className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">
                  Músicas cadastradas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmações</CardTitle>
                <Guitar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92%</div>
                <p className="text-xs text-muted-foreground">
                  Taxa de confirmação
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="escalas" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="escalas" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Escalas
              </TabsTrigger>
              <TabsTrigger value="equipes" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Equipes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="escalas" className="space-y-6">
              <EscalasLouvorManager />
            </TabsContent>

            <TabsContent value="equipes" className="space-y-6">
              <EquipesLouvorManager />
            </TabsContent>
          </Tabs>
        </div>
      </RequirePermission>
    </AppLayout>
  );
}