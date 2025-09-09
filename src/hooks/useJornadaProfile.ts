import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentPerson } from './useCurrentPerson';

interface JornadaProfile {
  pontos_sabedoria: number;
  nivel: string;
  next_level_xp: number;
  capitulos_lidos_ids: string[];
  ultima_atividade_em: string | null;
  loading: boolean;
  error: string | null;
  registrarLeitura?: (chapterId: string, bookName: string, chapterNumber: string) => Promise<void>;
}

export const useJornadaProfile = (): JornadaProfile => {
  const [profile, setProfile] = useState<JornadaProfile>({
    pontos_sabedoria: 0,
    nivel: 'Aprendiz',
    next_level_xp: 100,
    capitulos_lidos_ids: [],
    ultima_atividade_em: null,
    loading: true,
    error: null
  });

  const { pessoa, loading: personLoading } = useCurrentPerson();

  const loadProfile = async () => {
    if (personLoading || !pessoa) return;
    
    try {
      setProfile(prev => ({ ...prev, loading: true, error: null }));

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profileData, error } = await supabase
        .from('jornada_perfis_usuarios')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (profileData) {
        setProfile({
          pontos_sabedoria: profileData.pontos_sabedoria || 0,
          nivel: (profileData as any).nivel || 'Aprendiz',
          next_level_xp: (profileData as any).next_level_xp || 100,
          capitulos_lidos_ids: profileData.capitulos_lidos_ids || [],
          ultima_atividade_em: profileData.ultima_atividade_em,
          loading: false,
          error: null
        });
      } else {
        // Se não existe perfil, criar um
        const { error: createError } = await supabase
          .from('jornada_perfis_usuarios')
          .insert({
            user_id: user.id,
            pontos_sabedoria: 0,
            nivel: 'Aprendiz',
            next_level_xp: 100,
            capitulos_lidos_ids: []
          });

        if (createError) throw createError;

        setProfile({
          pontos_sabedoria: 0,
          nivel: 'Aprendiz',
          next_level_xp: 100,
          capitulos_lidos_ids: [],
          ultima_atividade_em: null,
          loading: false,
          error: null
        });
      }

    } catch (error) {
      console.error('Erro ao carregar perfil da jornada:', error);
      setProfile(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }));
    }
  };

  const registrarLeitura = async (chapterId: string, bookName: string, chapterNumber: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('registrar-leitura-capitulo', {
        body: { chapterId, bookName, chapterNumber }
      });

      if (error) throw error;

      // Recarregar o perfil após registrar a leitura
      await loadProfile();
      
      return data;
    } catch (error) {
      console.error('Erro ao registrar leitura:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadProfile();
  }, [pessoa, personLoading]);

  return {
    ...profile,
    registrarLeitura
  };
};