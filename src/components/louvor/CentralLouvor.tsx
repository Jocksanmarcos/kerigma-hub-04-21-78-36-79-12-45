import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EquipesManager } from './EquipesManager';
import { EscalasManager } from './EscalasManager';

export const CentralLouvor: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Central de Louvor</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie repertório, escalas e equipes do ministério de louvor
        </p>
      </div>

      {/* Tabs principais */}
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

        {/* Aba Escalas */}
        <TabsContent value="escalas" className="space-y-6">
          <EscalasManager />
        </TabsContent>

        {/* Aba Equipes */}
        <TabsContent value="equipes" className="space-y-6">
          <EquipesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};