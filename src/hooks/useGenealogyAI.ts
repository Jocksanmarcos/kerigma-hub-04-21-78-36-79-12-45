import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type GenealogyAnalysisType = 'sugestoes_vinculos' | 'inconsistencias' | 'qualidade';

export interface VinculoSugerido {
  pessoa_origem: string;
  pessoa_destino: string;
  tipo_vinculo: 'pai' | 'mae' | 'filho' | 'filha';
  confianca: number;
  motivos: string[];
  prioridade: 'alta' | 'media' | 'baixa';
}

export interface InconsistenciaDetectada {
  tipo: string;
  descricao: string;
  pessoas_envolvidas: string[];
  sugestao_correcao: string;
}

export interface GenealogyAnalysisResult {
  pessoa?: {
    id: string;
    nome: string;
    idade: number;
  };
  possiveis_pais?: any[];
  possiveis_filhos?: any[];
  analise_ia?: {
    confianca: number;
    sugestoes_vinculos: VinculoSugerido[];
    inconsistencias_detectadas: InconsistenciaDetectada[];
    insights_familias: any[];
    recomendacoes: string[];
  };
  metadata?: {
    processado_em: string;
    tipo_analise: string;
    total_pessoas_analisadas: number;
    fonte: string;
  };
}

export const useGenealogyAI = () => {
  const { toast } = useToast();

  const analyzeGenealogy = useMutation({
    mutationFn: async (params: { pessoaId?: string; tipoAnalise?: GenealogyAnalysisType }) => {
      const { data, error } = await supabase.functions.invoke('genealogy-ai-analysis', {
        body: {
          pessoaId: params.pessoaId,
          tipoAnalise: params.tipoAnalise || 'sugestoes_vinculos'
        }
      });

      if (error) throw error;
      return data as GenealogyAnalysisResult;
    },
    onSuccess: (data) => {
      const totalSugestoes = data.analise_ia?.sugestoes_vinculos?.length || 0;
      const totalInconsistencias = data.analise_ia?.inconsistencias_detectadas?.length || 0;
      
      toast({
        title: 'Análise Genealógica Concluída!',
        description: `IA encontrou ${totalSugestoes} sugestões de vínculos e ${totalInconsistencias} inconsistências.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro na Análise de IA',
        description: 'Não foi possível processar a análise genealógica com IA.',
        variant: 'destructive',
      });
      console.error('Erro análise genealogia IA:', error);
    }
  });

  const applyFamilyLink = useMutation({
    mutationFn: async (params: { pessoaId: string; parentId: string; tipoVinculo: 'pai' | 'mae' }) => {
      const updates: any = {};
      
      if (params.tipoVinculo === 'pai') {
        updates.pai_id = params.parentId;
      } else if (params.tipoVinculo === 'mae') {
        updates.mae_id = params.parentId;
      }

      const { error } = await supabase
        .from('pessoas')
        .update(updates)
        .eq('id', params.pessoaId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Vínculo Familiar Aplicado!',
        description: 'O vínculo familiar foi criado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao Criar Vínculo',
        description: 'Não foi possível criar o vínculo familiar.',
        variant: 'destructive',
      });
      console.error('Erro criar vínculo:', error);
    }
  });

  return {
    analyzeGenealogy,
    applyFamilyLink,
    isAnalyzing: analyzeGenealogy.isPending,
    isApplying: applyFamilyLink.isPending
  };
};