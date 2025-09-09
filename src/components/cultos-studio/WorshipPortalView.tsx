import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Music, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  Eye,
  Volume2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import SoundStudioEnhancer from './SoundStudioEnhancer';
import MusicLibraryManager from './MusicLibraryManager';

interface Invitation {
  id: string;
  funcao: string;
  status_confirmacao: string;
  data_convite: string;
  data_resposta?: string;
  observacoes?: string;
  plano_id: string;
  culto_planos?: {
    tema_culto: string;
    agendamento_id?: string;
    agendamentos?: {
      titulo: string;
      data_hora_inicio: string;
      local?: string;
    };
  };
}

interface SetlistItem {
  id: string;
  musica_id: string;
  ordem: number;
  tonalidade_escolhida?: string;
  observacoes?: string;
  musicas?: {
    titulo: string;
    artista?: string;
    tonalidade_original?: string;
  };
}

const WorshipPortalView: React.FC = () => {
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [upcomingServices, setUpcomingServices] = useState<any[]>([]);
  const [currentSetlist, setCurrentSetlist] = useState<SetlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortalData();
  }, []);

  const loadPortalData = async () => {
    try {
      setLoading(true);

      // Carregar convites pendentes
      const { data: invitesData, error: invitesError } = await supabase
        .from('escalas_servico')
        .select(`
          *,
          culto_planos!inner(
            tema_culto,
            agendamento_id,
            agendamentos(titulo, data_hora_inicio, local)
          )
        `)
        .in('status_confirmacao', ['Convidado', 'Confirmado'])
        .order('data_convite', { ascending: false });

      if (invitesError) throw invitesError;
      setInvitations(invitesData || []);

      // Carregar próximos cultos
      const { data: servicesData, error: servicesError } = await supabase
        .from('agendamentos')
        .select(`
          *,
          culto_planos(
            tema_culto,
            dirigente_id,
            pregador_id,
            pessoas_dirigente:pessoas!dirigente_id(nome_completo),
            pessoas_pregador:pessoas!pregador_id(nome_completo)
          )
        `)
        .gte('data_hora_inicio', new Date().toISOString())
        .order('data_hora_inicio')
        .limit(5);

      if (servicesError) throw servicesError;
      setUpcomingServices(servicesData || []);

    } catch (error: any) {
      console.error('Erro ao carregar dados do portal:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const respondToInvitation = async (invitationId: string, status: 'Confirmado' | 'Recusado') => {
    try {
      const { error } = await supabase
        .from('escalas_servico')
        .update({
          status_confirmacao: status,
          data_resposta: new Date().toISOString()
        })
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Resposta registrada",
        description: `Convite ${status.toLowerCase()} com sucesso`,
      });

      await loadPortalData();
    } catch (error: any) {
      console.error('Erro ao responder convite:', error);
      toast({
        title: "Erro ao responder convite",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Convidado':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pendente</Badge>;
      case 'Confirmado':
        return <Badge variant="outline" className="text-green-600 border-green-600">Confirmado</Badge>;
      case 'Recusado':
        return <Badge variant="outline" className="text-red-600 border-red-600">Recusado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando portal...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Portal de Louvor e Ministérios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="invitations" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="invitations">Meus Convites</TabsTrigger>
              <TabsTrigger value="schedule">Próximos Cultos</TabsTrigger>
              <TabsTrigger value="music">Biblioteca Musical</TabsTrigger>
              <TabsTrigger value="ambience">Studio Sonoro</TabsTrigger>
              <TabsTrigger value="resources">Recursos</TabsTrigger>
            </TabsList>

            <TabsContent value="invitations" className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-semibold">Convites para Servir</h3>
                
                {invitations.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Nenhum convite pendente</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {invitations.map(invitation => (
                      <Card key={invitation.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <h4 className="font-semibold">
                                  {invitation.culto_planos?.tema_culto || 'Culto'}
                                </h4>
                                {getStatusBadge(invitation.status_confirmacao)}
                              </div>
                              
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  Função: {invitation.funcao}
                                </div>
                                
                                {invitation.culto_planos?.agendamentos && (
                                  <>
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4" />
                                      {format(
                                        new Date(invitation.culto_planos.agendamentos.data_hora_inicio),
                                        "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                                        { locale: ptBR }
                                      )}
                                    </div>
                                    
                                    {invitation.culto_planos.agendamentos.local && (
                                      <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        {invitation.culto_planos.agendamentos.local}
                                      </div>
                                    )}
                                  </>
                                )}
                                
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  Convidado em: {format(
                                    new Date(invitation.data_convite),
                                    "dd/MM/yyyy 'às' HH:mm",
                                    { locale: ptBR }
                                  )}
                                </div>
                              </div>

                              {invitation.observacoes && (
                                <div className="p-3 bg-muted rounded-md">
                                  <p className="text-sm">{invitation.observacoes}</p>
                                </div>
                              )}
                            </div>

                            {invitation.status_confirmacao === 'Convidado' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => respondToInvitation(invitation.id, 'Confirmado')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Aceitar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => respondToInvitation(invitation.id, 'Recusado')}
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Recusar
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-semibold">Próximos Cultos</h3>
                
                <div className="space-y-3">
                  {upcomingServices.map(service => (
                    <Card key={service.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <h4 className="font-semibold">
                              {service.titulo}
                            </h4>
                            
                            {service.culto_planos?.[0] && (
                              <p className="text-sm text-muted-foreground">
                                Tema: {service.culto_planos[0].tema_culto}
                              </p>
                            )}
                            
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {format(
                                  new Date(service.data_hora_inicio),
                                  "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                                  { locale: ptBR }
                                )}
                              </div>
                              
                              {service.local && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  {service.local}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              Ver Detalhes
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-1" />
                              PDF
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="music" className="space-y-4">
              <MusicLibraryManager />
            </TabsContent>

            <TabsContent value="ambience" className="space-y-4">
              <SoundStudioEnhancer />
            </TabsContent>

            <TabsContent value="resources" className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-semibold">Recursos e Materiais</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Volume2 className="h-12 w-12 mx-auto text-primary mb-4" />
                      <h4 className="font-semibold mb-2">Studio de Ambientação</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Crie ambientes sonoros para diferentes momentos do culto
                      </p>
                      <Button size="sm" className="w-full">Acessar</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 text-center">
                      <Users className="h-12 w-12 mx-auto text-primary mb-4" />
                      <h4 className="font-semibold mb-2">Guias Ministeriais</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Manuais e orientações para cada ministério
                      </p>
                      <Button size="sm" className="w-full">Acessar</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 text-center">
                      <Calendar className="h-12 w-12 mx-auto text-primary mb-4" />
                      <h4 className="font-semibold mb-2">Calendário Litúrgico</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Datas especiais e planejamento anual
                      </p>
                      <Button size="sm" className="w-full">Acessar</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorshipPortalView;