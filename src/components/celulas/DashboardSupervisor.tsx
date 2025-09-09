import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, TrendingUp, Users, AlertTriangle, Search, Filter, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AcoesEmMassa } from './AcoesEmMassa';
import { CelulasProntasMultiplicacao } from './CelulasProntasMultiplicacao';
import { GrelhaSaudeCelulas } from './GrelhaSaudeCelulas';
import { FluxoAcompanhamentoAutomatizado } from './FluxoAcompanhamentoAutomatizado';
import { MetricasCelulas } from './MetricasCelulas';
import { FerramentasGestao } from './FerramentasGestao';
import { RelatoriosAvancados } from './RelatoriosAvancados';
import { ComunicacaoInteligente } from './ComunicacaoInteligente';

interface CelulaSupervisao {
  id: string;
  nome: string;
  lider: string;
  membros: number;
  presencaMedia: number;
  visitantesUltimo: number;
  saude: 'Verde' | 'Amarelo' | 'Vermelho';
  ultimoRelatorio: string;
}

async function fetchCelulasSupervisao(): Promise<CelulaSupervisao[]> {
  const { data: celulas, error } = await supabase
    .from('celulas')
    .select(`
      id,
      nome,
      pessoas!lider_id(nome_completo)
    `)
    .eq('ativa', true)
    .limit(20);

  if (error) {
    console.error('Erro ao buscar células:', error);
    return [];
  }

  // Simular dados de saúde baseados em dados reais
  return celulas?.map(celula => ({
    id: celula.id,
    nome: celula.nome,
    lider: celula.pessoas?.nome_completo || 'Sem líder',
    membros: Math.floor(Math.random() * 20) + 5,
    presencaMedia: Math.floor(Math.random() * 15) + 5,
    visitantesUltimo: Math.floor(Math.random() * 4),
    saude: ['Verde', 'Amarelo', 'Vermelho'][Math.floor(Math.random() * 3)] as 'Verde' | 'Amarelo' | 'Vermelho',
    ultimoRelatorio: ['Hoje', '1 dia atrás', '2 dias atrás', '1 semana atrás'][Math.floor(Math.random() * 4)]
  })) || [];
}

export const DashboardSupervisor: React.FC = () => {
  const [filtroSaude, setFiltroSaude] = useState('todas');
  const [filtroRegiao, setFiltroRegiao] = useState('todas');
  const [buscaCelula, setBuscaCelula] = useState('');
  
  const { data: celulas = [], isLoading, error } = useQuery({
    queryKey: ['celulas-supervisao'],
    queryFn: fetchCelulasSupervisao,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  if (error) {
    toast.error('Erro ao carregar células para supervisão');
  }

  const celulasFiltradas = celulas.filter(celula => {
    const filtroSaudeOk = filtroSaude === 'todas' || celula.saude.toLowerCase() === filtroSaude;
    const filtroBuscaOk = buscaCelula === '' || 
      celula.nome.toLowerCase().includes(buscaCelula.toLowerCase()) ||
      celula.lider.toLowerCase().includes(buscaCelula.toLowerCase());
    
    return filtroSaudeOk && filtroBuscaOk;
  });

  const handleVerDetalhes = (celula: CelulaSupervisao) => {
    toast.info(`Abrindo detalhes da ${celula.nome}`);
    // Implementar navegação para detalhes da célula
  };

  const handleIniciarMultiplicacao = (celula: CelulaSupervisao) => {
    toast.success(`Iniciando processo de multiplicação para ${celula.nome}`);
    // Implementar lógica de multiplicação
  };

  const handleAgendarReuniao = (celula: CelulaSupervisao) => {
    toast.info(`Agendando reunião com líder da ${celula.nome}`);
    // Implementar agendamento
  };

  return (
    <div className="space-y-6">
      {/* Componentes principais organizados */}
      <AcoesEmMassa />
      <CelulasProntasMultiplicacao />
      <GrelhaSaudeCelulas />
      <FluxoAcompanhamentoAutomatizado />
      <MetricasCelulas />
      <FerramentasGestao />
      <RelatoriosAvancados />
      <ComunicacaoInteligente />
    </div>
  );
};