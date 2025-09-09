import React, { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Download, FileSpreadsheet, FileText, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";
import pdfMake from "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
import { useToast } from "@/hooks/use-toast";

type Lancamento = {
  id: string;
  data_lancamento: string; // ISO
  descricao: string;
  tipo: string; // entrada | saida
  valor: number;
  forma_pagamento: string;
  status: string | null;
  conta_id: string;
  categoria_id: string;
};

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const FinanceiroRelatoriosPage: React.FC = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState("lancamentos");

  // Filtros
  const [startDate, setStartDate] = useState<string>(() => new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [tipo, setTipo] = useState<string>("todos");
  const [contaId, setContaId] = useState<string>("");
  const [categoriaId, setCategoriaId] = useState<string>("");

  // SEO básico
  useEffect(() => {
    const title = "Relatórios Financeiros – Kerigma Hub";
    const desc = "Exportar relatórios financeiros em PDF e XLSX";
    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", desc);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = desc;
      document.head.appendChild(m);
    }
    const canonical = document.querySelector('link[rel="canonical"]');
    const href = window.location.origin + "/dashboard/financeiro";
    if (canonical) canonical.setAttribute("href", href);
    else {
      const l = document.createElement("link");
      l.rel = "canonical";
      l.href = href;
      document.head.appendChild(l);
    }
  }, []);

  const { data: lancamentos, isLoading, refetch } = useQuery({
    queryKey: [
      "lancamentos_financeiros",
      { startDate, endDate, tipo, contaId, categoriaId },
    ],
    queryFn: async () => {
      let q = supabase
        .from("lancamentos_financeiros")
        .select("id,data_lancamento,descricao,tipo,valor,forma_pagamento,status,conta_id,categoria_id")
        .gte("data_lancamento", startDate)
        .lte("data_lancamento", endDate)
        .order("data_lancamento", { ascending: true });

      if (tipo !== "todos") q = q.eq("tipo", tipo);
      if (contaId) q = q.eq("conta_id", contaId);
      if (categoriaId) q = q.eq("categoria_id", categoriaId);

      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as Lancamento[];
    },
    refetchOnWindowFocus: false,
  });

  const resumo = useMemo(() => {
    const totalEntradas = (lancamentos || [])
      .filter((l) => l.tipo === "entrada")
      .reduce((sum, l) => sum + (l.valor || 0), 0);
    const totalSaidas = (lancamentos || [])
      .filter((l) => l.tipo === "saida")
      .reduce((sum, l) => sum + (l.valor || 0), 0);
    const saldo = totalEntradas - totalSaidas;
    return { totalEntradas, totalSaidas, saldo };
  }, [lancamentos]);

  const fluxoCaixa = useMemo(() => {
    // Agrupar por data
    const map = new Map<string, { data: string; entradas: number; saidas: number; saldo: number }>();
    (lancamentos || []).forEach((l) => {
      const d = l.data_lancamento.substring(0, 10);
      const item = map.get(d) || { data: d, entradas: 0, saidas: 0, saldo: 0 };
      if (l.tipo === "entrada") item.entradas += l.valor || 0;
      if (l.tipo === "saida") item.saidas += l.valor || 0;
      map.set(d, item);
    });
    // Ordenar por data e calcular saldo acumulado
    const arr = Array.from(map.values()).sort((a, b) => a.data.localeCompare(b.data));
    let acumulado = 0;
    return arr.map((r) => {
      acumulado += r.entradas - r.saidas;
      return { ...r, saldo: acumulado };
    });
  }, [lancamentos]);

  const extratoPorConta = useMemo(() => {
    // Se uma conta for escolhida, filtra; caso contrário, agrupa por conta
    if (contaId) {
      const rows = (lancamentos || []).filter((l) => l.conta_id === contaId);
      return { conta: contaId, rows };
    }
    const groups: Record<string, Lancamento[]> = {};
    (lancamentos || []).forEach((l) => {
      const key = l.conta_id || "sem-conta";
      if (!groups[key]) groups[key] = [];
      groups[key].push(l);
    });
    return { conta: "todas", groups };
  }, [lancamentos, contaId]);

  const handleExportXLSX = () => {
    try {
      let sheetData: any[] = [];
      if (tab === "lancamentos") {
        sheetData = (lancamentos || []).map((l) => ({
          Data: l.data_lancamento.substring(0, 10),
          Descrição: l.descricao,
          Tipo: l.tipo,
          Valor: l.valor,
          "Forma Pagamento": l.forma_pagamento,
          Status: l.status ?? "",
          "Conta ID": l.conta_id,
          "Categoria ID": l.categoria_id,
        }));
      } else if (tab === "fluxo") {
        sheetData = fluxoCaixa.map((f) => ({
          Data: f.data,
          Entradas: f.entradas,
          Saídas: f.saidas,
          "Saldo Acumulado": f.saldo,
        }));
      } else {
        if (contaId) {
          sheetData = extratoPorConta.rows.map((l) => ({
            Data: l.data_lancamento.substring(0, 10),
            Descrição: l.descricao,
            Tipo: l.tipo,
            Valor: l.valor,
            Status: l.status ?? "",
          }));
        } else {
          // Una todas as contas em uma planilha
          Object.entries(extratoPorConta.groups || {}).forEach(([conta, rows]) => {
            sheetData.push({ Conta: conta });
            rows.forEach((l) => {
              sheetData.push({
                Data: l.data_lancamento.substring(0, 10),
                Descrição: l.descricao,
                Tipo: l.tipo,
                Valor: l.valor,
                Status: l.status ?? "",
              });
            });
            sheetData.push({});
          });
        }
      }
      const ws = XLSX.utils.json_to_sheet(sheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Relatório");
      XLSX.writeFile(wb, `relatorio-financeiro-${tab}.xlsx`);
      toast({ title: "Exportado", description: "Arquivo XLSX gerado com sucesso." });
    } catch (e) {
      toast({ title: "Erro ao exportar XLSX", description: String(e), variant: "destructive" });
    }
  };

  const handleExportPDF = () => {
    try {
      let body: any[] = [];
      let header: string[] = [];

      if (tab === "lancamentos") {
        header = ["Data", "Descrição", "Tipo", "Valor", "Forma", "Status"];
        body = [header, ...((lancamentos || []).map((l) => [
          l.data_lancamento.substring(0, 10),
          l.descricao,
          l.tipo,
          formatCurrency(l.valor || 0),
          l.forma_pagamento,
          l.status ?? "",
        ]))];
      } else if (tab === "fluxo") {
        header = ["Data", "Entradas", "Saídas", "Saldo Acumulado"];
        body = [header, ...fluxoCaixa.map((f) => [
          f.data,
          formatCurrency(f.entradas),
          formatCurrency(f.saidas),
          formatCurrency(f.saldo),
        ])];
      } else {
        header = ["Data", "Descrição", "Tipo", "Valor", "Status"];
        if (contaId) {
          body = [header, ...extratoPorConta.rows.map((l) => [
            l.data_lancamento.substring(0, 10),
            l.descricao,
            l.tipo,
            formatCurrency(l.valor || 0),
            l.status ?? "",
          ])];
        } else {
          body = [header];
          Object.entries(extratoPorConta.groups || {}).forEach(([conta, rows]) => {
            body.push([`Conta: ${conta}`, "", "", "", ""]);
            rows.forEach((l) => {
              body.push([
                l.data_lancamento.substring(0, 10),
                l.descricao,
                l.tipo,
                formatCurrency(l.valor || 0),
                l.status ?? "",
              ]);
            });
            body.push([" ", " ", " ", " ", " "]);
          });
        }
      }

      const docDefinition = {
        content: [
          { text: "Relatórios Financeiros", style: "header" },
          { text: new Date().toLocaleString("pt-BR"), style: "subheader" },
          { text: `Período: ${startDate} a ${endDate}`, margin: [0, 0, 0, 8] },
          {
            table: {
              headerRows: 1,
              widths: Array(header.length).fill("*") as any,
              body,
            },
            layout: "lightHorizontalLines" as const,
          },
          {
            text: `Resumo: Entradas ${formatCurrency(resumo.totalEntradas)} | Saídas ${formatCurrency(resumo.totalSaidas)} | Saldo ${formatCurrency(resumo.saldo)}`,
            margin: [0, 10, 0, 0],
          },
        ],
        styles: {
          header: { fontSize: 16, bold: true },
          subheader: { fontSize: 10, color: "#666" },
        },
        defaultStyle: { fontSize: 9 },
        pageMargins: [24, 24, 24, 24],
      } as any;

      pdfMake.createPdf(docDefinition).download(`relatorio-financeiro-${tab}.pdf`);
      toast({ title: "Exportado", description: "Arquivo PDF gerado com sucesso." });
    } catch (e) {
      toast({ title: "Erro ao exportar PDF", description: String(e), variant: "destructive" });
    }
  };

  const applyFilters = () => refetch();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Relatórios Financeiros</h1>
          <p className="text-muted-foreground">Exporte Lançamentos, Fluxo de Caixa e Extrato por Conta em PDF e XLSX</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Filter className="h-4 w-4" /> Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
              <div>
                <Label htmlFor="start">Data Início</Label>
                <Input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full" />
              </div>
              <div>
                <Label htmlFor="end">Data Fim</Label>
                <Input id="end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full" />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="entrada">Entradas</SelectItem>
                    <SelectItem value="saida">Saídas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="conta">Conta (ID)</Label>
                <Input id="conta" placeholder="Opcional" value={contaId} onChange={(e) => setContaId(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="categoria">Categoria (ID)</Label>
                <Input id="categoria" placeholder="Opcional" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={applyFilters} disabled={isLoading}>Aplicar filtros</Button>
              <Button variant="outline" onClick={handleExportXLSX} disabled={isLoading}>
                <FileSpreadsheet className="h-4 w-4 mr-2" /> Exportar XLSX
              </Button>
              <Button variant="outline" onClick={handleExportPDF} disabled={isLoading}>
                <FileText className="h-4 w-4 mr-2" /> Exportar PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="lancamentos">Lançamentos por Período</TabsTrigger>
            <TabsTrigger value="fluxo">Fluxo de Caixa</TabsTrigger>
            <TabsTrigger value="extrato">Extrato por Conta</TabsTrigger>
          </TabsList>

          <TabsContent value="lancamentos" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Lançamentos ({lancamentos?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-muted-foreground text-left">
                        <th className="py-2 pr-4">Data</th>
                        <th className="py-2 pr-4">Descrição</th>
                        <th className="py-2 pr-4">Tipo</th>
                        <th className="py-2 pr-4">Valor</th>
                        <th className="py-2 pr-4">Forma</th>
                        <th className="py-2 pr-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(lancamentos || []).map((l) => (
                        <tr key={l.id} className="border-t border-border">
                          <td className="py-2 pr-4">{l.data_lancamento.substring(0, 10)}</td>
                          <td className="py-2 pr-4">{l.descricao}</td>
                          <td className="py-2 pr-4">{l.tipo}</td>
                          <td className="py-2 pr-4">{formatCurrency(l.valor || 0)}</td>
                          <td className="py-2 pr-4">{l.forma_pagamento}</td>
                          <td className="py-2 pr-4">{l.status ?? ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Separator className="my-4" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Entradas</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xl font-bold text-emerald-600">{formatCurrency(resumo.totalEntradas)}</CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Saídas</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xl font-bold text-red-600">{formatCurrency(resumo.totalSaidas)}</CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Saldo</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xl font-bold text-blue-600">{formatCurrency(resumo.saldo)}</CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fluxo" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Fluxo de Caixa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-muted-foreground text-left">
                        <th className="py-2 pr-4">Data</th>
                        <th className="py-2 pr-4">Entradas</th>
                        <th className="py-2 pr-4">Saídas</th>
                        <th className="py-2 pr-4">Saldo Acumulado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fluxoCaixa.map((f) => (
                        <tr key={f.data} className="border-t border-border">
                          <td className="py-2 pr-4">{f.data}</td>
                          <td className="py-2 pr-4">{formatCurrency(f.entradas)}</td>
                          <td className="py-2 pr-4">{formatCurrency(f.saidas)}</td>
                          <td className="py-2 pr-4">{formatCurrency(f.saldo)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="extrato" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Extrato por Conta {contaId ? `(Conta: ${contaId})` : "(todas)"}</CardTitle>
              </CardHeader>
              <CardContent>
                {contaId ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-muted-foreground text-left">
                          <th className="py-2 pr-4">Data</th>
                          <th className="py-2 pr-4">Descrição</th>
                          <th className="py-2 pr-4">Tipo</th>
                          <th className="py-2 pr-4">Valor</th>
                          <th className="py-2 pr-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {extratoPorConta.rows.map((l) => (
                          <tr key={l.id} className="border-t border-border">
                            <td className="py-2 pr-4">{l.data_lancamento.substring(0, 10)}</td>
                            <td className="py-2 pr-4">{l.descricao}</td>
                            <td className="py-2 pr-4">{l.tipo}</td>
                            <td className="py-2 pr-4">{formatCurrency(l.valor || 0)}</td>
                            <td className="py-2 pr-4">{l.status ?? ""}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(extratoPorConta.groups || {}).map(([conta, rows]) => (
                      <div key={conta}>
                        <div className="text-sm font-semibold text-foreground mb-2">Conta: {conta}</div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-muted-foreground text-left">
                                <th className="py-2 pr-4">Data</th>
                                <th className="py-2 pr-4">Descrição</th>
                                <th className="py-2 pr-4">Tipo</th>
                                <th className="py-2 pr-4">Valor</th>
                                <th className="py-2 pr-4">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((l) => (
                                <tr key={l.id} className="border-t border-border">
                                  <td className="py-2 pr-4">{l.data_lancamento.substring(0, 10)}</td>
                                  <td className="py-2 pr-4">{l.descricao}</td>
                                  <td className="py-2 pr-4">{l.tipo}</td>
                                  <td className="py-2 pr-4">{formatCurrency(l.valor || 0)}</td>
                                  <td className="py-2 pr-4">{l.status ?? ""}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <Separator className="my-4" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="sticky bottom-4 bg-background/80 backdrop-blur-sm p-4 rounded-lg border border-border shadow-lg">
          <div className="flex gap-2 flex-wrap justify-center">
            <Button onClick={handleExportXLSX} className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Baixar XLSX
            </Button>
            <Button variant="outline" onClick={handleExportPDF} className="gap-2">
              <FileText className="h-4 w-4" />
              Baixar PDF
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default FinanceiroRelatoriosPage;
