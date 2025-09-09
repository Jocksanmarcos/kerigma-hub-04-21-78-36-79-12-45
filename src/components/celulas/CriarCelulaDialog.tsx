import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

interface CriarCelulaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface FormData {
  nome: string;
  dia_reuniao: string;
  horario_reuniao: string;
  endereco: string;
  cep: string;
  lider_id: string;
  supervisor_id: string;
  coordenador_id: string;
  pastor_rede_id: string;
  observacoes: string;
}

export const CriarCelulaDialog: React.FC<CriarCelulaDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    dia_reuniao: '',
    horario_reuniao: '',
    endereco: '',
    cep: '',
    lider_id: '',
    supervisor_id: '',
    coordenador_id: '',
    pastor_rede_id: '',
    observacoes: ''
  });

  const { pessoa } = useCurrentPerson();
  const { toast } = useToast();

  // Buscar pessoas para os dropdowns
  const { data: pessoas } = useQuery({
    queryKey: ['pessoas-para-lideranca'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pessoas')
        .select('id, nome_completo, papel_lideranca, email')
        .eq('situacao', 'ativo')
        .order('nome_completo');

      if (error) {
        console.error('Erro ao buscar pessoas:', error);
        return [];
      }

      return data;
    }
  });

  // Filtrar pessoas por papel
  const lideresPotenciais = pessoas?.filter(p => 
    !p.papel_lideranca || 
    p.papel_lideranca === 'membro' || 
    p.papel_lideranca === 'lider_celula'
  ) || [];

  // Para supervisores, incluir pessoas que podem ser promovidas + supervisores existentes
  const supervisores = pessoas?.filter(p => 
    p.papel_lideranca === 'supervisor' || 
    p.papel_lideranca === 'lider_celula' ||
    (!p.papel_lideranca || p.papel_lideranca === 'membro')
  ) || [];
  
  // Para coordenadores, incluir pessoas que podem ser promovidas + coordenadores existentes
  const coordenadores = pessoas?.filter(p => 
    p.papel_lideranca === 'coordenador' || 
    p.papel_lideranca === 'supervisor' ||
    p.papel_lideranca === 'lider_celula' ||
    (!p.papel_lideranca || p.papel_lideranca === 'membro')
  ) || [];
  
  // Para pastores de rede, incluir pessoas que podem ser promovidas + pastores existentes
  const pastoresRede = pessoas?.filter(p => 
    p.papel_lideranca === 'pastor_rede' || 
    p.papel_lideranca === 'coordenador' ||
    p.papel_lideranca === 'supervisor' ||
    p.papel_lideranca === 'lider_celula' ||
    (!p.papel_lideranca || p.papel_lideranca === 'membro')
  ) || [];

  const handleSubmit = async () => {
    if (!formData.nome || !formData.lider_id) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome da célula e líder são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // 1. Criar a célula
      const { data: novaCelula, error: celulaError } = await supabase
        .from('celulas')
        .insert({
          nome: formData.nome,
          endereco: formData.endereco || 'Endereço não informado',
          bairro: 'Centro', // Campo obrigatório
          dia_semana: formData.dia_reuniao || 'quinta',
          horario: formData.horario_reuniao || '19:30',
          cep: formData.cep || null,
          lider_id: formData.lider_id,
          supervisor_id: formData.supervisor_id || null,
          coordenador_id: formData.coordenador_id || null,
          pastor_rede_id: formData.pastor_rede_id || null,
          observacoes: formData.observacoes || null,
          ativa: true
        })
        .select()
        .single();

      if (celulaError) {
        console.error('Erro ao criar célula:', celulaError);
        throw celulaError;
      }

      // 2. Atualizar papel do líder (PASSO CRUCIAL!)
      const { error: liderError } = await supabase
        .from('pessoas')
        .update({ 
          papel_lideranca: 'lider_celula',
          celula_id: novaCelula.id 
        })
        .eq('id', formData.lider_id);

      if (liderError) {
        console.error('Erro ao atualizar líder:', liderError);
        // Não falhamos aqui, só logamos
      }

      // 3. Atualizar supervisor se selecionado
      if (formData.supervisor_id) {
        const { error: supervisorError } = await supabase
          .from('pessoas')
          .update({ papel_lideranca: 'supervisor' })
          .eq('id', formData.supervisor_id);

        if (supervisorError) {
          console.error('Erro ao atualizar supervisor:', supervisorError);
        }
      }

      toast({
        title: "Célula criada com sucesso!",
        description: `A célula "${formData.nome}" foi criada e o líder foi configurado.`
      });

      // Reset form
      setFormData({
        nome: '',
        dia_reuniao: '',
        horario_reuniao: '',
        endereco: '',
        cep: '',
        lider_id: '',
        supervisor_id: '',
        coordenador_id: '',
        pastor_rede_id: '',
        observacoes: ''
      });

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao criar célula:', error);
      toast({
        title: "Erro",
        description: `Erro ao criar célula: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const diasSemana = [
    { value: 'segunda', label: 'Segunda-feira' },
    { value: 'terca', label: 'Terça-feira' },
    { value: 'quarta', label: 'Quarta-feira' },
    { value: 'quinta', label: 'Quinta-feira' },
    { value: 'sexta', label: 'Sexta-feira' },
    { value: 'sabado', label: 'Sábado' },
    { value: 'domingo', label: 'Domingo' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova Célula</DialogTitle>
          <DialogDescription>
            Cadastre uma nova célula e configure sua liderança
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações da Célula</h3>
            
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Célula *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: Célula do Amor, Célula Central..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dia da Reunião</Label>
                <Select 
                  value={formData.dia_reuniao} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, dia_reuniao: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o dia" />
                  </SelectTrigger>
                  <SelectContent>
                    {diasSemana.map(dia => (
                      <SelectItem key={dia.value} value={dia.value}>
                        {dia.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="horario">Horário da Reunião</Label>
                <Input
                  id="horario"
                  type="time"
                  value={formData.horario_reuniao}
                  onChange={(e) => setFormData(prev => ({ ...prev, horario_reuniao: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                placeholder="Rua, número, bairro..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                value={formData.cep}
                onChange={(e) => setFormData(prev => ({ ...prev, cep: e.target.value }))}
                placeholder="00000-000"
                maxLength={9}
              />
            </div>
          </div>

          {/* Liderança */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Estrutura de Liderança</h3>
            
            <div className="space-y-2">
              <Label>Líder da Célula *</Label>
              <Select 
                value={formData.lider_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, lider_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o líder" />
                </SelectTrigger>
                <SelectContent>
                  {lideresPotenciais.map(pessoa => (
                    <SelectItem key={pessoa.id} value={pessoa.id}>
                      {pessoa.nome_completo} {pessoa.email && `(${pessoa.email})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Supervisor Direto</Label>
              <Select 
                value={formData.supervisor_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, supervisor_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {supervisores.map(pessoa => (
                    <SelectItem key={pessoa.id} value={pessoa.id}>
                      {pessoa.nome_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Coordenador</Label>
              <Select 
                value={formData.coordenador_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, coordenador_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o coordenador" />
                </SelectTrigger>
                <SelectContent>
                  {coordenadores.map(pessoa => (
                    <SelectItem key={pessoa.id} value={pessoa.id}>
                      {pessoa.nome_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Pastor de Rede</Label>
              <Select 
                value={formData.pastor_rede_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, pastor_rede_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o pastor de rede" />
                </SelectTrigger>
                <SelectContent>
                  {pastoresRede.map(pessoa => (
                    <SelectItem key={pessoa.id} value={pessoa.id}>
                      {pessoa.nome_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Informações adicionais sobre a célula..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Criando...' : 'Criar Célula'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};