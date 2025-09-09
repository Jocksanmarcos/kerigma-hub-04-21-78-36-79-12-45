import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, Users, GraduationCap, Calendar, FileText, Settings, 
  BarChart3, MessageSquare, Award, Shield, MapPin, Package, 
  DollarSign, BookOpen, Music, Palette, Brain, Church,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const siteLinks = [
  {
    title: 'Páginas Públicas',
    description: 'Páginas acessíveis a todos os visitantes',
    icon: ExternalLink,
    links: [
      { name: 'Página Inicial', url: '/', icon: Home },
      { name: 'Sobre Nós', url: '/public/sobre', icon: Church },
      { name: 'Eventos Públicos', url: '/public/evento', icon: Calendar },
      { name: 'Contato', url: '/public/contato', icon: MessageSquare },
      { name: 'Semear & Transformar', url: '/semear', icon: DollarSign },
      { name: 'Galeria', url: '/public/galeria', icon: FileText },
      { name: 'Células', url: '/public/celulas', icon: MapPin },
      { name: 'Ensino Público', url: '/public/ensino', icon: GraduationCap },
      { name: 'Agenda Pública', url: '/public/agenda', icon: Calendar },
      { name: 'Aconselhamento', url: '/public/aconselhamento', icon: MessageSquare },
      { name: 'Visita', url: '/public/visite', icon: Users },
    ]
  },
  {
    title: 'Dashboard Principal',
    description: 'Área administrativa principal',
    icon: Home,
    links: [
      { name: 'Dashboard', url: '/dashboard', icon: Home },
      { name: 'Admin (Legacy)', url: '/admin', icon: Settings },
    ]
  },
  // People management section removed
  {
    title: 'Centro de Ensino',
    description: 'Sistema de educação e discipulado',
    icon: GraduationCap,
    links: [
      { name: 'Centro de Ensino', url: '/ensino', icon: GraduationCap },
      { name: 'Jornada Bíblica', url: '/ensino/biblia', icon: BookOpen },
    ]
  },
  {
    title: 'Eventos e Agenda',
    description: 'Gestão de eventos e agendamentos',
    icon: Calendar,
    links: [
      { name: 'Agenda', url: '/dashboard/agenda', icon: Calendar },
      { name: 'Eventos', url: '/dashboard/eventos', icon: Calendar },
    ]
  },
  {
    title: 'Ministérios e Louvor',
    description: 'Gestão de ministérios e escalas',
    icon: Music,
    links: [
      { name: 'Escalas', url: '/dashboard/escalas', icon: Users },
      { name: 'Escalas', url: '/dashboard/escalas', icon: FileText },
      { name: 'Cultos Studio', url: '/dashboard/cultos', icon: Music },
      { name: 'Louvor Studio', url: '/dashboard/louvor', icon: Palette },
    ]
  },
  {
    title: 'Financeiro',
    description: 'Gestão financeira da igreja',
    icon: DollarSign,
    links: [
      { name: 'Financeiro', url: '/dashboard/financeiro', icon: DollarSign },
      { name: 'Relatórios Financeiros', url: '/dashboard/financeiro-relatorios', icon: BarChart3 },
    ]
  },
  {
    title: 'Patrimônio',
    description: 'Gestão de bens e recursos',
    icon: Package,
    links: [
      { name: 'Patrimônio', url: '/dashboard/patrimonio', icon: Package },
    ]
  },
  {
    title: 'Administração',
    description: 'Módulos administrativos avançados',
    icon: Shield,
    links: [
      { name: 'Analytics', url: '/admin/analytics', icon: BarChart3 },
      { name: 'Células', url: '/admin/celulas', icon: MapPin },
      { name: 'Configurações', url: '/admin/configuracoes', icon: Settings },
      { name: 'Governança', url: '/admin/governanca', icon: Shield },
      { name: 'Aconselhamento Pastoral', url: '/admin/aconselhamento', icon: MessageSquare },
      { name: 'IA Pastoral', url: '/admin/ia-pastoral', icon: Brain },
    ]
  },
  {
    title: 'Autenticação',
    description: 'Sistema de login e cadastro',
    icon: Shield,
    links: [
      { name: 'Login/Cadastro', url: '/auth', icon: Shield },
    ]
  }
];

const SiteMapPage: React.FC = () => {
  const totalLinks = siteLinks.reduce((total, section) => total + section.links.length, 0);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Mapa do Site - Kerigma Hub
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            Todos os links e módulos da plataforma organizados por categoria
          </p>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {totalLinks} páginas disponíveis
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {siteLinks.map((section) => (
            <Card key={section.title} className="h-fit">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <section.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {section.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {section.links.map((link) => (
                    <Link
                      key={link.url}
                      to={link.url}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors group"
                    >
                      <link.icon className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
                      <span className="text-sm font-medium">{link.name}</span>
                      <ExternalLink className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Informações Importantes</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h3 className="font-medium text-foreground mb-2">Páginas Públicas</h3>
              <p>Acessíveis a qualquer visitante do site, não requerem autenticação.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">Módulos Administrativos</h3>
              <p>Requerem login e permissões específicas para acesso.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">Dashboard</h3>
              <p>Área principal para usuários autenticados com visão geral do sistema.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">Autenticação</h3>
              <p>Sistema de login integrado com controle de permissões por perfil.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteMapPage;