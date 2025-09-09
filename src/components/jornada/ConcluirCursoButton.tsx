import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';
import { toast } from 'sonner';

interface Props {
  cursoId: string;
  cursoNome?: string;
  className?: string;
  onConclusao?: () => void;
}

export const ConcluirCursoButton: React.FC<Props> = ({
  cursoId,
  cursoNome = 'curso',
  className,
  onConclusao
}) => {
  const [loading, setLoading] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const { pessoa } = useCurrentPerson();

  const handleConcluirCurso = async () => {
    if (!pessoa?.id) {
      toast.error('Você precisa estar logado para concluir o curso.');
      return;
    }

    setLoading(true);
    try {
      // Chamar a edge function para processar a conquista
      const { data, error } = await supabase.functions.invoke('processar-conquista', {
        body: {
          tipo_conquista: 'curso_concluido',
          curso_id: cursoId,
          pessoa_id: pessoa.id,
          detalhes: {
            curso_nome: cursoNome,
            data_conclusao: new Date().toISOString()
          }
        }
      });

      if (error) {
        throw error;
      }

      // Sucesso
      setConcluido(true);
      toast.success(data.message || 'Curso concluído com sucesso!', {
        description: `Você ganhou ${data.pontosGanhos} XP e o badge "${data.badgeObtido}"!`,
        duration: 5000,
      });

      // Registrar atividade de estudo
      try {
        await supabase.from('atividades_estudo').insert({
          pessoa_id: pessoa.id,
          tipo_atividade: 'curso_concluido',
          curso_id: cursoId,
          duracao_minutos: 0,
          data_atividade: new Date().toISOString().split('T')[0]
        });
      } catch (activityError) {
        console.warn('Erro ao registrar atividade:', activityError);
      }

      // Callback opcional
      if (onConclusao) {
        onConclusao();
      }

    } catch (error) {
      console.error('Erro ao concluir curso:', error);
      toast.error('Erro ao concluir curso. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (concluido) {
    return (
      <Button variant="outline" className={className} disabled>
        <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
        Curso Concluído
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleConcluirCurso}
      disabled={loading}
      className={className}
      size="lg"
    >
      {loading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Processando...
        </div>
      ) : (
        <>
          <Trophy className="h-4 w-4 mr-2" />
          Concluir {cursoNome}
        </>
      )}
    </Button>
  );
};