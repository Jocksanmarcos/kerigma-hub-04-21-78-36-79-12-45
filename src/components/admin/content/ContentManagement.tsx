import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Image, Book, Edit } from 'lucide-react';
import { ComunicadosManager } from './ComunicadosManager';
import { BannersManager } from './BannersManager';
import { PalavraSemanaManager } from './PalavraSemanaManager';
import { LiveSiteEditor } from './LiveSiteEditor';

export const ContentManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Gestão de Conteúdo</h1>
        <p className="text-muted-foreground">Gerencie comunicados, banners e conteúdo dinâmico da plataforma</p>
      </header>

      <Tabs defaultValue="comunicados" className="space-y-8">
        <TabsList className="grid w-full grid-cols-4 h-auto p-2 bg-surface-blue shadow-kerigma-md">
          <TabsTrigger value="comunicados" className="flex items-center space-x-3 px-6 py-4">
            <MessageSquare className="h-5 w-5" />
            <span className="font-semibold">Comunicados</span>
          </TabsTrigger>
          <TabsTrigger value="banners" className="flex items-center space-x-3 px-6 py-4">
            <Image className="h-5 w-5" />
            <span className="font-semibold">Banners da Home</span>
          </TabsTrigger>
          <TabsTrigger value="palavra" className="flex items-center space-x-3 px-6 py-4">
            <Book className="h-5 w-5" />
            <span className="font-semibold">Palavra da Semana</span>
          </TabsTrigger>
          <TabsTrigger value="editor" className="flex items-center space-x-3 px-6 py-4">
            <Edit className="h-5 w-5" />
            <span className="font-semibold">Editor de Site</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comunicados" className="space-y-6">
          <ComunicadosManager />
        </TabsContent>

        <TabsContent value="banners" className="space-y-6">
          <BannersManager />
        </TabsContent>

        <TabsContent value="palavra" className="space-y-6">
          <PalavraSemanaManager />
        </TabsContent>

        <TabsContent value="editor" className="space-y-6">
          <LiveSiteEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
};