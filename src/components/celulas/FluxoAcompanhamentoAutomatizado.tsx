import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Users, Brain, UserPlus } from 'lucide-react';

interface EtapaFluxo {
  numero: number;
  titulo: string;
  descricao: string;
  icone: React.ReactNode;
  cor: string;
  status: 'ativo' | 'completo' | 'pendente';
}

export const FluxoAcompanhamentoAutomatizado: React.FC = () => {
  const etapas: EtapaFluxo[] = [
    {
      numero: 1,
      titulo: 'Cadastro Automático',
      descricao: 'Quando um líder reporta um visitante, o sistema cria automaticamente uma tarefa de acompanhamento',
      icone: <CheckCircle className="h-6 w-6" />,
      cor: 'bg-blue-500 text-white',
      status: 'ativo'
    },
    {
      numero: 2,
      titulo: 'Atribuição ao Supervisor',
      descricao: 'A tarefa é automaticamente atribuída ao supervisor da célula com prazo de 48h para primeiro contato',
      icone: <Users className="h-6 w-6" />,
      cor: 'bg-green-500 text-white',
      status: 'ativo'
    },
    {
      numero: 3,
      titulo: 'Lembretes Inteligentes',
      descricao: 'Sistema envia lembretes e sugere próximas ações baseado no status do visitante',
      icone: <Brain className="h-6 w-6" />,
      cor: 'bg-purple-500 text-white',
      status: 'ativo'
    },
    {
      numero: 4,
      titulo: 'Integração na Jornada do Membro',
      descricao: 'Visitantes convertidos são automaticamente inseridos na jornada de crescimento da igreja',
      icone: <UserPlus className="h-6 w-6" />,
      cor: 'bg-orange-500 text-white',
      status: 'ativo'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return <Badge className="bg-emerald-500 text-white">Ativo</Badge>;
      case 'completo':
        return <Badge className="bg-blue-500 text-white">Completo</Badge>;
      case 'pendente':
        return <Badge variant="outline">Pendente</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5" />
          <span>Fluxo de Acompanhamento Automatizado</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Como o sistema automaticamente acompanha novos visitantes
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {etapas.map((etapa, index) => (
            <div key={etapa.numero} className="flex items-start space-x-4">
              {/* Número e linha de conexão */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full ${etapa.cor} flex items-center justify-center font-bold text-lg`}>
                  {etapa.numero}
                </div>
                {index < etapas.length - 1 && (
                  <div className="w-px h-16 bg-border mt-2" />
                )}
              </div>
              
              {/* Conteúdo da etapa */}
              <div className="flex-1 min-h-[80px]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{etapa.titulo}</h3>
                  {getStatusBadge(etapa.status)}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {etapa.descricao}
                </p>
              </div>
              
              {/* Ícone */}
              <div className="text-muted-foreground">
                {etapa.icone}
              </div>
            </div>
          ))}
        </div>
        
        {/* Resumo */}
        <div className="mt-8 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            <span className="font-semibold">Sistema 100% Operacional</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Todas as etapas do fluxo automatizado estão funcionando corretamente. 
            Nenhuma intervenção manual necessária no momento.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};