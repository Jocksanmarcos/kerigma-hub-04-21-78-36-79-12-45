import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, Plus, Trash2, Check, X, Edit } from 'lucide-react';

interface Pessoa {
  id: string;
  nome_completo: string;
  email?: string;
  telefone?: string;
  foto_url?: string;
}

interface VinculoFamiliar {
  id: string;
  pessoa_id: string;
  pessoa_relacionada_id?: string;
  tipo_vinculo: string;
  observacoes_parentesco?: string;
  confirmado: boolean;
  pessoas?: Pessoa;
  pessoa_relacionada?: Pessoa;
}

interface GerenciarParentescosProps {
  pessoaId: string;
  nomePessoa: string;
  familiaId: string;
  onClose: () => void;
}

const tiposParentesco = [
  { value: 'esposo', label: 'Esposo' },
  { value: 'esposa', label: 'Esposa' },
  { value: 'conjuge', label: 'Cônjuge' },
  { value: 'pai', label: 'Pai' },
  { value: 'mae', label: 'Mãe' },
  { value: 'filho', label: 'Filho' },
  { value: 'filha', label: 'Filha' },
  { value: 'irmao', label: 'Irmão' },
  { value: 'irma', label: 'Irmã' },
  { value: 'avo', label: 'Avô' },
  { value: 'ava', label: 'Avó' },
  { value: 'neto', label: 'Neto' },
  { value: 'neta', label: 'Neta' },
  { value: 'tio', label: 'Tio' },
  { value: 'tia', label: 'Tia' },
  { value: 'sobrinho', label: 'Sobrinho' },
  { value: 'sobrinha', label: 'Sobrinha' },
  { value: 'primo', label: 'Primo' },
  { value: 'prima', label: 'Prima' },
  { value: 'genro', label: 'Genro' },
  { value: 'nora', label: 'Nora' },
  { value: 'sogro', label: 'Sogro' },
  { value: 'sogra', label: 'Sogra' },
  { value: 'cunhado', label: 'Cunhado' },
  { value: 'cunhada', label: 'Cunhada' },
  { value: 'padrasto', label: 'Padrasto' },
  { value: 'madrasta', label: 'Madrasta' },
  { value: 'enteado', label: 'Enteado' },
  { value: 'enteada', label: 'Enteada' },
  { value: 'outro', label: 'Outro' },
];

