import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useScheduling, type TeamFunction, type VolunteerSuggestion } from '@/hooks/useScheduling';
import { Users, UserPlus, Clock, TrendingUp, Mail, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface IntelligentSchedulerProps {
  planId: string;
  planTitle: string;
  serviceDate: string;
}

export const IntelligentScheduler: React.FC<IntelligentSchedulerProps> = ({
  planId,
  planTitle,
  serviceDate
}) => {
  const {
    teams,
    teamsLoading,
    getTeamFunctions,
    getVolunteerSuggestions,
    createAutomaticInvitations,
    sendPendingNotifications,
    suggestionsLoading,
    invitationsLoading,
    notificationsLoading
  } = useScheduling();

  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [teamFunctions, setTeamFunctions] = useState<TeamFunction[]>([]);
  const [functionsLoading, setFunctionsLoading] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [suggestions, setSuggestions] = useState<VolunteerSuggestion[]>([]);
  const [selectedVolunteers, setSelectedVolunteers] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Carregar funções quando equipe é selecionada
  useEffect(() => {
    if (selectedTeam) {
      setFunctionsLoading(true);
      getTeamFunctions(selectedTeam)
        .then(setTeamFunctions)
        .catch(error => {
          console.error('Erro ao buscar funções:', error);
          toast.error('Erro ao carregar funções da equipe');
        })
        .finally(() => setFunctionsLoading(false));
    }
  }, [selectedTeam, getTeamFunctions]);

  // Buscar sugestões quando função é selecionada
  const handleGetSuggestions = async () => {
    if (!selectedFunction) return;

    try {
      const suggestionsData = await getVolunteerSuggestions({
        functionId: selectedFunction,
        serviceDate,
        limit: 10
      });
      setSuggestions(suggestionsData);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
      toast.error('Erro ao buscar sugestões de voluntários');
    }
  };

  // Criar convites automáticos
  const handleCreateInvitations = async () => {
    if (!selectedFunction) return;

    try {
      await createAutomaticInvitations({
        planId,
        functionId: selectedFunction,
        quantity
      });
      setShowSuggestions(false);
      setSelectedVolunteers([]);
    } catch (error) {
      console.error('Erro ao criar convites:', error);
    }
  };

  // Enviar notificações
  const handleSendNotifications = async () => {
    try {
      await sendPendingNotifications();
    } catch (error) {
      console.error('Erro ao enviar notificações:', error);
    }
  };

  const renderVolunteerBadge = (volunteer: VolunteerSuggestion) => {
    const getStatusColor = () => {
      if (!volunteer.disponivel) return 'destructive';
      if (volunteer.pontuacao >= 80) return 'default';
      if (volunteer.pontuacao >= 50) return 'secondary';
      return 'outline';
    };

    const getStatusText = () => {
      if (!volunteer.disponivel) return 'Indisponível';
      if (volunteer.pontuacao >= 80) return 'Altamente Recomendado';
      if (volunteer.pontuacao >= 50) return 'Recomendado';
      return 'Disponível';
    };

    return (
      <Badge variant={getStatusColor()}>
        {getStatusText()}
      </Badge>
    );
  };

  if (teamsLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Convocatória Inteligente - {planTitle}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Data do serviço: {new Date(serviceDate).toLocaleDateString('pt-BR')}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleção de Equipe */}
          <div className="space-y-2">
            <Label htmlFor="team-select">Selecionar Equipe Ministerial</Label>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha uma equipe ministerial" />
              </SelectTrigger>
              <SelectContent>
                {teams?.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.nome_equipa} - {team.ministerios?.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seleção de Função */}
          {selectedTeam && (
            <div className="space-y-2">
              <Label htmlFor="function-select">Selecionar Função</Label>
              <Select 
                value={selectedFunction} 
                onValueChange={setSelectedFunction}
                disabled={functionsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={functionsLoading ? "Carregando funções..." : "Escolha uma função"} />
                </SelectTrigger>
                <SelectContent>
                  {teamFunctions.map((func) => (
                    <SelectItem key={func.id} value={func.id}>
                      {func.nome_funcao}
                      <Badge variant="outline" className="ml-2">
                        {func.nivel_experiencia}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Quantidade de Voluntários */}
          {selectedFunction && (
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade de Voluntários Necessários</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                max={10}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-32"
              />
            </div>
          )}

          {/* Botões de Ação */}
          {selectedFunction && (
            <div className="flex gap-3">
              <Button 
                onClick={handleGetSuggestions}
                disabled={suggestionsLoading}
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                {suggestionsLoading ? 'Buscando...' : 'Ver Sugestões de IA'}
              </Button>
              
              <Button 
                onClick={handleCreateInvitations}
                disabled={invitationsLoading}
                variant="default"
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                {invitationsLoading ? 'Enviando...' : 'Convocar Automaticamente'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sugestões de Voluntários */}
      {showSuggestions && suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sugestões de Voluntários</CardTitle>
            <p className="text-sm text-muted-foreground">
              Baseado em disponibilidade, experiência e histórico de serviços
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suggestions.map((volunteer) => (
                <div
                  key={volunteer.pessoa_id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <h4 className="font-medium">{volunteer.nome}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">{volunteer.nivel_competencia}</Badge>
                        {volunteer.ultima_vez_serviu ? (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Último serviço: há {volunteer.dias_desde_ultimo_servico} dias
                          </span>
                        ) : (
                          <span className="text-amber-600">Primeiro serviço</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        Pontuação: {volunteer.pontuacao}
                      </div>
                      {renderVolunteerBadge(volunteer)}
                    </div>
                  </div>
                </div>
              ))}
              
              <Separator />
              
              <div className="flex justify-between items-center pt-4">
                <p className="text-sm text-muted-foreground">
                  {suggestions.filter(v => v.disponivel).length} de {suggestions.length} voluntários disponíveis
                </p>
                <Button 
                  onClick={handleCreateInvitations}
                  disabled={invitationsLoading}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  {invitationsLoading ? 'Enviando Convites...' : `Convocar ${quantity} Voluntário${quantity > 1 ? 's' : ''}`}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações Globais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gerenciar Notificações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button 
              onClick={handleSendNotifications}
              disabled={notificationsLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              {notificationsLoading ? 'Enviando...' : 'Enviar Notificações Pendentes'}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Envia emails de convite para todos os voluntários convocados que ainda não receberam notificação.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};