import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Book, Trophy, Target, Calendar, BarChart3 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { LeitorBiblico } from '@/components/biblia/LeitorBiblico';
import { GamificacaoBiblia } from '@/components/biblia/GamificacaoBiblia';
import { PlanosDeLeitura } from '@/components/biblia/PlanosDeLeitura';
import { LembretesInteligentes } from '@/components/biblia/LembretesInteligentes';
import { PainelProgressoBiblico } from '@/components/biblia/PainelProgressoBiblico';
import { CatalogoPlanosLeitura } from '@/components/biblia/CatalogoPlanosLeitura';

const BibliaPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Jornada Bíblica Interativa</h1>
          <p className="text-muted-foreground">Estude a Palavra de Deus com ferramentas avançadas e gamificação completa</p>
        </div>
      <Tabs defaultValue="painel" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="painel" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Painel</span>
          </TabsTrigger>
          <TabsTrigger value="leitor" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            <span className="hidden sm:inline">Leitor</span>
          </TabsTrigger>
          <TabsTrigger value="planos" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Planos</span>
          </TabsTrigger>
          <TabsTrigger value="progresso" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Progresso</span>
          </TabsTrigger>
          <TabsTrigger value="lembretes" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Lembretes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="painel">
          <PainelProgressoBiblico />
        </TabsContent>

        <TabsContent value="leitor">
          <LeitorBiblico />
        </TabsContent>

        <TabsContent value="planos" className="space-y-6">
          <CatalogoPlanosLeitura />
        </TabsContent>

        <TabsContent value="progresso">
          <GamificacaoBiblia />
        </TabsContent>

        <TabsContent value="lembretes" className="space-y-6">
          <LembretesInteligentes />
        </TabsContent>
      </Tabs>
      </div>
    </AppLayout>
  );
};

export default BibliaPage;