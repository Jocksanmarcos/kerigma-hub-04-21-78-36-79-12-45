import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Upload, MessageSquare, Calendar, FileText, Settings, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const QuickActions: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Ver Site',
      description: 'Ativar modo de edição',
      icon: Eye,
      action: () => {
        navigate('/');
        try {
          const { useEditMode } = require('@/contexts/EditModeContext');
          const { setEditMode } = useEditMode();
          setEditMode(true);
        } catch (error) {
          // EditMode context not available, just navigate
          console.log('EditMode context not available');
        }
      },
    },
    {
      title: 'Novo Curso',
      description: 'Criar um novo curso',
      icon: Plus,
      action: () => {
        toast({
          title: "Novo Curso",
          description: "Funcionalidade de criação de curso será implementada em breve!",
        });
      },
    },
    {
      title: 'Upload de Conteúdo',
      description: 'Adicionar materiais',
      icon: Upload,
      action: () => {
        toast({
          title: "Upload de Conteúdo",
          description: "Funcionalidade de upload será implementada em breve!",
        });
      },
    },
    {
      title: 'Mensagens',
      description: 'Enviar comunicados',
      icon: MessageSquare,
      action: () => {
        toast({
          title: "Mensagens",
          description: "Sistema de mensagens será implementado em breve!",
        });
      },
    },
    {
      title: 'Agendar Evento',
      description: 'Marcar novo evento',
      icon: Calendar,
      action: () => {
        toast({
          title: "Agendar Evento",
          description: "Calendário de eventos será implementado em breve!",
        });
      },
    },
    {
      title: 'Relatórios',
      description: 'Gerar relatórios',
      icon: FileText,
      action: () => {
        toast({
          title: "Relatórios",
          description: "Sistema de relatórios será implementado em breve!",
        });
      },
    },
    {
      title: 'Configurações',
      description: 'Ajustes do sistema',
      icon: Settings,
      action: () => {
        toast({
          title: "Configurações",
          description: "Painel de configurações será implementado em breve!",
        });
      },
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/20"
              onClick={action.action}
            >
              <action.icon className="h-5 w-5 text-primary" />
              <div className="text-center">
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs text-muted-foreground">
                  {action.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};