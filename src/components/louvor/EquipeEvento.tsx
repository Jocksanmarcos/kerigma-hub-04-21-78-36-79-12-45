import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Mail, Phone, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EquipeEventoProps {
  eventoId: string;
}

interface MembroEscalado {
  id: string;
  status: string;
  observacoes?: string;
  data_resposta?: string;
  pessoas: {
    nome_completo: string;
    email: string;
    telefone?: string;
  };
  louvor_cargos: {
    nome_cargo: string;
    cor: string;
  };
}

export const EquipeEvento: React.FC<EquipeEventoProps> = ({ eventoId }) => {
  const { data: equipe, isLoading } = useQuery({
    queryKey: ['equipe-evento', eventoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('escalas_membros')
        .select(`
          *,
          pessoas(nome_completo, email, telefone),
          louvor_cargos(nome_cargo, cor)
        `)
        .eq('evento_id', eventoId)
        .order('louvor_cargos.nome_cargo');
      
      if (error) throw error;
      return data as MembroEscalado[];
    },
    enabled: !!eventoId
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmado': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pendente': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'recusado': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'default';
      case 'pendente': return 'secondary';
      case 'recusado': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmado': return 'Confirmado';
      case 'pendente': return 'Pendente';
      case 'recusado': return 'Recusado';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!equipe || equipe.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Nenhum membro escalado para este evento</p>
      </div>
    );
  }

  const membrosConfirmados = equipe.filter(m => m.status === 'confirmado').length;
  const membrosPendentes = equipe.filter(m => m.status === 'pendente').length;
  const membrosRecusados = equipe.filter(m => m.status === 'recusado').length;

  return (
    <div className="space-y-4">
      {/* Resumo da equipe */}
      <div className="grid grid-cols-3 gap-4 p-3 bg-muted/50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{membrosConfirmados}</div>
          <div className="text-xs text-muted-foreground">Confirmados</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{membrosPendentes}</div>
          <div className="text-xs text-muted-foreground">Pendentes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{membrosRecusados}</div>
          <div className="text-xs text-muted-foreground">Recusados</div>
        </div>
      </div>

      {/* Lista da equipe */}
      <div className="space-y-3">
        {equipe.map((membro) => (
          <div 
            key={membro.id}
            className="flex items-center justify-between p-3 rounded-lg border"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: membro.louvor_cargos.cor }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">{membro.pessoas.nome_completo}</p>
                  {getStatusIcon(membro.status)}
                </div>
                <p className="text-sm text-muted-foreground">{membro.louvor_cargos.nome_cargo}</p>
                {membro.observacoes && (
                  <p className="text-xs text-muted-foreground mt-1">{membro.observacoes}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={getStatusColor(membro.status)}>
                {getStatusLabel(membro.status)}
              </Badge>
              
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = `mailto:${membro.pessoas.email}`}
                  title="Enviar email"
                >
                  <Mail className="h-4 w-4" />
                </Button>
                {membro.pessoas.telefone && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = `tel:${membro.pessoas.telefone}`}
                    title="Ligar"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estatísticas detalhadas */}
      <div className="pt-4 border-t">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Total: {equipe.length} membros escalados
          </span>
          <span>
            Taxa de confirmação: {equipe.length > 0 ? Math.round((membrosConfirmados / equipe.length) * 100) : 0}%
          </span>
        </div>
      </div>
    </div>
  );
};