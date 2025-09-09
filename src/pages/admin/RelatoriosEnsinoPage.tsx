import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Download, FileSpreadsheet, FileText, TrendingUp, Users, BookOpen } from 'lucide-react';

const RelatoriosEnsinoPage: React.FC = () => {
  const [periodo, setPeriodo] = useState('mes');
  const [categoria, setCategoria] = useState('todos');

  React.useEffect(() => {
    document.title = "Relatórios de Ensino – Kerigma Hub";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Relatórios e analytics do centro de ensino");
  }, []);

  const estatisticas = {
    totalAlunos: 342,
    alunosAtivos: 287,
    cursosAtivos: 18,
    professoreses: 12,
    certificadosEmitidos: 156,
    horasEnsino: 2840,
    taxaConclusao: 78.5,
    notaMedia: 8.7
  };

  const cursosPopulares = [
    { nome: "Liderança Cristã", matriculas: 89, conclusoes: 67, taxa: 75.3 },
    { nome: "Evangelismo Pessoal", matriculas: 76, conclusoes: 62, taxa: 81.6 },
    { nome: "Discipulado Bíblico", matriculas: 54, conclusoes: 48, taxa: 88.9 },
    { nome: "Gestão de Células", matriculas: 43, conclusoes: 31, taxa: 72.1 },
    { nome: "Intercessão e Oração", matriculas: 38, conclusoes: 29, taxa: 76.3 }
  ];

  const desempenhoMensal = [
    { mes: "Jan", matriculas: 45, conclusoes: 23, certificados: 18 },
    { mes: "Fev", matriculas: 52, conclusoes: 31, certificados: 24 },
    { mes: "Mar", matriculas: 48, conclusoes: 29, certificados: 22 },
    { mes: "Abr", matriculas: 61, conclusoes: 38, certificados: 31 },
    { mes: "Mai", matriculas: 55, conclusoes: 42, certificados: 35 },
    { mes: "Jun", matriculas: 59, conclusoes: 45, certificados: 39 }
  ];

  return (
    <AppLayout>
      <main className="space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">Relatórios de Ensino</h1>
            <p className="text-muted-foreground">Analytics e relatórios do centro de ensino</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semana">Semana</SelectItem>
                <SelectItem value="mes">Mês</SelectItem>
                <SelectItem value="trimestre">Trimestre</SelectItem>
                <SelectItem value="ano">Ano</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => alert(`Exportando relatório do período: ${periodo}`)}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </header>

        {/* KPIs Principais */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Alunos</p>
                  <p className="text-2xl font-bold text-foreground">{estatisticas.totalAlunos}</p>
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +12% vs mês anterior
                  </p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cursos Ativos</p>
                  <p className="text-2xl font-bold text-foreground">{estatisticas.cursosAtivos}</p>
                  <p className="text-xs text-blue-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +2 novos este mês
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                  <p className="text-2xl font-bold text-foreground">{estatisticas.taxaConclusao}%</p>
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +3.2% vs mês anterior
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Nota Média</p>
                  <p className="text-2xl font-bold text-foreground">{estatisticas.notaMedia}</p>
                  <p className="text-xs text-orange-600">
                    De 10.0 possíveis
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="cursos">Cursos</TabsTrigger>
            <TabsTrigger value="alunos">Alunos</TabsTrigger>
            <TabsTrigger value="professores">Professores</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Desempenho Mensal */}
            <Card>
              <CardHeader>
                <CardTitle>Desempenho Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-muted-foreground text-left">
                        <th className="py-2 pr-4">Mês</th>
                        <th className="py-2 pr-4">Matrículas</th>
                        <th className="py-2 pr-4">Conclusões</th>
                        <th className="py-2 pr-4">Certificados</th>
                        <th className="py-2 pr-4">Taxa de Conclusão</th>
                      </tr>
                    </thead>
                    <tbody>
                      {desempenhoMensal.map((item) => (
                        <tr key={item.mes} className="border-t border-border">
                          <td className="py-2 pr-4 font-medium">{item.mes}</td>
                          <td className="py-2 pr-4">{item.matriculas}</td>
                          <td className="py-2 pr-4">{item.conclusoes}</td>
                          <td className="py-2 pr-4">{item.certificados}</td>
                          <td className="py-2 pr-4">
                            <Badge variant="outline">
                              {((item.conclusoes / item.matriculas) * 100).toFixed(1)}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Gráfico Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Tendências de Crescimento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Gráfico de tendências em desenvolvimento</p>
                    <p className="text-xs mt-2">Integração com Chart.js em breve</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cursos" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cursos Mais Populares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cursosPopulares.map((curso, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{curso.nome}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{curso.matriculas} matrículas</span>
                          <span>{curso.conclusoes} conclusões</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={curso.taxa >= 80 ? "default" : curso.taxa >= 70 ? "secondary" : "outline"}>
                          {curso.taxa}% conclusão
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alunos" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Alunos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Ativos</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-600" style={{ width: `${(estatisticas.alunosAtivos / estatisticas.totalAlunos) * 100}%` }}></div>
                        </div>
                        <span className="text-sm font-medium">{estatisticas.alunosAtivos}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Inativos</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-gray-600" style={{ width: `${((estatisticas.totalAlunos - estatisticas.alunosAtivos) / estatisticas.totalAlunos) * 100}%` }}></div>
                        </div>
                        <span className="text-sm font-medium">{estatisticas.totalAlunos - estatisticas.alunosAtivos}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Certificados Emitidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground mb-2">
                      {estatisticas.certificadosEmitidos}
                    </div>
                    <p className="text-sm text-muted-foreground">Certificados emitidos este ano</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="professores" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance dos Professores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Relatórios de professores em desenvolvimento</p>
                  <p className="text-xs mt-2">Avaliações e estatísticas detalhadas em breve</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Botões de Exportação */}
        <div className="flex gap-2 flex-wrap">
          <Button 
            className="gap-2"
            onClick={() => {
              const dados = `Relatório de Ensino - ${periodo}\n\nEstatísticas:\n- Total de Alunos: ${estatisticas.totalAlunos}\n- Cursos Ativos: ${estatisticas.cursosAtivos}\n- Taxa de Conclusão: ${estatisticas.taxaConclusao}%`;
              const element = document.createElement('a');
              const file = new Blob([dados], {type: 'text/plain'});
              element.href = URL.createObjectURL(file);
              element.download = `relatorio-ensino-${periodo}.txt`;
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
            }}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Exportar XLSX
          </Button>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => alert('Funcionalidade de PDF em desenvolvimento')}
          >
            <FileText className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </main>
    </AppLayout>
  );
};

export default RelatoriosEnsinoPage;