export default function GerenciarParentescos({ pessoaId, nomePessoa, familiaId, onClose }: GerenciarParentescosProps) {
  const { toast } = useToast();
  const [vinculos, setVinculos] = useState<VinculoFamiliar[]>([]);
  const [pessoasDaFamilia, setPessoasDaFamilia] = useState<Pessoa[]>([]);
  const [novoVinculo, setNovoVinculo] = useState({
    pessoa_relacionada_id: '',
    tipo_vinculo: '',
    observacoes: ''
  });
  const [editandoVinculo, setEditandoVinculo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVinculos();
    loadPessoasDaFamilia();
  }, [pessoaId, familiaId]);

  const loadVinculos = async () => {
    try {
      const { data, error } = await supabase
        .from('vinculos_familiares')
        .select(`
          *,
          pessoas!vinculos_familiares_pessoa_relacionada_id_fkey(id, nome_completo, email, telefone, foto_url)
        `)
        .eq('pessoa_id', pessoaId)
        .neq('tipo_vinculo', 'membro')
        .neq('tipo_vinculo', 'responsavel');

      if (error) throw error;
      setVinculos(data || []);
    } catch (error) {
      console.error('Erro ao carregar vínculos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os vínculos familiares.',
        variant: 'destructive',
      });
    }
  };

  const loadPessoasDaFamilia = async () => {
    try {
      const { data, error } = await supabase
        .from('pessoas')
        .select('id, nome_completo, email, telefone, foto_url')
        .eq('familia_id', familiaId)
        .neq('id', pessoaId);

      if (error) throw error;
      setPessoasDaFamilia(data || []);
    } catch (error) {
      console.error('Erro ao carregar pessoas da família:', error);
    }
  };

  const criarVinculo = async () => {
    console.log('🔗 Iniciando criação de vínculo:', {
      pessoaId,
      familiaId,
      novoVinculo
    });

    if (!novoVinculo.pessoa_relacionada_id || !novoVinculo.tipo_vinculo) {
      console.log('❌ Dados insuficientes');
      toast({
        title: 'Aviso',
        description: 'Selecione uma pessoa e o tipo de parentesco.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      console.log('📝 Inserindo dados na tabela vinculos_familiares...');
      
      const dadosInsercao = {
        familia_id: familiaId,
        pessoa_id: pessoaId,
        pessoa_relacionada_id: novoVinculo.pessoa_relacionada_id,
        tipo_vinculo: novoVinculo.tipo_vinculo as any,
        observacoes_parentesco: novoVinculo.observacoes,
        confirmado: false
      };
      
      console.log('📋 Dados para inserção:', dadosInsercao);

      const { data, error } = await supabase
        .from('vinculos_familiares')
        .insert(dadosInsercao)
        .select();

      console.log('🔍 Resultado da inserção:', { data, error });

      if (error) {
        console.log('❌ Erro detalhado:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('✅ Vínculo criado com sucesso!');
      toast({
        title: 'Sucesso',
        description: 'Vínculo familiar criado com sucesso!',
      });

      setNovoVinculo({ pessoa_relacionada_id: '', tipo_vinculo: '', observacoes: '' });
      loadVinculos();
    } catch (error) {
      console.error('💥 Erro completo ao criar vínculo:', error);
      toast({
        title: 'Erro',
        description: `Não foi possível criar o vínculo familiar. Erro: ${error.message || 'Desconhecido'}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmarVinculo = async (vinculoId: string) => {
    try {
      const { error } = await supabase
        .from('vinculos_familiares')
        .update({ 
          confirmado: true,
          data_confirmacao: new Date().toISOString()
        })
        .eq('id', vinculoId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Vínculo confirmado com sucesso!',
      });

      loadVinculos();
    } catch (error) {
      console.error('Erro ao confirmar vínculo:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível confirmar o vínculo.',
        variant: 'destructive',
      });
    }
  };

  const removerVinculo = async (vinculoId: string) => {
    try {
      const { error } = await supabase
        .from('vinculos_familiares')
        .delete()
        .eq('id', vinculoId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Vínculo removido com sucesso!',
      });

      loadVinculos();
    } catch (error) {
      console.error('Erro ao remover vínculo:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o vínculo.',
        variant: 'destructive',
      });
    }
  };

  const getTipoParentescoLabel = (tipo: string) => {
    const tipoObj = tiposParentesco.find(t => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Gerenciar Parentescos - {nomePessoa}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulário para novo vínculo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Adicionar Novo Parentesco</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pessoa Relacionada</Label>
                <Select 
                  value={novoVinculo.pessoa_relacionada_id} 
                  onValueChange={(value) => setNovoVinculo(prev => ({ ...prev, pessoa_relacionada_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma pessoa da família" />
                  </SelectTrigger>
                  <SelectContent>
                    {pessoasDaFamilia.map(pessoa => (
                      <SelectItem key={pessoa.id} value={pessoa.id}>
                        {pessoa.nome_completo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Parentesco</Label>
                <Select 
                  value={novoVinculo.tipo_vinculo} 
                  onValueChange={(value) => setNovoVinculo(prev => ({ ...prev, tipo_vinculo: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o parentesco" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposParentesco.map(tipo => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observações (opcional)</Label>
              <Textarea
                value={novoVinculo.observacoes}
                onChange={(e) => setNovoVinculo(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Ex: Pai adotivo, meio-irmão, etc."
                rows={2}
              />
            </div>

            <Button 
              onClick={criarVinculo} 
              disabled={loading || !novoVinculo.pessoa_relacionada_id || !novoVinculo.tipo_vinculo}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Parentesco
            </Button>
          </CardContent>
        </Card>

        {/* Lista de vínculos existentes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Parentescos Existentes</CardTitle>
          </CardHeader>
          <CardContent>
            {vinculos.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum parentesco específico cadastrado ainda.
              </p>
            ) : (
              <div className="space-y-3">
                {vinculos.map(vinculo => (
                  <div key={vinculo.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {vinculo.pessoas?.nome_completo || 'Pessoa não encontrada'}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant={vinculo.confirmado ? 'default' : 'secondary'}>
                            {getTipoParentescoLabel(vinculo.tipo_vinculo)}
                          </Badge>
                          {!vinculo.confirmado && (
                            <Badge variant="outline">Pendente confirmação</Badge>
                          )}
                        </div>
                        {vinculo.observacoes_parentesco && (
                          <span className="text-sm text-muted-foreground mt-1">
                            {vinculo.observacoes_parentesco}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!vinculo.confirmado && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => confirmarVinculo(vinculo.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removerVinculo(vinculo.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}