import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePastoralAI = () => {
  const { toast } = useToast();

  const runInactivityDetection = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('pastoral-ai-inactivity-detector', {
        body: { trigger: 'manual' }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: 'IA Pastoral Executada!',
        description: `Processadas ${data.processados} pessoas. ${data.resultados.filter((r: any) => r.acao === 'marcada_inativa').length} marcadas como inativas.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro na IA Pastoral',
        description: 'Não foi possível executar a análise de inatividade.',
        variant: 'destructive',
      });
      console.error('Erro IA Pastoral:', error);
    }
  });

  const generatePastoralInsights = useMutation({
    mutationFn: async (pessoaId: string) => {
      // Buscar dados da pessoa para análise
      const { data: pessoa, error } = await supabase
        .from('pessoas')
        .select(`
          *,
          celulas(nome, lider_id),
          profiles(name, level)
        `)
        .eq('id', pessoaId)
        .single();

      if (error) throw error;

      // Simular insights da IA
      const insights = {
        risco_inatividade: Math.random() > 0.7 ? 'alto' : Math.random() > 0.4 ? 'medio' : 'baixo',
        sugestoes_pastorais: [
          'Agendar conversa pastoral individual',
          'Verificar integração em ministérios',
          'Avaliar frequência em célula'
        ],
        alertas: pessoa.situacao === 'ativo' && !pessoa.celula_id ? ['Sem célula definida'] : [],
        pontos_atencao: []
      };

      if (pessoa.tipo_pessoa === 'visitante') {
        const diasComoVisitante = Math.floor((new Date().getTime() - new Date(pessoa.created_at).getTime()) / (1000 * 60 * 60 * 24));
        if (diasComoVisitante > 21) {
          insights.alertas.push('Visitante há mais de 3 semanas - considerar processo de integração');
        }
      }

      return insights;
    },
    onSuccess: () => {
      toast({
        title: 'Insights Gerados!',
        description: 'Análise pastoral foi concluída com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao gerar insights',
        description: 'Não foi possível analisar os dados pastorais.',
        variant: 'destructive',
      });
      console.error('Erro insights:', error);
    }
  });

  return {
    runInactivityDetection,
    generatePastoralInsights,
    isRunningDetection: runInactivityDetection.isPending,
    isGeneratingInsights: generatePastoralInsights.isPending
  };
};