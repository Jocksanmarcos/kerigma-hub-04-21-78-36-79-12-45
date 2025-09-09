import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IntelligentScheduler } from './IntelligentScheduler';
import { VolunteerInvitations } from './VolunteerInvitations';
import { Users, Mail, Calendar, Settings } from 'lucide-react';
import { ExportEscalaButton } from './ExportEscalaButton';
import { PresencaManager } from './PresencaManager';

interface SchedulingDashboardProps {
  planId?: string;
  planTitle?: string;
  serviceDate?: string;
  userRole?: 'leader' | 'volunteer' | 'admin';
}

export const SchedulingDashboard: React.FC<SchedulingDashboardProps> = ({
  planId,
  planTitle = "Culto de Domingo",
  serviceDate = new Date().toISOString().split('T')[0],
  userRole = 'volunteer'
}) => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Sistema de Escalas Ministeriais</h1>
        <p className="text-muted-foreground mt-2">
          Gerenciamento inteligente de voluntários e convocatórias
        </p>
      </div>

      <Tabs defaultValue={userRole === 'leader' ? 'scheduler' : 'invitations'} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          {(userRole === 'leader' || userRole === 'admin') && (
            <TabsTrigger value="scheduler" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Convocar Equipe
            </TabsTrigger>
          )}
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Meus Convites
          </TabsTrigger>
        </TabsList>

        {(userRole === 'leader' || userRole === 'admin') && (
          <TabsContent value="scheduler" className="space-y-6">
            {planId ? (
              <>
                <div className="flex justify-end">
                  <ExportEscalaButton planId={planId} planTitle={planTitle} />
                </div>
                <IntelligentScheduler
                  planId={planId}
                  planTitle={planTitle}
                  serviceDate={serviceDate}
                />
                <PresencaManager planId={planId} />
              </>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Selecione um Plano de Culto</h3>
                <p className="text-muted-foreground">
                  Para usar o sistema de escalas, primeiro selecione ou crie um plano de culto.
                </p>
              </div>
            )}
          </TabsContent>
        )}

        <TabsContent value="invitations" className="space-y-6">
          <VolunteerInvitations />
        </TabsContent>
      </Tabs>
    </div>
  );
};