import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface ExtratoRow { data: string; descricao: string; valor: number; }

export const ConciliacaoBancariaTool: React.FC = () => {
  const [contas, setContas] = useState<any[]>([]);
  const [contaId, setContaId] = useState<string>('');
  const [saldoExtrato, setSaldoExtrato] = useState<string>('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [linhas, setLinhas] = useState<ExtratoRow[]>([]);
  const [matchCount, setMatchCount] = useState(0);

  React.useEffect(() => { (async () => {
    const { data } = await supabase.from('contas_bancarias').select('id, nome').eq('ativa', true).order('nome');
    setContas(data || []);
  })(); }, []);

  const parseCSV = (text: string) => {
    const rows = text.split(/\r?\n/).filter(Boolean);
    // Espera colunas: data,descricao,valor
    const parsed: ExtratoRow[] = rows.slice(1).map((r) => {
      const [data, descricao, valor] = r.split(',');
      return { data, descricao, valor: Number(valor?.replace('.', '').replace(',', '.')) };
    });
    setLinhas(parsed);
  };

  const handleFile = (f: File) => {
    setArquivo(f);
    const reader = new FileReader();
    reader.onload = () => parseCSV(String(reader.result || ''));
    reader.readAsText(f);
  };

  const comparar = async () => {
    if (!contaId || !linhas.length) return;
    const datas = linhas.map((l) => l.data).sort();
    const ini = datas[0];
    const fim = datas[datas.length - 1];
    const { data } = await supabase
      .from('lancamentos_financeiros_v2')
      .select('data_lancamento, valor')
      .eq('status', 'confirmado')
      .eq('conta_id', contaId)
      .gte('data_lancamento', ini)
      .lte('data_lancamento', fim);
    const sistema = data || [];
    let matches = 0;
    linhas.forEach((l) => {
      const hit = sistema.find((s) => s.data_lancamento?.slice(0, 10) === l.data && Math.abs(Number(s.valor) - Math.abs(l.valor)) < 0.01);
      if (hit) matches += 1;
    });
    setMatchCount(matches);
  };

  const salvarConciliacao = async () => {
    if (!contaId) return;
    const hoje = new Date().toISOString().slice(0, 10);
    // Usa saldo atual da conta como saldo do sistema para simplicidade
    const { data: conta } = await supabase.from('contas_bancarias').select('saldo_atual').eq('id', contaId).maybeSingle();
    const saldoSistema = Number(conta?.saldo_atual || 0);
    const diff = Number(saldoExtrato || 0) - saldoSistema;

    const { data: registro, error } = await supabase
      .from('conciliacao_bancaria')
      .insert({ conta_id: contaId, data_conciliacao: hoje, saldo_extrato: Number(saldoExtrato || 0), saldo_sistema: saldoSistema, diferenca: diff, conciliado: Math.abs(diff) < 0.01 })
      .select('id')
      .single();
    if (error) return;

    if (registro && arquivo) {
      const path = `conciliacoes/${registro.id}/${Date.now()}_${arquivo.name}`;
      const up = await supabase.storage.from('financeiro-comprovantes').upload(path, arquivo);
      if (!up.error) {
        await supabase.from('conciliacao_bancaria').update({ arquivo_extrato_url: path }).eq('id', registro.id);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conciliação Bancária</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <Label>Conta</Label>
            <Select value={contaId} onValueChange={setContaId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {contas.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Saldo do Extrato</Label>
            <Input type="number" step="0.01" value={saldoExtrato} onChange={(e) => setSaldoExtrato(e.target.value)} />
          </div>
          <div>
            <Label>Arquivo CSV</Label>
            <Input type="file" accept=".csv" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={comparar} disabled={!linhas.length || !contaId}>Comparar</Button>
            <Button type="button" variant="outline" onClick={salvarConciliacao} disabled={!contaId}>Salvar</Button>
          </div>
        </div>
        {linhas.length > 0 && (
          <div className="text-sm text-muted-foreground">Linhas importadas: {linhas.length} • Correspondências: {matchCount}</div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConciliacaoBancariaTool;