import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download, 
  Calendar,
  Users,
  Target,
  Activity,
  Mail,
  Printer
} from 'lucide-react';
import { toast } from 'sonner';

interface RelatorioConfig {
  tipo: string;
  periodo: {
    from?: Date;
    to?: Date;
  };
  celulas: string[];
  formato: 'pdf' | 'excel' | 'csv';
}

export const RelatoriosAvancados: React.FC = () => {
  const [config, setConfig] = useState<RelatorioConfig>({
    tipo: '',
    periodo: {},
    celulas: [],
    formato: 'pdf'
  });

  const tiposRelatorio = [
    { 
      value: 'crescimento', 
      label: 'Crescimento e Multiplicação',
      descricao: 'Análise de crescimento, novos membros e multiplicações',
      icone: <TrendingUp className="h-5 w-5" />
    },
    { 
      value: 'frequencia', 
      label: 'Frequência e Presença',
      descricao: 'Relatório detalhado de presença e frequência',
      icone: <Users className="h-5 w-5" />
    },
    { 
      value: 'lideres', 
      label: 'Performance de Líderes',
      descricao: 'Avaliação de performance e desenvolvimento de líderes',
      icone: <Target className="h-5 w-5" />
    },
    { 
      value: 'visitantes', 
      label: 'Acompanhamento de Visitantes',
      descricao: 'Relatório de visitantes e conversões',
      icone: <Activity className="h-5 w-5" />
    },
    { 
      value: 'financeiro', 
      label: 'Relatório Financeiro',
      descricao: 'Ofertas, dízimos e movimentação financeira',
      icone: <BarChart3 className="h-5 w-5" />
    },
    { 
      value: 'geografico', 
      label: 'Distribuição Geográfica',
      descricao: 'Mapeamento e distribuição geográfica das células',
      icone: <PieChart className="h-5 w-5" />
    }
  ];

  const handleGerarRelatorio = () => {
    if (!config.tipo) {
      toast.error('Selecione o tipo de relatório');
      return;
    }

    const tipoSelecionado = tiposRelatorio.find(t => t.value === config.tipo);
    
    toast.success(`🔄 Gerando ${tipoSelecionado?.label}...`);
    
    setTimeout(() => {
      // Simular geração de relatório
      const nomeArquivo = `relatorio-${config.tipo}-${new Date().toISOString().split('T')[0]}.${config.formato}`;
      
      const dadosRelatorio = `
📊 RELATÓRIO: ${tipoSelecionado?.label.toUpperCase()}
Período: ${config.periodo?.from?.toLocaleDateString('pt-BR')} - ${config.periodo?.to?.toLocaleDateString('pt-BR')}
Formato: ${config.formato.toUpperCase()}
Data de Geração: ${new Date().toLocaleString('pt-BR')}

${tipoSelecionado?.descricao}

--- DADOS SIMULADOS ---
Total de Células Analisadas: 23
Membros Ativos: 187
Taxa de Crescimento: +8.5%
Presença Média: 85.9%
Visitantes Convertidos: 15
Multiplicações Realizadas: 3

--- FIM DO RELATÓRIO ---
      `;

      const blob = new Blob([dadosRelatorio], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nomeArquivo;
      a.click();
      
      toast.success(`✅ Relatório "${tipoSelecionado?.label}" gerado com sucesso!`);
    }, 2000);
  };

  const handleEnviarPorEmail = () => {
    if (!config.tipo) {
      toast.error('Selecione o tipo de relatório primeiro');
      return;
    }

    toast.success('📧 Relatório enviado por email para supervisores!');
  };

  const handleImprimirRelatorio = () => {
    if (!config.tipo) {
      toast.error('Selecione o tipo de relatório primeiro');
      return;
    }

    toast.success('🖨️ Enviando relatório para impressão...');
  };

  const handleAgendarRelatorio = () => {
    toast.success('📅 Relatório agendado para geração automática mensal!');
  };

  return (
    <div className="space-y-6">
      {/* Configuração do Relatório */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Relatórios Avançados</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure e gere relatórios detalhados sobre suas células
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Período</label>
              <div className="grid gap-2 md:grid-cols-2">
                <Input
                  type="date"
                  placeholder="Data inicial"
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    periodo: { ...prev.periodo, from: new Date(e.target.value) }
                  }))}
                />
                <Input
                  type="date"
                  placeholder="Data final"
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    periodo: { ...prev.periodo, to: new Date(e.target.value) }
                  }))}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Formato de Saída</label>
              <Select value={config.formato} onValueChange={(formato: 'pdf' | 'excel' | 'csv') => setConfig(prev => ({ ...prev, formato }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button onClick={handleGerarRelatorio} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Gerar Relatório
            </Button>
            <Button variant="outline" onClick={handleEnviarPorEmail}>
              <Mail className="h-4 w-4 mr-2" />
              Enviar por Email
            </Button>
            <Button variant="outline" onClick={handleImprimirRelatorio}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="outline" onClick={handleAgendarRelatorio}>
              <Calendar className="h-4 w-4 mr-2" />
              Agendar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tipos de Relatórios */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tiposRelatorio.map((tipo) => (
          <Card 
            key={tipo.value} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              config.tipo === tipo.value ? 'ring-2 ring-blue-500 border-blue-500' : ''
            }`}
            onClick={() => setConfig(prev => ({ ...prev, tipo: tipo.value }))}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {tipo.icone}
                  <CardTitle className="text-base">{tipo.label}</CardTitle>
                </div>
                {config.tipo === tipo.value && (
                  <Badge className="bg-blue-500 text-white">Selecionado</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {tipo.descricao}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Relatórios Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="font-medium">Relatório de Crescimento - Dezembro 2024</p>
                <p className="text-sm text-muted-foreground">Gerado em 15/12/2024 às 14:30</p>
              </div>
              <div className="flex space-x-2">
                <Badge variant="outline">PDF</Badge>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="font-medium">Frequência e Presença - Novembro 2024</p>
                <p className="text-sm text-muted-foreground">Gerado em 01/12/2024 às 09:15</p>
              </div>
              <div className="flex space-x-2">
                <Badge variant="outline">Excel</Badge>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="font-medium">Performance de Líderes - Outubro 2024</p>
                <p className="text-sm text-muted-foreground">Gerado em 30/10/2024 às 16:45</p>
              </div>
              <div className="flex space-x-2">
                <Badge variant="outline">CSV</Badge>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agendamentos Automáticos */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Agendados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-green-200 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  Relatório Mensal de Crescimento
                </p>
                <p className="text-sm text-green-600 dark:text-green-300">
                  Próxima geração: 01/01/2025 às 08:00
                </p>
              </div>
              <Badge className="bg-green-500 text-white">Ativo</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-blue-200 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200">
                  Relatório Semanal de Frequência
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  Próxima geração: 22/12/2024 às 18:00
                </p>
              </div>
              <Badge className="bg-blue-500 text-white">Ativo</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};