import { supabase } from "@/integrations/supabase/client";

export interface Transacao {
  id: string;
  tipo: 'entrada' | 'saida';
  valor: number;
  status: string;
  data_lancamento: string;
  descricao: string;
  forma_pagamento: string;
  conta_id: string;
  categoria_id: string;
}

export interface SaldoCalculado {
  receitas: number;
  despesas: number;
  saldo: number;
}

export function calcularSaldo(transacoes: Transacao[]): SaldoCalculado {
  const receitas = transacoes
    .filter(t => t.tipo === 'entrada' && t.status === 'confirmado')
    .reduce((sum, t) => sum + (t.valor || 0), 0);
  
  const despesas = transacoes
    .filter(t => t.tipo === 'saida' && t.status === 'confirmado')
    .reduce((sum, t) => sum + (t.valor || 0), 0);
  
  return { 
    receitas, 
    despesas, 
    saldo: receitas - despesas 
  };
}

export async function buscarTransacoes(filtros?: {
  dataInicio?: string;
  dataFim?: string;
  tipo?: 'entrada' | 'saida' | 'todos';
  contaId?: string;
  categoriaId?: string;
}): Promise<Transacao[]> {
  let query = supabase
    .from('lancamentos_financeiros_v2')
    .select('id,tipo,valor,status,data_lancamento,descricao,forma_pagamento,conta_id,categoria_id')
    .order('data_lancamento', { ascending: false });

  if (filtros?.dataInicio) {
    query = query.gte('data_lancamento', filtros.dataInicio);
  }
  
  if (filtros?.dataFim) {
    query = query.lte('data_lancamento', filtros.dataFim);
  }
  
  if (filtros?.tipo && filtros.tipo !== 'todos') {
    query = query.eq('tipo', filtros.tipo);
  }
  
  if (filtros?.contaId) {
    query = query.eq('conta_id', filtros.contaId);
  }
  
  if (filtros?.categoriaId) {
    query = query.eq('categoria_id', filtros.categoriaId);
  }

  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Erro ao buscar transações: ${error.message}`);
  }
  
  return (data || []) as Transacao[];
}

export async function calcularSaldoPorPeriodo(
  dataInicio: string, 
  dataFim: string
): Promise<SaldoCalculado> {
  const transacoes = await buscarTransacoes({ dataInicio, dataFim });
  return calcularSaldo(transacoes);
}

export async function calcularSaldoPorConta(contaId: string): Promise<SaldoCalculado> {
  const transacoes = await buscarTransacoes({ contaId });
  return calcularSaldo(transacoes);
}