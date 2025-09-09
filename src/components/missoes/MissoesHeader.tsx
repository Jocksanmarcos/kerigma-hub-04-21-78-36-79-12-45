import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { PlatformLogo } from '@/components/ui/platform-logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ConsultaRapidaBiblia } from '@/components/biblia/ConsultaRapidaBiblia';
import { ChurchSelector } from '@/components/ui/church-selector';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { Button } from '@/components/ui/button';
import { NavLink } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const MissoesHeader: React.FC = () => {
  return (
    <header className="h-16 flex items-center justify-between border-b bg-background px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <NavLink to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </NavLink>
          </Button>
          <div className="h-6 w-px bg-border" />
          <PlatformLogo className="h-8 w-auto" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ChurchSelector />
        <ConsultaRapidaBiblia />
        <ThemeToggle />
        <NotificationCenter />
      </div>
    </header>
  );
};