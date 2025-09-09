import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

export const OrcamentoBuilder: React.FC = () => {
  const [orcamentoId, setOrcamentoId] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [itens, setItens] = useState<Record<string, number>>({});
  const [realizadoPorCategoria, setRealizadoPorCategoria] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  const periodo = useMemo(() => {
    const d = new Date();
    return { ano: d.getFullYear(), mes: d.getMonth() + 1, inicio: new Date(d.getFullYear(), d.getMonth(), 1), fim: new Date(d.getFullYear(), d.getMonth() + 1, 1) };
  }, []);

  const init = async () => {
    try {
      setLoading(true);
      // Garantir orçamento do mês
      let { data: orcamento } = await supabase
        .from('orcamentos')
        .select('id')
        .eq('ano', periodo.ano)
        .eq('mes', periodo.mes)
        .maybeSingle();
      if (!orcamento) {
        const res = await supabase
          .from('orcamentos')
          .insert({ 
            ano: periodo.ano, 
            mes: periodo.mes, 
            nome: `Orçamento ${periodo.mes}/${periodo.ano}`,
            valor_orcado: 0
          })
          .select('id')
          .single();
        orcamento = res.data as any;
      }
      setOrcamentoId(orcamento?.id || null);

      // Categorias ativas
      const { data: cats } = await supabase
        .from('categorias_financeiras')
        .select('id, nome, tipo')
        .eq('ativa', true)
        .order('nome');
      setCategorias(cats || []);

      // Itens existentes
      if (orcamento?.id) {
        const { data: itensData } = await (supabase as any)
          .from('orcamento_itens')
          .select('categoria_id, meta_valor')
          .eq('orcamento_id', orcamento.id);
        const map: Record<string, number> = {};
        (itensData || []).forEach((i: any) => (map[i.categoria_id] = Number(i.meta_valor)));
        setItens(map);
      }

      // Realizado do mês por categoria
      const { data: realizados } = await supabase
        .from('lancamentos_financeiros_v2')
        .select('categoria_id, valor')
        .eq('status', 'confirmado')
        .gte('data_lancamento', periodo.inicio.toISOString().slice(0, 10))
        .lt('data_lancamento', periodo.fim.toISOString().slice(0, 10));
      const realMap: Record<string, number> = {};
      (realizados || []).forEach((r: any) => (realMap[r.categoria_id] = (realMap[r.categoria_id] || 0) + Number(r.valor)));
      setRealizadoPorCategoria(realMap);
    } finally {
      setLoading(false);
    }
  };

  const salvar = async () => {
    if (!orcamentoId) return;
    const rows = Object.entries(itens).map(([categoria_id, meta_valor]) => ({ orcamento_id: orcamentoId, categoria_id, meta_valor }));
    if (rows.length === 0) return;
    // Upsert simples: deletar e inserir novamente
    await (supabase as any).from('orcamento_itens').delete().eq('orcamento_id', orcamentoId);
    await (supabase as any).from('orcamento_itens').insert(rows);
  };

  if (loading) return <Card><CardContent className="p-6">Carregando orçamento…</CardContent></Card>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Construtor de Orçamento – {String(periodo.mes).padStart(2, '0')}/{periodo.ano}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categorias.map((c) => {
            const meta = itens[c.id] || 0;
            const realizado = realizadoPorCategoria[c.id] || 0;
            const progresso = meta > 0 ? Math.min(100, Math.round((realizado / meta) * 100)) : 0;
            return (
              <div key={c.id} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm text-muted-foreground">{c.tipo === 'receita' ? 'Receita' : 'Despesa'}</div>
                    <div className="font-medium text-foreground">{c.nome}</div>
                  </div>
                  <div className="w-40">
                    <Label className="text-xs">Meta</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={meta}
                      onChange={(e) => setItens((prev) => ({ ...prev, [c.id]: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Realizado</span>
                    <span>
                      {realizado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} /{' '}
                      {meta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progresso}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={salvar}>Salvar Metas</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrcamentoBuilder;