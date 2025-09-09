import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface PessoaData {
  id: string;
  nome_completo: string;
  email: string;
  user_id: string;
  telefone?: string;
  foto_url?: string;
  tipo_pessoa?: string;
  situacao?: string;
}

export const useCurrentPerson = () => {
  const [pessoa, setPessoa] = useState<PessoaData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCurrentPerson = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      setUser(user);

      if (user) {
        const { data: pessoaData, error: pessoaError } = await supabase
          .from('pessoas')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (pessoaError) {
          throw pessoaError;
        }
        
        if (!pessoaData) {
          // Criar perfil básico se não existir
          const { data: newPessoa, error: createError } = await supabase
            .from('pessoas')
            .insert({
              user_id: user.id,
              nome_completo: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
              email: user.email || '',
              tipo_pessoa: 'membro',
              situacao: 'ativo'
            })
            .select()
            .single();

          if (createError) {
            console.error('Erro ao criar perfil:', createError);
            setError('Erro ao criar perfil de usuário');
          } else {
            setPessoa(newPessoa);
          }
        } else {
          setPessoa(pessoaData);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar pessoa atual:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentPerson();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadCurrentPerson();
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    pessoa,
    user,
    loading,
    error,
    refetch: loadCurrentPerson
  };
};