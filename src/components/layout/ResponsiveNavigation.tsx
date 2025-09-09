import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MoreHorizontal, Users, Calendar, Home } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useNewUserRole } from '@/hooks/useNewRole';

// Priority navigation items for mobile (most important 2-3 items)
const priorityNavItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home, roles: ['pastor', 'lider', 'membro'] },
  { title: 'Pessoas', url: '/dashboard/pessoas', icon: Users, roles: ['pastor', 'lider'] },
  { title: 'Agenda', url: '/dashboard/agenda', icon: Calendar, roles: ['pastor', 'lider', 'membro'] },
];

// Secondary navigation items for "More..." dropdown
const secondaryNavItems = [
  { title: 'Células', url: '/dashboard/celulas', roles: ['pastor', 'lider'] },
  { title: 'Missões', url: '/dashboard/missoes', roles: ['pastor', 'lider'] },
  { title: 'Jornada de Crescimento', url: '/jornada', roles: ['pastor', 'lider', 'membro'] },
  { title: 'Aconselhamento', url: '/dashboard/aconselhamento', roles: ['pastor', 'lider', 'membro'] },
  { title: 'Eventos', url: '/dashboard/eventos', roles: ['pastor', 'lider', 'membro'] },
  { title: 'Financeiro', url: '/dashboard/financeiro', roles: ['pastor'] },
  { title: 'Analytics', url: '/admin/analytics', roles: ['pastor', 'lider'] },
  { title: 'Configurações', url: '/admin/configuracoes', roles: ['pastor', 'lider'] },
];

export const ResponsiveNavigation: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { data: userRole } = useNewUserRole();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return currentPath === '/dashboard' || currentPath === '/';
    }
    return currentPath.startsWith(path);
  };

  const getNavClass = (path: string) => {
    return isActive(path) 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-muted text-muted-foreground hover:text-foreground";
  };

  // Filter items based on user role
  const filteredPriorityItems = priorityNavItems.filter(item => {
    if (item.roles && item.roles.length > 0 && userRole && !item.roles.includes(userRole)) {
      return false;
    }
    return true;
  });

  const filteredSecondaryItems = secondaryNavItems.filter(item => {
    if (item.roles && item.roles.length > 0 && userRole && !item.roles.includes(userRole)) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
      {/* Priority navigation items */}
      {filteredPriorityItems.map((item) => (
        <Button
          key={item.title}
          asChild
          variant="ghost" 
          size="sm"
          className={`flex-shrink-0 h-8 px-3 ${getNavClass(item.url)}`}
        >
          <NavLink to={item.url} className="flex items-center gap-2">
            <item.icon className="h-4 w-4" />
            <span className="text-xs font-medium">{item.title}</span>
          </NavLink>
        </Button>
      ))}

      {/* "More..." dropdown for remaining items */}
      {filteredSecondaryItems.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="flex-shrink-0 h-8 px-3 hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="text-xs font-medium ml-1">Mais...</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="min-w-[180px] bg-background border shadow-lg z-50"
            sideOffset={8}
          >
            {filteredSecondaryItems.map((item) => (
              <DropdownMenuItem key={item.title} asChild>
                <NavLink 
                  to={item.url} 
                  className={`flex items-center gap-3 px-3 py-2 text-sm cursor-pointer w-full ${
                    isActive(item.url) 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted"
                  }`}
                >
                  <span>{item.title}</span>
                </NavLink>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};