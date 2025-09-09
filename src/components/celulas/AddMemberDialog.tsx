import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface NovoMembro {
  nome_completo: string;
  telefone: string;
  email: string;
  data_nascimento: string;
}

export const AddMemberDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<NovoMembro>({
    nome_completo: '',
    telefone: '',
    email: '',
    data_nascimento: ''
  });

  const queryClient = useQueryClient();

  const addMemberMutation = useMutation({
    mutationFn: async (novoMembro: NovoMembro) => {
      // Primeiro obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar a pessoa do usuário atual
      const { data: pessoa } = await supabase
        .from('pessoas')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!pessoa) {
        throw new Error('Pessoa não encontrada para o usuário atual');
      }

      // Buscar a célula onde a pessoa é líder
      const { data: celula } = await supabase
        .from('celulas')
        .select('id')
        .eq('lider_id', pessoa.id)
        .single();

      if (!celula) {
        throw new Error('Célula não encontrada para este líder');
      }

      // Adicionar como participante da célula diretamente
      const { data: novoParticipante, error: participanteError } = await supabase
        .from('participantes_celulas')
        .insert({
          celula_id: celula.id,
          nome: novoMembro.nome_completo,
          telefone: novoMembro.telefone,
          email: novoMembro.email,
          data_entrada: new Date().toISOString().split('T')[0],
          tipo_participante: 'membro',
          ativo: true
        })
        .select()
        .single();

      if (participanteError) throw participanteError;

      return novoParticipante;
    },
    onSuccess: () => {
      toast.success('Membro adicionado com sucesso!');
      setOpen(false);
      setFormData({
        nome_completo: '',
        telefone: '',
        email: '',
        data_nascimento: ''
      });
      queryClient.invalidateQueries({ queryKey: ['lider-celula-data'] });
    },
    onError: (error) => {
      console.error('Erro ao adicionar membro:', error);
      toast.error('Erro ao adicionar membro. Tente novamente.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome_completo || !formData.telefone) {
      toast.error('Nome e telefone são obrigatórios');
      return;
    }

    addMemberMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof NovoMembro, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full mt-4" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Membro
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Membro</DialogTitle>
          <DialogDescription>
            Adicione um novo membro à sua célula
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="nome_completo">Nome Completo *</Label>
              <Input
                id="nome_completo"
                type="text"
                value={formData.nome_completo}
                onChange={(e) => handleInputChange('nome_completo', e.target.value)}
                placeholder="Digite o nome completo"
                required
              />
            </div>
            <div>
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                type="tel"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                placeholder="(11) 99999-9999"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="data_nascimento">Data de Nascimento</Label>
              <Input
                id="data_nascimento"
                type="date"
                value={formData.data_nascimento}
                onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
              />
            </div>
          </div>
          <div className="flex space-x-2 pt-4">
            <Button 
              type="submit"
              className="flex-1"
              disabled={addMemberMutation.isPending}
            >
              {addMemberMutation.isPending ? 'Adicionando...' : 'Adicionar Membro'}
            </Button>
            <Button 
              type="button"
              variant="outline" 
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};