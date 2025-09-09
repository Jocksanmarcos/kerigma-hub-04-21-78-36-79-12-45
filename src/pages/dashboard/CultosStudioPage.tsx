import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import ServicePlannerView from '@/components/cultos-studio/ServicePlannerView';
import WorshipPortalView from '@/components/cultos-studio/WorshipPortalView';
import MonthlyMatrixView from '@/components/cultos-studio/MonthlyMatrixView';
import ConvocacaoInteligenteTab from '@/components/cultos-studio/ConvocacaoInteligenteTab';
import MusicLibraryManager from '@/components/cultos-studio/MusicLibraryManager';
import SoundStudioEnhancer from '@/components/cultos-studio/SoundStudioEnhancer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Music, 
  Calendar, 
  Users, 
  Brain, 
  Library, 
  Mic,
  Play,
  Download,
  Share,
  Settings
} from 'lucide-react';

const CultosStudioPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Studio de Produção de Cultos</h1>
            <p className="text-muted-foreground">
              Centro completo de produção, planejamento e gestão de cultos
            </p>
          </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Plano
          </Button>
          <Button>
            <Play className="h-4 w-4 mr-2" />
            Novo Culto
          </Button>
        </div>
        </div>

      <Tabs defaultValue="planner" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="planner" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Planejador
          </TabsTrigger>
          <TabsTrigger value="worship" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            Portal Louvor
          </TabsTrigger>
          <TabsTrigger value="matrix" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Matriz Mensal
          </TabsTrigger>
          <TabsTrigger value="convocation" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            IA Convocação
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Library className="h-4 w-4" />
            Biblioteca
          </TabsTrigger>
          <TabsTrigger value="sound" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Som & Studio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="planner" className="space-y-6">
          <ServicePlannerView />
        </TabsContent>

        <TabsContent value="worship" className="space-y-6">
          <WorshipPortalView />
        </TabsContent>

        <TabsContent value="matrix" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Matriz de Planejamento Mensal
              </CardTitle>
              <CardDescription>
                Visão geral e planejamento estratégico dos cultos do mês
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MonthlyMatrixView />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="convocation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Convocação Inteligente
              </CardTitle>
              <CardDescription>
                Sistema de IA para convocação automática de voluntários baseado em disponibilidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConvocacaoInteligenteTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Library className="h-5 w-5" />
                Biblioteca Musical
              </CardTitle>
              <CardDescription>
                Gerencie músicas, cifras, partituras e recursos musicais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MusicLibraryManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sound" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Studio de Som Avançado
              </CardTitle>
              <CardDescription>
                Ferramentas profissionais para mixagem e produção de áudio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SoundStudioEnhancer />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-all cursor-pointer">
          <CardContent className="p-6 text-center">
            <Music className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-2">Novo Plano de Culto</h3>
            <p className="text-sm text-muted-foreground">Criar planejamento completo</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all cursor-pointer">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-2">Convocar Equipe</h3>
            <p className="text-sm text-muted-foreground">Sistema inteligente de convocação</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all cursor-pointer">
          <CardContent className="p-6 text-center">
            <Library className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-2">Biblioteca</h3>
            <p className="text-sm text-muted-foreground">Acessar recursos musicais</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all cursor-pointer">
          <CardContent className="p-6 text-center">
            <Share className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-2">Compartilhar</h3>
            <p className="text-sm text-muted-foreground">Enviar planos para equipe</p>
          </CardContent>
        </Card>
      </div>
      </div>
    </AppLayout>
  );
};

export default CultosStudioPage;