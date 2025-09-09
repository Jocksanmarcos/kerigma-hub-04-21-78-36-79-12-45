import React, { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import DashboardBiblicoEnhanced from '@/components/jornada/DashboardBiblicoEnhanced';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const JornadaBibliaPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Estudo Bíblico | Jornada de Crescimento';
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header com navegação */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/jornada')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Estudo Bíblico</h1>
            <p className="text-muted-foreground">
              Ferramentas inteligentes para seu crescimento espiritual diário.
            </p>
          </div>
        </div>

        {/* Dashboard da Bíblia Enhanced */}
        <DashboardBiblicoEnhanced />
      </div>
    </AppLayout>
  );
};

export default JornadaBibliaPage;