import React from 'react';
import { Helmet } from 'react-helmet-async';
import { OfflinePortalAluno } from '@/components/portal-aluno/OfflinePortalAluno';
import { PWAStatusBar } from '@/components/pwa/PWAStatusBar';

export const PortalAlunoPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Portal do Aluno - Kerigma Hub</title>
        <meta name="description" content="Acesse seus cursos, acompanhe seu progresso e continue aprendendo mesmo offline" />
        <meta name="keywords" content="portal aluno, cursos online, educação cristã, offline" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header com status PWA */}
        <header className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">Portal do Aluno</h1>
              </div>
              <PWAStatusBar />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-4 py-6">
          <OfflinePortalAluno />
        </main>
      </div>
    </>
  );
};