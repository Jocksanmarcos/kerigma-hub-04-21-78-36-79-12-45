import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { ConsultaRapidaBiblia } from '@/components/biblia/ConsultaRapidaBiblia';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { PlatformLogo } from '@/components/ui/platform-logo';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ChurchSelector } from '@/components/ui/church-selector';
import NotificationCenter from '@/components/notifications/NotificationCenter';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthed(!!session?.user);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setIsAuthed(!!session?.user));
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: 'Sessão encerrada' });
    navigate('/auth', { replace: true });
  };

  return (
    <header className="border-b bg-background shrink-0">
      {/* Top header bar - 3-part balanced layout */}
      <div className="h-16 flex items-center justify-between px-4 lg:px-6">
        {/* Left section - Navigation */}
        <div className="flex items-center gap-2 md:gap-4 flex-1">
          <SidebarTrigger />
        </div>

        {/* Center section - Branding */}
        <div className="flex items-center justify-center flex-1">
          <NavLink to="/">
            <PlatformLogo className="h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity" />
          </NavLink>
        </div>

        {/* Right section - Global actions */}
        <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-end">
          {/* Church Selector - hide on very small screens */}
          {isAuthed && (
            <div className="hidden xs:block">
              <ChurchSelector />
            </div>
          )}

          {/* Consulta Bíblica - hidden on small screens */}
          <div className="hidden md:block">
            <ConsultaRapidaBiblia />
          </div>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Ver Site quick button (visible when logado) */}
          {isAuthed && (
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden lg:inline-flex"
              onClick={() => {
                navigate('/');
                try {
                  const { useEditMode } = require('@/contexts/EditModeContext');
                  const { setEditMode } = useEditMode();
                  setEditMode(true);
                } catch (error) {
                  // EditMode context not available, just navigate
                  console.log('EditMode context not available');
                }
              }}
            >
              Ver Site
            </Button>
          )}

          {/* Notifications */}
          {isAuthed && <NotificationCenter />}

          {/* User menu */}
          {isAuthed ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full flex-shrink-0">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[160px]">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  navigate('/');
                  try {
                    const { useEditMode } = require('@/contexts/EditModeContext');
                    const { setEditMode } = useEditMode();
                    setEditMode(true);
                  } catch (error) {
                    // EditMode context not available, just navigate
                    console.log('EditMode context not available');
                  }
                }}>Ver Site</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/admin/configuracoes')}>Configurações</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Sair</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <NavLink to="/auth">
              <Button size="sm" className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-4">Entrar</Button>
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
};