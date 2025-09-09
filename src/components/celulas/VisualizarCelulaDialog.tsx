import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, User, Crown, Shield, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CelulaDetalhes {
  id: string;
  nome: string;
  endereco: string | null;
  dia_reuniao: string | null;
  horario_reuniao: string | null;
  ativa: boolean;
  lider_nome: string | null;
  supervisor_nome: string | null;
  coordenador_nome: string | null;
  pastor_rede_nome: string | null;
  total_membros: number;
  ultimo_relatorio: string | null;
  status_saude: 'excelente' | 'boa' | 'atencao' | 'critica';
}

interface VisualizarCelulaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  celula: CelulaDetalhes | null;
}

export const VisualizarCelulaDialog: React.FC<VisualizarCelulaDialogProps> = ({
  open,
  onOpenChange,
  celula
}) => {
  if (!celula) return null;

  const getStatusBadge = (status: CelulaDetalhes['status_saude']) => {
    const variants = {
      excelente: 'default',
      boa: 'secondary',
      atencao: 'outline',
      critica: 'destructive'
    } as const;

    const labels = {
      excelente: 'Excelente',
      boa: 'Boa',
      atencao: 'Atenção',
      critica: 'Crítica'
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Detalhes da Célula
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{celula.nome}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <div className="flex gap-2">
                  <Badge variant={celula.ativa ? 'default' : 'destructive'}>
                    {celula.ativa ? 'Ativa' : 'Inativa'}
                  </Badge>
                  {getStatusBadge(celula.status_saude)}
                </div>
              </div>

              {celula.endereco && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <span className="text-sm">{celula.endereco}</span>
                </div>
              )}

              {celula.dia_reuniao && celula.horario_reuniao && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{celula.dia_reuniao}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{celula.horario_reuniao}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{celula.total_membros} membros</span>
              </div>
            </CardContent>
          </Card>

          {/* Liderança */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Liderança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Líder:</span>
                </div>
                <span className="text-sm">
                  {celula.lider_nome || <span className="text-muted-foreground italic">Não definido</span>}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Supervisor:</span>
                </div>
                <span className="text-sm">
                  {celula.supervisor_nome || <span className="text-muted-foreground italic">Não definido</span>}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Coordenador:</span>
                </div>
                <span className="text-sm">
                  {celula.coordenador_nome || <span className="text-muted-foreground italic">Não definido</span>}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Pastor de Rede:</span>
                </div>
                <span className="text-sm">
                  {celula.pastor_rede_nome || <span className="text-muted-foreground italic">Não definido</span>}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Relatórios */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Relatórios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Último relatório:</span>
                <span className="text-sm">
                  {celula.ultimo_relatorio ? (
                    format(new Date(celula.ultimo_relatorio), 'dd/MM/yyyy', { locale: ptBR })
                  ) : (
                    <span className="text-muted-foreground italic">Nenhum relatório</span>
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};