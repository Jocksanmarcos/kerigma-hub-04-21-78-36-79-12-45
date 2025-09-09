import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Calendar, Play } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CelulaMultiplicacao {
  id: string;
  nome: string;
  lider: string;
  percentual: number;
  membros: number;
  motivo: string;
  cor: 'green' | 'yellow';
}

async function fetchCelulasProntasMultiplicacao(): Promise<CelulaMultiplicacao[]> {
  try {
    const { data: celulas, error } = await supabase
      .from('celulas')
      .select(`
        id,
        nome,
        lider:pessoas!lider_id(nome_completo)
      `)
      .eq('ativa', true);

    if (error) throw error;

    // Simular dados de células prontas para multiplicação
    const celulasProntas: CelulaMultiplicacao[] = [
      {
        id: '1',
        nome: 'Célula Jardim Europa',
        lider: 'Maria Silva',
        percentual: 95,
        membros: 16,
        motivo: 'Crescimento constante, liderança madura, presença alta',
        cor: 'green'
      },
      {
        id: '2',
        nome: 'Célula Bela Vista',
        lider: 'Pedro Lima',
        percentual: 88,
        membros: 14,
        motivo: 'Muitos visitantes, líder em treinamento disponível',
        cor: 'yellow'
      }
    ];

    return celulasProntas;
  } catch (error) {
    console.error('Erro ao buscar células prontas para multiplicação:', error);
    return [];
  }
}

export const CelulasProntasMultiplicacao: React.FC = () => {
  const { data: celulas = [], isLoading } = useQuery({
    queryKey: ['celulas-prontas-multiplicacao'],
    queryFn: fetchCelulasProntasMultiplicacao,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const handleIniciarMultiplicacao = (celula: CelulaMultiplicacao) => {
    toast.success(`Processo de multiplicação iniciado para ${celula.nome}`);
  };

  const handleAgendarReuniao = (celula: CelulaMultiplicacao) => {
    toast.success(`Reunião agendada para ${celula.nome}`);
  };

  const getPercentualColor = (percentual: number) => {
    if (percentual >= 90) return 'text-green-600 bg-green-50 dark:bg-green-950/30';
    if (percentual >= 80) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30';
    return 'text-blue-600 bg-blue-50 dark:bg-blue-950/30';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Células Prontas para Multiplicação</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          IA sugere células com potencial para multiplicação baseado em métricas de crescimento
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Carregando células...
          </div>
        ) : celulas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma célula pronta para multiplicação no momento
          </div>
        ) : (
          <div className="space-y-4">
            {celulas.map((celula) => (
              <div key={celula.id} className={`p-4 rounded-lg border-l-4 ${
                celula.cor === 'green' ? 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20' : 
                'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{celula.nome}</h3>
                    <p className="text-sm text-muted-foreground">Líder: {celula.lider}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold px-3 py-1 rounded-full ${getPercentualColor(celula.percentual)}`}>
                      {celula.percentual}%
                    </div>
                    <Badge variant="outline" className="mt-1">
                      <Users className="h-3 w-3 mr-1" />
                      {celula.membros} membros
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">{celula.motivo}</p>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleIniciarMultiplicacao(celula)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar Multiplicação
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAgendarReuniao(celula)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar Reunião
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};