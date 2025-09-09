import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface JornadaProfile {
  pontos_sabedoria: number;
  capitulos_lidos_ids: string[];
  nivel_atual: string;
  titulo_atual: string;
}

export const useJornadaProfile = () => {
  const [profile, setProfile] = useState<JornadaProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const capitulos_lidos_ids = profile?.capitulos_lidos_ids || [];

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('jornada_perfis_usuarios')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile(data || {
        pontos_sabedoria: 0,
        capitulos_lidos_ids: [],
        nivel_atual: 'Aprendiz',
        titulo_atual: 'Iniciante da Jornada'
      });
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const registrarLeitura = async (chapterId: string, bookName: string, chapterNumber: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('registrar-leitura', {
        body: { 
          chapterId,
          bookName,
          chapterNumber
        }
      });

      if (error) throw error;

      // Atualizar o perfil local
      if (data.pontos_ganhos > 0) {
        setProfile(prev => prev ? {
          ...prev,
          pontos_sabedoria: data.novo_total_pontos,
          capitulos_lidos_ids: [...prev.capitulos_lidos_ids, chapterId],
          nivel_atual: data.nivel_atual || prev.nivel_atual,
          titulo_atual: data.titulo_atual || prev.titulo_atual
        } : null);

        toast({
          title: data.message_title || '🎉 Parabéns!',
          description: data.message || `Você ganhou ${data.pontos_ganhos} pontos de sabedoria!`,
          duration: 5000,
        });
      } else {
        toast({
          title: 'Capítulo já lido',
          description: data.message || 'Você já ganhou pontos por este capítulo.',
        });
      }

      return data;
    } catch (error) {
      console.error('Erro ao registrar leitura:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar a leitura. Tente novamente.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return {
    profile,
    loading,
    capitulos_lidos_ids,
    registrarLeitura,
    refreshProfile: loadProfile
  };
};