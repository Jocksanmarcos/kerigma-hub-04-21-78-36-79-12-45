import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Play, Trophy } from 'lucide-react';
import { useStudyStreak } from '@/hooks/useStudyStreak';
import { toast } from 'sonner';

interface Props {
  className?: string;
}

export const QuickStudyAction: React.FC<Props> = ({ className }) => {
  const { registrarAtividade } = useStudyStreak();

  const handleQuickStudy = async () => {
    try {
      await registrarAtividade('leitura_biblica');
      toast.success('Atividade de estudo registrada!', {
        description: 'Parabéns por manter sua jornada de crescimento.',
      });
    } catch (error) {
      toast.error('Erro ao registrar atividade');
    }
  };

  return (
    <div className={className}>
      <Button onClick={handleQuickStudy} variant="outline" size="sm">
        <Trophy className="h-4 w-4 mr-2" />
        Registrar Estudo
      </Button>
    </div>
  );
};