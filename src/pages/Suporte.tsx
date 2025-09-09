
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, MessageSquare, Book, Video, Phone, Mail, Crown, Shield, User } from 'lucide-react';
import { ChatbotSupporte } from '@/components/suporte/ChatbotSupporte';
import { AppLayout } from '@/components/layout/AppLayout';
import { useNewUserRole, newRolePermissions } from '@/hooks/useNewRole';

export default function Suporte() {
  const { data: userRole, isLoading } = useNewUserRole();
  
  const recursosSupporte = [
    {
      icon: <Book className="h-6 w-6" />,
      title: 'Documentação Completa',
      description: 'Guias detalhados para cada módulo da plataforma',
      action: 'Acessar Documentação',
      available: true
    },
    {
      icon: <Video className="h-6 w-6" />,
      title: 'Vídeo Tutoriais',
      description: 'Aprenda visualmente com tutoriais passo a passo',
      action: 'Assistir Vídeos',
      available: true
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: 'Suporte por Telefone',
      description: 'Atendimento direto com nossa equipe especializada',
      action: '(11) 9999-9999',
      available: true
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: 'Email de Suporte',
      description: 'Envie dúvidas detalhadas com screenshots',
      action: 'suporte@kerigmahub.com',
      available: true
    }
  ];

  const todasPerguntas = [
    // Perguntas para Pastor (todas)
    {
      pergunta: 'Como começar a configurar minha igreja na plataforma?',
      resposta: 'Acesse "Configurações da Igreja" no menu lateral, preencha os dados básicos (nome, endereço, CNPJ) e configure os ministérios iniciais. Em seguida, comece cadastrando os líderes principais.',
      categoria: 'setup',
      perfis: ['pastor']
    },
    {
      pergunta: 'Como gerenciar permissões dos líderes de ministério?',
      resposta: 'Acesse o painel de Governança no menu Administração para gerenciar perfis e permissões dos líderes. Cada papel tem permissões específicas para seus ministérios (células, financeiro, eventos, etc.).',
      categoria: 'usuarios',
      perfis: ['pastor']
    },
    {
      pergunta: 'Como criar relatórios personalizados para a liderança?',
      resposta: 'Acesse "Relatórios" e escolha "Relatório Personalizado". Selecione os dados desejados (crescimento, financeiro, eventos) e defina o período. O relatório pode ser exportado ou enviado por email.',
      categoria: 'relatorios',
      perfis: ['pastor', 'lider']
    },
    {
      pergunta: 'Como usar a IA Pastoral para aconselhamento?',
      resposta: 'A IA Pastoral está no menu "Ministérios". Digite situações ou dúvidas pastorais e receba orientações bíblicas, sugestões de versículos e direcionamentos para aconselhamento pastoral.',
      categoria: 'ia',
      perfis: ['pastor']
    },
    {
      pergunta: 'Como organizar eventos e controlar presenças?',
      resposta: 'No módulo "Eventos", crie o evento, defina local e horário, adicione participantes esperados e ative o check-in por QR Code. Durante o evento, use o scanner para registrar presenças.',
      categoria: 'eventos',
      perfis: ['pastor', 'lider', 'membro']
    },
    {
      pergunta: 'Como fazer o controle financeiro da igreja?',
      resposta: 'Use o módulo "Financeiro" para registrar dízimos, ofertas e despesas. Configure categorias específicas (dízimos, ofertas especiais, gastos operacionais) e gere relatórios mensais automaticamente.',
      categoria: 'financeiro',
      perfis: ['pastor']
    },
    // Perguntas específicas para Líderes
    {
      pergunta: 'Como gerenciar minha célula?',
      resposta: 'Acesse "Células" no menu, selecione sua célula e use as abas para: cadastrar membros, agendar reuniões, registrar presenças e criar relatórios semanais de crescimento.',
      categoria: 'celulas',
      perfis: ['lider', 'pastor']
    },
    {
      pergunta: 'Como criar escalas para minha equipe?',
      resposta: 'No menu "Escalas", crie uma nova escala, defina as funções necessárias, adicione voluntários e configure a frequência. O sistema enviará notificações automáticas.',
      categoria: 'escalas',
      perfis: ['lider', 'pastor']
    },
    // Perguntas específicas para Membros
    {
      pergunta: 'Como visualizar minha agenda de eventos?',
      resposta: 'Acesse o menu "Agenda" para ver todos os eventos em que você está inscrito. Use o calendário para navegar entre os meses e clique nos eventos para ver mais detalhes.',
      categoria: 'agenda',
      perfis: ['membro', 'lider', 'pastor']
    },
    {
      pergunta: 'Como me inscrever em eventos da igreja?',
      resposta: 'No menu "Eventos", navegue pelos eventos disponíveis e clique em "Inscrever-se". Você receberá uma confirmação por email e pode acompanhar suas inscrições na sua agenda.',
      categoria: 'eventos',
      perfis: ['membro', 'lider', 'pastor']
    },
    {
      pergunta: 'Como acessar cursos de ensino?',
      resposta: 'Vá para o menu "Ensino" e explore os cursos disponíveis. Clique em "Matricular-se" no curso desejado e acompanhe seu progresso através das lições disponíveis.',
      categoria: 'ensino',
      perfis: ['membro', 'lider', 'pastor']
    }
  ];

  // Filtrar perguntas baseado no perfil do usuário
  const perguntasFrequentes = userRole ? 
    todasPerguntas.filter(pergunta => pergunta.perfis.includes(userRole)) : 
    todasPerguntas.filter(pergunta => pergunta.perfis.includes('membro'));

  const getPerfilIcon = (perfil: string) => {
    switch (perfil) {
      case 'pastor': return <Crown className="h-4 w-4" />;
      case 'lider': return <Shield className="h-4 w-4" />;
      case 'membro': return <User className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getPerfilColor = (perfil: string) => {
    switch (perfil) {
      case 'pastor': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'lider': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'membro': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <AppLayout>
      <Helmet>
        <title>Suporte - Kerigma Hub</title>
        <meta name="description" content="Central de ajuda e suporte da plataforma Kerigma Hub. Chat inteligente, tutoriais e recursos de apoio." />
        <meta property="og:title" content="Suporte - Kerigma Hub" />
        <meta property="og:description" content="Central de ajuda e suporte da plataforma Kerigma Hub. Chat inteligente, tutoriais e recursos de apoio." />
      </Helmet>

      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <HelpCircle className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Central de Suporte</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Encontre respostas para suas dúvidas sobre a plataforma Kerigma Hub. 
            Use nosso assistente inteligente ou explore nossos recursos de ajuda.
          </p>
        </div>

        {/* Assistente Inteligente */}
        <div className="space-y-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Assistente Inteligente</h2>
            </div>
            <p className="text-muted-foreground">
              Converse com nosso assistente especializado em dúvidas sobre a plataforma
            </p>
          </div>
          
          <ChatbotSupporte />
        </div>

        {/* Outros Recursos de Suporte */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Outros Recursos de Apoio</h2>
            <p className="text-muted-foreground">
              Explore outras formas de obter ajuda e suporte
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recursosSupporte.map((recurso, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-2 text-primary group-hover:scale-110 transition-transform">
                    {recurso.icon}
                  </div>
                  <CardTitle className="text-lg">{recurso.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  <CardDescription>
                    {recurso.description}
                  </CardDescription>
                  <div className="pt-2">
                    <span className="text-sm font-medium text-primary">
                      {recurso.action}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Rápido */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Perguntas Frequentes</h2>
            <p className="text-muted-foreground">
              {userRole ? `Perguntas personalizadas para ${newRolePermissions[userRole]?.name || 'seu perfil'}` : 'Respostas rápidas para as dúvidas mais comuns'}
            </p>
            {userRole && (
              <div className="mt-2">
                <Badge variant="secondary" className={getPerfilColor(userRole)}>
                  {getPerfilIcon(userRole)}
                  <span className="ml-2">Conteúdo personalizado para {newRolePermissions[userRole]?.name}</span>
                </Badge>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {perguntasFrequentes.map((faq, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg leading-tight">{faq.pergunta}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {faq.resposta}
                  </p>
                  <div className="mt-3">
                    <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full capitalize">
                      {faq.categoria}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
