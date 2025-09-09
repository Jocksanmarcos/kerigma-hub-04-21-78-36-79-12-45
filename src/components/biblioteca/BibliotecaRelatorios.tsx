import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, FileText, TrendingUp, Users } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface RelatorioData {
  totalEmprestimos: number;
  livrosMaisEmprestados: Array<{
    title: string;
    author?: string;
    count: number;
  }>;
  usuariosMaisAtivos: Array<{
    user_id: string;
    count: number;
  }>;
  mediaEmprestimosPorDia: number;
}

const BibliotecaRelatorios = () => {
  const [dataInicio, setDataInicio] = useState<Date>(startOfMonth(new Date()));
  const [dataFim, setDataFim] = useState<Date>(endOfMonth(new Date()));

  const { data: relatorio, isLoading } = useQuery({
    queryKey: ["biblioteca-relatorio", dataInicio, dataFim],
    queryFn: async (): Promise<RelatorioData> => {
      const dataInicioStr = format(dataInicio, 'yyyy-MM-dd');
      const dataFimStr = format(dataFim, 'yyyy-MM-dd');

      // Buscar total de empréstimos no período
      const { data: loans, error: loansError } = await supabase
        .from("loans")
        .select(`
          id,
          loan_date,
          user_id,
          book:books(title, author)
        `)
        .gte("loan_date", dataInicioStr)
        .lte("loan_date", dataFimStr);

      if (loansError) throw loansError;

      // Calcular livros mais emprestados
      const bookCounts: Record<string, { title: string; author?: string; count: number }> = {};
      const userCounts: Record<string, number> = {};

      loans?.forEach(loan => {
        if (loan.book) {
          const key = loan.book.title;
          if (!bookCounts[key]) {
            bookCounts[key] = {
              title: loan.book.title,
              author: loan.book.author,
              count: 0
            };
          }
          bookCounts[key].count++;
        }

        userCounts[loan.user_id] = (userCounts[loan.user_id] || 0) + 1;
      });

      const livrosMaisEmprestados = Object.values(bookCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const usuariosMaisAtivos = Object.entries(userCounts)
        .map(([user_id, count]) => ({ user_id, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Calcular média por dia
      const diasPeriodo = Math.max(1, Math.ceil((dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24)));
      const mediaEmprestimosPorDia = loans ? loans.length / diasPeriodo : 0;

      return {
        totalEmprestimos: loans?.length || 0,
        livrosMaisEmprestados,
        usuariosMaisAtivos,
        mediaEmprestimosPorDia: Math.round(mediaEmprestimosPorDia * 100) / 100
      };
    },
    enabled: !!dataInicio && !!dataFim,
  });

  const gerarRelatorioPDF = () => {
    // Implementar geração de PDF posteriormente
    console.log('Gerar relatório PDF para:', { dataInicio, dataFim, relatorio });
  };

  const atalhosPeriodo = [
    { label: 'Últimos 7 dias', onClick: () => {
      setDataInicio(subDays(new Date(), 7));
      setDataFim(new Date());
    }},
    { label: 'Últimos 30 dias', onClick: () => {
      setDataInicio(subDays(new Date(), 30));
      setDataFim(new Date());
    }},
    { label: 'Este mês', onClick: () => {
      setDataInicio(startOfMonth(new Date()));
      setDataFim(endOfMonth(new Date()));
    }}
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Relatórios da Biblioteca</CardTitle>
          <CardDescription>
            Gere relatórios detalhados sobre empréstimos e uso da biblioteca
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros de data */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex gap-4">
              <div className="space-y-2">
                <Label>Data Início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !dataInicio && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataInicio ? format(dataInicio, "dd/MM/yyyy", { locale: ptBR }) : "Selecione..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataInicio}
                      onSelect={(date) => date && setDataInicio(date)}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Data Fim</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !dataFim && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataFim ? format(dataFim, "dd/MM/yyyy", { locale: ptBR }) : "Selecione..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataFim}
                      onSelect={(date) => date && setDataFim(date)}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex gap-2">
              {atalhosPeriodo.map((atalho, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={atalho.onClick}
                >
                  {atalho.label}
                </Button>
              ))}
            </div>

            <Button onClick={gerarRelatorioPDF} className="ml-auto">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>

          {/* Resumo do período */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : relatorio ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Total Empréstimos</span>
                  </div>
                  <div className="text-2xl font-bold">{relatorio.totalEmprestimos}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Média por Dia</span>
                  </div>
                  <div className="text-2xl font-bold">{relatorio.mediaEmprestimosPorDia}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Usuários Ativos</span>
                  </div>
                  <div className="text-2xl font-bold">{relatorio.usuariosMaisAtivos.length}</div>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {/* Dados detalhados */}
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-32" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[1, 2, 3].map(j => (
                        <div key={j} className="flex justify-between">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : relatorio ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Livros Mais Emprestados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {relatorio.livrosMaisEmprestados.map((livro, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{livro.title}</p>
                          {livro.author && (
                            <p className="text-sm text-muted-foreground">{livro.author}</p>
                          )}
                        </div>
                        <span className="text-sm font-medium">{livro.count} empréstimos</span>
                      </div>
                    ))}
                    {relatorio.livrosMaisEmprestados.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhum empréstimo no período selecionado
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Usuários Mais Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {relatorio.usuariosMaisAtivos.map((usuario, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <span className="font-medium">Usuário {usuario.user_id.slice(0, 8)}...</span>
                        </div>
                        <span className="text-sm font-medium">{usuario.count} empréstimos</span>
                      </div>
                    ))}
                    {relatorio.usuariosMaisAtivos.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhum usuário ativo no período
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default BibliotecaRelatorios;