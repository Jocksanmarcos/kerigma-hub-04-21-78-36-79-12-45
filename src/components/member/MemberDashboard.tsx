import React from 'react';
import { MemberHeader } from '@/components/layout/MemberHeader';
import { NotificacoesEscala } from '@/components/louvor/NotificacoesEscala';
import { NotificationTestButton } from '@/components/member/NotificationTestButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Music, Book, Users } from 'lucide-react';

export const MemberDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <MemberHeader />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Boas-vindas */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Bem-vindo ao Portal do Membro</h2>
          <p className="text-muted-foreground">Acompanhe suas atividades e convocações do ministério</p>
          <div className="pt-2">
            <NotificationTestButton />
          </div>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Próximos Eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Music className="h-4 w-4" />
                Escalas Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">Confirmadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Book className="h-4 w-4" />
                Cursos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">Em andamento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Célula
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15</div>
              <p className="text-xs text-muted-foreground">Membros</p>
            </CardContent>
          </Card>
        </div>

        {/* Notificações de Escala */}
        <div className="max-w-4xl mx-auto">
          <NotificacoesEscala />
        </div>
      </main>
    </div>
  );
};