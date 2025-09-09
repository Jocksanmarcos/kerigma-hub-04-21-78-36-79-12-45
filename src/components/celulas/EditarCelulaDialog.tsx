import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface CelulaDetalhes {
  id: string;
  nome: string;
  endereco: string | null;
  dia_reuniao: string | null;
  horario_reuniao: string | null;
  ativa: boolean;
  lider_nome: string | null;
  supervisor_nome: string | null;
  coordenador_nome: string | null;
  pastor_rede_nome: string | null;
  total_membros: number;
  ultimo_relatorio: string | null;
  status_saude: 'excelente' | 'boa' | 'atencao' | 'critica';
}

interface EditarCelulaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  celula: CelulaDetalhes | null;
  onSuccess: () => void;
}

interface Pessoa {
  id: string;
  nome_completo: string;
}

export const EditarCelulaDialog: React.FC<EditarCelulaDialogProps> = ({
  open,
  onOpenChange,
  celula,
  onSuccess
}) => {
  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [diaSemana, setDiaSemana] = useState('');
  const [horario, setHorario] = useState('');
  const [ativa, setAtiva] = useState(true);
  const [liderId, setLiderId] = useState('');
  const [supervisorId, setSupervisorId] = useState('');
  const [coordenadorId, setCoordenadorId] = useState('');
  const [pastorRedeId, setPastorRedeId] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Buscar pessoas disponíveis
  const { data: pessoas } = useQuery({
    queryKey: ['pessoas-para-edicao'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pessoas')
        .select('id, nome_completo')
        .eq('situacao', 'ativo')
        .order('nome_completo');

      if (error) throw error;
      return data as Pessoa[];
    }
  });

  const diasSemana = [
    'Segunda-feira',
    'Terça-feira', 
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
    'Domingo'
  ];

  // Preencher campos quando a célula for carregada
  useEffect(() => {
    if (celula && open) {
      setNome(celula.nome);
      setEndereco(celula.endereco || '');
      setDiaSemana(celula.dia_reuniao || '');
      setHorario(celula.horario_reuniao || '');
      setAtiva(celula.ativa);

      // Buscar IDs dos líderes para preencher os selects
      if (pessoas) {
        const lider = pessoas.find(p => p.nome_completo === celula.lider_nome);
        const supervisor = pessoas.find(p => p.nome_completo === celula.supervisor_nome);
        const coordenador = pessoas.find(p => p.nome_completo === celula.coordenador_nome);
        const pastorRede = pessoas.find(p => p.nome_completo === celula.pastor_rede_nome);

        setLiderId(lider?.id || '');
        setSupervisorId(supervisor?.id || '');
        setCoordenadorId(coordenador?.id || '');
        setPastorRedeId(pastorRede?.id || '');
      }
    }
  }, [celula, open, pessoas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!celula) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('celulas')
        .update({
          nome,
          endereco: endereco || null,
          dia_semana: diaSemana || null,
          horario: horario || null,
          ativa,
          lider_id: liderId || null,
          supervisor_id: supervisorId || null,
          coordenador_id: coordenadorId || null,
          pastor_rede_id: pastorRedeId || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', celula.id);

      if (error) throw error;

      toast({
        title: "Célula atualizada",
        description: `A célula "${nome}" foi atualizada com sucesso.`
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao atualizar célula:', error);
      toast({
        title: "Erro",
        description: `Erro ao atualizar célula: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!celula) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Célula</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações Básicas</h3>
            
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Célula *</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite o nome da célula"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Digite o endereço da célula"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dia">Dia da Semana</Label>
                <Select value={diaSemana} onValueChange={setDiaSemana}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o dia" />
                  </SelectTrigger>
                  <SelectContent>
                    {diasSemana.map((dia) => (
                      <SelectItem key={dia} value={dia}>
                        {dia}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="horario">Horário</Label>
                <Input
                  id="horario"
                  type="time"
                  value={horario}
                  onChange={(e) => setHorario(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="ativa"
                checked={ativa}
                onCheckedChange={setAtiva}
              />
              <Label htmlFor="ativa">Célula ativa</Label>
            </div>
          </div>

          {/* Liderança */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Liderança</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lider">Líder de Célula</Label>
                <Select value={liderId} onValueChange={setLiderId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o líder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {pessoas?.map((pessoa) => (
                      <SelectItem key={pessoa.id} value={pessoa.id}>
                        {pessoa.nome_completo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supervisor">Supervisor Direto</Label>
                <Select value={supervisorId} onValueChange={setSupervisorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o supervisor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {pessoas?.map((pessoa) => (
                      <SelectItem key={pessoa.id} value={pessoa.id}>
                        {pessoa.nome_completo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coordenador">Coordenador</Label>
                <Select value={coordenadorId} onValueChange={setCoordenadorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o coordenador" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {pessoas?.map((pessoa) => (
                      <SelectItem key={pessoa.id} value={pessoa.id}>
                        {pessoa.nome_completo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pastor">Pastor de Rede</Label>
                <Select value={pastorRedeId} onValueChange={setPastorRedeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o pastor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {pessoas?.map((pessoa) => (
                      <SelectItem key={pessoa.id} value={pessoa.id}>
                        {pessoa.nome_completo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};