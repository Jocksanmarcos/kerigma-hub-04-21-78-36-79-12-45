import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BlogoConteudo {
  id: string;
  tipo_bloco: string;
  conteudo_json: any;
  ordem: number;
}

export interface SecaoPagina {
  id: string;
  tipo_secao: string;
  ordem: number;
  status: string;
  blocos_conteudo: BlogoConteudo[];
}

export interface PaginaHomeData {
  id: string;
  title: string;
  slug: string;
  status: string;
  secoes_pagina: SecaoPagina[];
}

export const useHomePageContent = () => {
  const [paginaHomeData, setPaginaHomeData] = useState<PaginaHomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHomePageContent = async () => {
    try {
      setLoading(true);
      setError(null);

      // Query aninhada para buscar página Home com suas seções e blocos
      const { data, error } = await supabase
        .from('paginas_site')
        .select(`
          id,
          title,
          slug,
          status,
          secoes_pagina (
            id,
            tipo_secao,
            ordem,
            status,
            blocos_conteudo (
              id,
              tipo_bloco,
              conteudo_json,
              ordem
            )
          )
        `)
        .eq('slug', 'home')
        .eq('status', 'publicado')
        .order('ordem', { referencedTable: 'secoes_pagina' })
        .order('ordem', { referencedTable: 'secoes_pagina.blocos_conteudo' })
        .maybeSingle(); // Usando maybeSingle para evitar erro se não existir

      if (error) throw error;

      if (data) {
        // Filtrar apenas seções publicadas e ordenar
        const paginaComSecoesFiltradas = {
          ...data,
          secoes_pagina: (data as any).secoes_pagina
            ?.filter((secao: any) => secao.status === 'publicado')
            ?.sort((a: any, b: any) => a.ordem - b.ordem)
            ?.map((secao: any) => ({
              ...secao,
              blocos_conteudo: secao.blocos_conteudo
                ?.sort((a: any, b: any) => a.ordem - b.ordem) || []
            })) || []
        };
        
        setPaginaHomeData(paginaComSecoesFiltradas as PaginaHomeData);
      } else {
        // Se não existe página Home no CMS, criar dados padrão
        console.log('Página Home não encontrada no CMS, usando layout padrão');
        setPaginaHomeData(null);
      }

    } catch (err) {
      console.error("Erro ao carregar conteúdo da Home:", err);
      setError('Erro ao carregar conteúdo da página');
      toast.error('Erro ao carregar conteúdo da página');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomePageContent();
  }, []);

  return {
    paginaHomeData,
    loading,
    error,
    refetch: fetchHomePageContent
  };
};