import React from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const NotificationTestButton: React.FC = () => {
  const criarNotificacaoTeste = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      // Simular criação de uma escala de teste
      const { data: escalaData, error: escalaError } = await supabase
        .from('escalas_membros')
        .insert({
          membro_id: user.id,
          evento_id: '00000000-0000-0000-0000-000000000001', // ID fictício
          cargo_id: '00000000-0000-0000-0000-000000000001', // ID fictício
          status: 'convidado'
        })
        .select()
        .single();

      if (escalaError) {
        console.error('Erro ao criar escala:', escalaError);
        toast.error('Erro ao criar escala de teste');
        return;
      }

      // Criar notificação de convocação
      const { error: notificationError } = await supabase
        .from('notificacoes_escala')
        .insert({
          escala_membro_id: escalaData.id,
          tipo: 'convocacao',
          titulo: 'Convocação para Escala de Teste',
          mensagem: 'Você foi convocado para participar da escala de teste. Por favor, confirme sua participação.',
          status: 'enviada'
        });

      if (notificationError) {
        console.error('Erro ao criar notificação:', notificationError);
        toast.error('Erro ao criar notificação de teste');
        return;
      }

      toast.success('Notificação de teste criada com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao criar notificação de teste');
    }
  };

  return (
    <Button onClick={criarNotificacaoTeste} variant="outline" size="sm">
      Criar Notificação de Teste
    </Button>
  );
};