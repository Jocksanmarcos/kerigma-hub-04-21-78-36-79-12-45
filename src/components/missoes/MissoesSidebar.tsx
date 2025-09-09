import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Globe,
  TrendingUp,
  BarChart3,
  Users,
  MapPin,
  DollarSign,
  Calendar,
  Settings,
} from 'lucide-react';
import {
  Sidebar as SidebarUI,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const missoesNavItems = [
  { title: 'Dashboard Geral', url: '/dashboard/missoes', icon: Globe },
  { title: 'Movimentação Financeira', url: '/dashboard/missoes/financeiro', icon: DollarSign },
  { title: 'Relatórios', url: '/dashboard/missoes/relatorios', icon: BarChart3 },
  // { title: 'Pessoas & Líderes', url: '/dashboard/missoes/pessoas', icon: Users }, // Removed temporarily
  { title: 'Eventos & Programação', url: '/dashboard/missoes/eventos', icon: Calendar },
  { title: 'Configurações', url: '/dashboard/missoes/configuracoes', icon: Settings },
];

export const MissoesSidebar: React.FC = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/dashboard/missoes') {
      return currentPath === '/dashboard/missoes';
    }
    return currentPath.startsWith(path);
  };

  const getNavClass = (path: string) => {
    return isActive(path) 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";
  };

  return (
    <SidebarUI className={collapsed ? "w-14" : "w-64"}>
      <SidebarContent className="bg-card border-r">
        
        {/* Missões */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground">
              Dashboard de Missões
            </SidebarGroupLabel>
          )}
          
          <SidebarGroupContent>
            <SidebarMenu>
              {missoesNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${getNavClass(item.url)}`}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
    </SidebarUI>
  );
};