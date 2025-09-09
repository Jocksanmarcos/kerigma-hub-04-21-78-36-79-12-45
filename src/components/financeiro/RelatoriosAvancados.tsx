import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, FileText, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import pdfMake from 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';

export const RelatoriosAvancados: React.FC = () => {
  const relatorios = [
    { id: 'dre', nome: 'Demonstrativo de Resultados (DRE)', descricao: 'Relatório completo de receitas e despesas', icon: BarChart3, formatos: ['PDF', 'XLSX'] },
    { id: 'fluxo-caixa', nome: 'Fluxo de Caixa Detalhado', descricao: 'Análise detalhada do fluxo de caixa', icon: TrendingUp, formatos: ['PDF', 'XLSX'] },
    { id: 'contribuicoes', nome: 'Relatório de Contribuições', descricao: 'Contribuições por membro (com privacidade)', icon: PieChart, formatos: ['PDF', 'XLSX'] },
    { id: 'orcado-realizado', nome: 'Orçado vs. Realizado', descricao: 'Comparativo orçamentário por categoria', icon: BarChart3, formatos: ['PDF', 'XLSX'] },
  ];

  const handleExport = async (relatorioId: string, formato: string) => {
    try {
      if (relatorioId === 'dre') {
        const start = new Date(); start.setDate(1);
        const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
        const [rec, des] = await Promise.all([
          supabase.from('lancamentos_financeiros_v2').select('valor').eq('tipo','receita').eq('status','confirmado').gte('data_lancamento', start.toISOString().slice(0,10)).lt('data_lancamento', end.toISOString().slice(0,10)),
          supabase.from('lancamentos_financeiros_v2').select('valor').eq('tipo','despesa').eq('status','confirmado').gte('data_lancamento', start.toISOString().slice(0,10)).lt('data_lancamento', end.toISOString().slice(0,10)),
        ]);
        const receitas = (rec.data||[]).reduce((s,r:any)=>s+r.valor,0);
        const despesas = (des.data||[]).reduce((s,r:any)=>s+r.valor,0);
        const resultado = receitas - despesas;
        if (formato === 'XLSX') {
          const ws = XLSX.utils.json_to_sheet([
            { Linha: 'Receitas', Valor: receitas },
            { Linha: 'Despesas', Valor: despesas },
            { Linha: 'Resultado', Valor: resultado },
          ]);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'DRE');
          XLSX.writeFile(wb, 'dre-mensal.xlsx');
        } else {
          const doc = { content: [ { text: 'DRE – Mês Atual', style: 'header' }, { table: { headerRows: 1, widths: ['*','auto'], body: [['Linha','Valor'], ['Receitas', receitas.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})], ['Despesas', despesas.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})], ['Resultado', resultado.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})]] } } ], styles: { header: { fontSize: 16, bold: true } }, defaultStyle: { fontSize: 10 } } as any;
          pdfMake.createPdf(doc).download('dre-mensal.pdf');
        }
      }
      if (relatorioId === 'fluxo-caixa') {
        const meses = [...Array(6)].map((_,i)=>{const d=new Date();d.setMonth(d.getMonth()-(5-i));return d;});
        const linhas: any[] = [];
        for (const d of meses) {
          const start = new Date(d.getFullYear(), d.getMonth(), 1);
          const end = new Date(d.getFullYear(), d.getMonth()+1, 1);
          const [rec, des] = await Promise.all([
            supabase.from('lancamentos_financeiros_v2').select('valor').eq('tipo','receita').eq('status','confirmado').gte('data_lancamento', start.toISOString().slice(0,10)).lt('data_lancamento', end.toISOString().slice(0,10)),
            supabase.from('lancamentos_financeiros_v2').select('valor').eq('tipo','despesa').eq('status','confirmado').gte('data_lancamento', start.toISOString().slice(0,10)).lt('data_lancamento', end.toISOString().slice(0,10)),
          ]);
          const entradas = (rec.data||[]).reduce((s,r:any)=>s+r.valor,0);
          const saidas = (des.data||[]).reduce((s,r:any)=>s+r.valor,0);
          linhas.push({ Mes: start.toLocaleDateString('pt-BR',{month:'short',year:'2-digit'}), Entradas: entradas, Saidas: saidas, Saldo: entradas-saidas });
        }
        if (formato === 'XLSX') {
          const ws = XLSX.utils.json_to_sheet(linhas);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Fluxo');
          XLSX.writeFile(wb, 'fluxo-caixa-6m.xlsx');
        } else {
          const body = [['Mês','Entradas','Saídas','Saldo'], ...linhas.map(l=>[l.Mes, l.Entradas.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}), l.Saidas.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}), l.Saldo.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})])];
          const doc = { content: [ { text:'Fluxo de Caixa – 6 meses', style:'header' }, { table:{ headerRows:1, widths:['*','auto','auto','auto'], body } } ], styles:{ header:{ fontSize:16, bold:true } }, defaultStyle:{ fontSize:10 } } as any;
          pdfMake.createPdf(doc).download('fluxo-caixa-6m.pdf');
        }
      }
      if (relatorioId === 'contribuicoes') {
        const start = new Date(); start.setDate(1);
        const end = new Date(start.getFullYear(), start.getMonth()+1, 1);
        const { data } = await supabase
          .from('lancamentos_financeiros_v2')
          .select('valor, pessoas(nome_completo)')
          .eq('tipo','receita')
          .eq('status','confirmado')
          .gte('data_lancamento', start.toISOString().slice(0,10))
          .lt('data_lancamento', end.toISOString().slice(0,10));
        const mapa: Record<string, number> = {};
        (data||[]).forEach((r:any)=>{ const nome=r.pessoas?.nome_completo||'Anônimo'; mapa[nome]=(mapa[nome]||0)+r.valor; });
        const linhas = Object.entries(mapa).map(([Pessoa, Total])=>({ Pessoa, Total }));
        if (formato === 'XLSX') {
          const ws = XLSX.utils.json_to_sheet(linhas);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Contribuições');
          XLSX.writeFile(wb, 'contribuicoes-mes.xlsx');
        } else {
          const body = [['Pessoa','Total'], ...linhas.map(l=>[l.Pessoa, l.Total.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})])];
          const doc = { content: [ { text:'Relatório de Contribuições – Mês', style:'header' }, { table:{ headerRows:1, widths:['*','auto'], body } } ], styles:{ header:{ fontSize:16, bold:true } }, defaultStyle:{ fontSize:10 } } as any;
          pdfMake.createPdf(doc).download('contribuicoes-mes.pdf');
        }
      }
      if (relatorioId === 'orcado-realizado') {
        const start = new Date(); start.setDate(1);
        const end = new Date(start.getFullYear(), start.getMonth()+1, 1);
        const { data: realizados } = await supabase
          .from('lancamentos_financeiros_v2')
          .select('categoria_id, valor')
          .eq('status','confirmado')
          .gte('data_lancamento', start.toISOString().slice(0,10))
          .lt('data_lancamento', end.toISOString().slice(0,10));
        const porCat: Record<string, number> = {};
        (realizados||[]).forEach((r:any)=>{ porCat[r.categoria_id]=(porCat[r.categoria_id]||0)+r.valor; });
        const linhas = Object.entries(porCat).map(([Categoria, Realizado])=>({ Categoria, Realizado }));
        if (formato === 'XLSX') {
          const ws = XLSX.utils.json_to_sheet(linhas);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Orçado vs Realizado');
          XLSX.writeFile(wb, 'orcado-vs-realizado.xlsx');
        } else {
          const body = [['Categoria','Realizado'], ...linhas.map(l=>[l.Categoria, (l.Realizado as number).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})])];
          const doc = { content: [ { text:'Orçado vs. Realizado – Mês', style:'header' }, { table:{ headerRows:1, widths:['*','auto'], body } } ], styles:{ header:{ fontSize:16, bold:true } }, defaultStyle:{ fontSize:10 } } as any;
          pdfMake.createPdf(doc).download('orcado-vs-realizado.pdf');
        }
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {relatorios.map((relatorio) => (
        <Card key={relatorio.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <relatorio.icon className="h-5 w-5" />
              {relatorio.nome}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{relatorio.descricao}</p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {relatorio.formatos.map((formato) => (
                <Button key={formato} variant="outline" size="sm" onClick={() => handleExport(relatorio.id, formato)} className="gap-2">
                  {formato === 'PDF' ? <FileText className="h-4 w-4" /> : <FileSpreadsheet className="h-4 w-4" />}
                  {formato}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RelatoriosAvancados;