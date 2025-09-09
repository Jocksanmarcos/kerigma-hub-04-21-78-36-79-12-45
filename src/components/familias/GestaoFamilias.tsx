import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Heart, Plus, Users, Search, Link, Unlink, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import GerenciarParentescos from './GerenciarParentescos';

interface Familia {
  id: string;
  nome_familia: string;
  endereco?: string;
  telefone_principal?: string;
  created_at: string;
  membros: any[];
}

interface Pessoa {
  id: string;
  nome_completo: string;
  email?: string;
  telefone?: string;
  familia_id?: string;
  foto_url?: string;
}

interface PessoaComVinculoInconsistente {
  id: string;
  nome_completo: string;
  email?: string;
  telefone?: string;
  foto_url?: string;
  familia_id: string;
  nome_familia: string;
}

const GestaoFamilias: React.FC = () => {
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [pessoasSemFamilia, setPessoasSemFamilia] = useState<Pessoa[]>([]);
  const [pessoasComVinculosInconsistentes, setPessoasComVinculosInconsistentes] = useState<PessoaComVinculoInconsistente[]>([]);
  const [selectedPessoa, setSelectedPessoa] = useState<string>('');
  const [selectedFamilia, setSelectedFamilia] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [parentescosModal, setParentescosModal] = useState<{
    isOpen: boolean;
    pessoaId: string;
    nomePessoa: string;
    familiaId: string;
  }>({
    isOpen: false,
    pessoaId: '',
    nomePessoa: '',
    familiaId: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadFamilias();
    loadPessoasSemFamilia();
    loadPessoasComVinculosInconsistentes();
  }, []);

  const loadFamilias = async () => {
    try {
      const { data: familiasData, error } = await supabase
        .from('familias')
        .select(`
          *,
          membros:pessoas!inner(
            id,
            nome_completo,
            email,
            telefone,
            foto_url
          )
        `)
        .order('nome_familia');

      if (error) throw error;

      // Agrupar membros por família
      const familiasProcessadas = familiasData?.reduce((acc: Familia[], familia: any) => {
        const familiaExistente = acc.find(f => f.id === familia.id);
        
        if (familiaExistente) {
          familiaExistente.membros.push(...familia.membros);
        } else {
          acc.push({
            ...familia,
            membros: familia.membros || []
          });
        }
        
        return acc;
      }, []) || [];

      setFamilias(familiasProcessadas);
    } catch (error) {
      console.error('Erro ao carregar famílias:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as famílias.',
        variant: 'destructive',
      });
    }
  };

  const loadPessoasSemFamilia = async () => {
    try {
      const { data, error } = await supabase
        .from('pessoas')
        .select('id, nome_completo, email, telefone, foto_url')
        .is('familia_id', null)
        .eq('situacao', 'ativo')
        .order('nome_completo');

      if (error) throw error;
      setPessoasSemFamilia(data || []);
    } catch (error) {
      console.error('Erro ao carregar pessoas sem família:', error);
    } finally {
      setLoading(false);
    }
  };

  const consolidarFamiliasDuplicadas = async () => {
    try {
      // Buscar famílias duplicadas
      const { data: familias, error } = await supabase
        .from('familias')
        .select('*')
        .order('created_at');

      if (error) throw error;

      // Agrupar por nome
      const familiasAgrupadas = familias?.reduce((acc: any, familia: any) => {
        if (!acc[familia.nome_familia]) {
          acc[familia.nome_familia] = [];
        }
        acc[familia.nome_familia].push(familia);
        return acc;
      }, {});

      // Consolidar duplicadas
      for (const nomeFamilia in familiasAgrupadas) {
        const familiasComMesmoNome = familiasAgrupadas[nomeFamilia];
        
        if (familiasComMesmoNome.length > 1) {
          const familiaOriginal = familiasComMesmoNome[0]; // A mais antiga
          const familiasDuplicadas = familiasComMesmoNome.slice(1);

          // Mover todos os vínculos para a família original
          for (const familiaDuplicada of familiasDuplicadas) {
            // Atualizar vínculos_familiares
            await supabase
              .from('vinculos_familiares')
              .update({ familia_id: familiaOriginal.id })
              .eq('familia_id', familiaDuplicada.id);

            // Atualizar pessoas
            await supabase
              .from('pessoas')
              .update({ familia_id: familiaOriginal.id })
              .eq('familia_id', familiaDuplicada.id);

            // Remover família duplicada
            await supabase
              .from('familias')
              .delete()
              .eq('id', familiaDuplicada.id);
          }
        }
      }

      toast({
        title: 'Sucesso',
        description: 'Famílias duplicadas consolidadas!',
      });

      // Recarregar dados
      loadFamilias();
      loadPessoasSemFamilia();
      loadPessoasComVinculosInconsistentes();
    } catch (error) {
      console.error('Erro ao consolidar famílias:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao consolidar famílias duplicadas.',
        variant: 'destructive',
      });
    }
  };

  const loadPessoasComVinculosInconsistentes = async () => {
    try {
      const { data, error } = await supabase
        .from('vinculos_familiares')
        .select(`
          pessoa_id,
          familia_id,
          pessoas!inner(nome_completo, email, telefone, foto_url, familia_id),
          familias!inner(nome_familia)
        `)
        .is('pessoas.familia_id', null);

      if (error) throw error;

      const pessoasInconsistentes = data?.map((vinculo: any) => ({
        id: vinculo.pessoa_id,
        nome_completo: vinculo.pessoas.nome_completo,
        email: vinculo.pessoas.email,
        telefone: vinculo.pessoas.telefone,
        foto_url: vinculo.pessoas.foto_url,
        familia_id: vinculo.familia_id,
        nome_familia: vinculo.familias.nome_familia
      })) || [];

      setPessoasComVinculosInconsistentes(pessoasInconsistentes);
    } catch (error) {
      console.error('Erro ao carregar pessoas com vínculos inconsistentes:', error);
    }
  };

  const corrigirVinculoInconsistente = async (pessoaId: string, familiaId: string) => {
    try {
      // Atualizar a tabela pessoas para incluir o familia_id
      const { error } = await supabase
        .from('pessoas')
        .update({ familia_id: familiaId })
        .eq('id', pessoaId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Vínculo corrigido com sucesso!',
      });

      // Recarregar dados
      loadFamilias();
      loadPessoasSemFamilia();
      loadPessoasComVinculosInconsistentes();
    } catch (error) {
      console.error('Erro ao corrigir vínculo:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível corrigir o vínculo.',
        variant: 'destructive',
      });
    }
  };

  const criarNovaFamilia = async (nomeFamilia: string, pessoaId: string) => {
    try {
      // Verificar se já existe uma família com este nome
      const { data: familiaExistente } = await supabase
        .from('familias')
        .select('id, nome_familia')
        .eq('nome_familia', nomeFamilia)
        .maybeSingle();

      let familiaId: string;

      if (familiaExistente) {
        // Se já existe, usar a família existente
        familiaId = familiaExistente.id;
        
        toast({
          title: 'Informação',
          description: `Família "${nomeFamilia}" já existe. Vinculando à família existente.`,
        });
      } else {
        // Se não existe, criar nova família
        const { data: novaFamilia, error: familiaError } = await supabase
          .from('familias')
          .insert({ nome_familia: nomeFamilia })
          .select()
          .single();

        if (familiaError) throw familiaError;
        familiaId = novaFamilia.id;
      }

      // Verificar se a pessoa já está vinculada
      const { data: pessoaExistente } = await supabase
        .from('pessoas')
        .select('familia_id')
        .eq('id', pessoaId)
        .maybeSingle();

      const { data: vinculoExistente } = await supabase
        .from('vinculos_familiares')
        .select('id, familia_id')
        .eq('pessoa_id', pessoaId)
        .maybeSingle();

      if (vinculoExistente) {
        toast({
          title: 'Aviso',
          description: 'Esta pessoa já possui vínculo familiar.',
          variant: 'destructive',
        });
        return;
      }

      if (pessoaExistente?.familia_id) {
        toast({
          title: 'Aviso',
          description: 'Esta pessoa já está vinculada a uma família.',
          variant: 'destructive',
        });
        return;
      }

      // Vincular pessoa à família
      const { error: updateError } = await supabase
        .from('pessoas')
        .update({ familia_id: familiaId })
        .eq('id', pessoaId);

      if (updateError) throw updateError;

      // Criar vínculo na tabela vinculos_familiares
      const { error: vinculoError } = await supabase
        .from('vinculos_familiares')
        .insert({
          familia_id: familiaId,
          pessoa_id: pessoaId,
          tipo_vinculo: 'responsavel',
          responsavel_familiar: true
        });

      if (vinculoError) throw vinculoError;

      toast({
        title: 'Sucesso',
        description: 'Nova família criada com sucesso!',
      });

      // Recarregar dados
      loadFamilias();
      loadPessoasSemFamilia();
      loadPessoasComVinculosInconsistentes();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao criar família:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a família.',
        variant: 'destructive',
      });
    }
  };

  const vincularPessoaFamilia = async () => {
    console.log('🔗 Iniciando vinculação:', { selectedPessoa, selectedFamilia });
    
    if (!selectedPessoa || !selectedFamilia) {
      console.log('❌ Dados insuficientes para vinculação');
      toast({
        title: 'Aviso',
        description: 'Selecione uma pessoa e uma família.',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('🔍 Verificando vínculos existentes...');
      // Verificar se já existe vínculo na tabela vinculos_familiares
      const { data: vinculoExistente, error: verificacaoError } = await supabase
        .from('vinculos_familiares')
        .select(`
          id,
          familia_id,
          tipo_vinculo,
          familias!inner(nome_familia)
        `)
        .eq('pessoa_id', selectedPessoa)
        .maybeSingle();

      console.log('🔍 Resultado da verificação de vínculo:', { vinculoExistente, verificacaoError });

      if (verificacaoError) {
        console.log('❌ Erro na verificação:', verificacaoError);
        throw verificacaoError;
      }

      if (vinculoExistente) {
        console.log('✅ Vínculo existente encontrado:', vinculoExistente);
        const familiaVinculada = (vinculoExistente.familias as any)?.nome_familia;
        
        // Se está tentando vincular à mesma família que já está vinculada, apenas corrigir a inconsistência
        if (vinculoExistente.familia_id === selectedFamilia) {
          console.log('🔄 Corrigindo inconsistência para a mesma família');
          const { error: updateError } = await supabase
            .from('pessoas')
            .update({ familia_id: selectedFamilia })
            .eq('id', selectedPessoa);

          if (updateError) {
            console.log('❌ Erro ao corrigir inconsistência:', updateError);
            throw updateError;
          }

          console.log('✅ Inconsistência corrigida com sucesso');
          toast({
            title: 'Sucesso',
            description: 'Vínculo corrigido com sucesso!',
          });

          // Recarregar dados
          loadFamilias();
          loadPessoasSemFamilia();
          loadPessoasComVinculosInconsistentes();
          setSelectedPessoa('');
          setSelectedFamilia('');
          return;
        } else {
          console.log('🔄 Transferindo pessoa para nova família');
          // Se está tentando vincular a uma família diferente, atualizar o vínculo
          const { error: updateVinculoError } = await supabase
            .from('vinculos_familiares')
            .update({ familia_id: selectedFamilia })
            .eq('pessoa_id', selectedPessoa);

          if (updateVinculoError) {
            console.log('❌ Erro ao atualizar vínculo:', updateVinculoError);
            throw updateVinculoError;
          }

          const { error: updatePessoaError } = await supabase
            .from('pessoas')
            .update({ familia_id: selectedFamilia })
            .eq('id', selectedPessoa);

          if (updatePessoaError) {
            console.log('❌ Erro ao atualizar pessoa:', updatePessoaError);
            throw updatePessoaError;
          }

          console.log('✅ Transferência concluída com sucesso');
          toast({
            title: 'Sucesso',
            description: 'Pessoa transferida para nova família com sucesso!',
          });

          // Recarregar dados
          loadFamilias();
          loadPessoasSemFamilia();
          loadPessoasComVinculosInconsistentes();
          setSelectedPessoa('');
          setSelectedFamilia('');
          return;
        }
      }

      console.log('🆕 Criando novo vínculo familiar');
      // Se não há vínculo existente, criar novo vínculo
      // Atualizar na tabela pessoas
      console.log('📝 Atualizando tabela pessoas...');
      const { error: updateError } = await supabase
        .from('pessoas')
        .update({ familia_id: selectedFamilia })
        .eq('id', selectedPessoa);

      if (updateError) {
        console.log('❌ Erro ao atualizar tabela pessoas:', updateError);
        throw updateError;
      }
      console.log('✅ Tabela pessoas atualizada');

      // Criar vínculo na tabela vinculos_familiares
      console.log('📝 Criando vínculo na tabela vinculos_familiares...');
      const { error: vinculoError } = await supabase
        .from('vinculos_familiares')
        .insert({
          familia_id: selectedFamilia,
          pessoa_id: selectedPessoa,
          tipo_vinculo: 'membro',
          responsavel_familiar: false
        });

      if (vinculoError) {
        console.log('❌ Erro ao criar vínculo familiar:', vinculoError);
        throw vinculoError;
      }
      console.log('✅ Vínculo familiar criado');

      console.log('🎉 Vinculação concluída com sucesso!');
      toast({
        title: 'Sucesso',
        description: 'Pessoa vinculada à família com sucesso!',
      });

      // Recarregar dados
      loadFamilias();
      loadPessoasSemFamilia();
      loadPessoasComVinculosInconsistentes();
      setSelectedPessoa('');
      setSelectedFamilia('');
    } catch (error) {
      console.error('Erro ao vincular pessoa:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível vincular a pessoa à família.',
        variant: 'destructive',
      });
    }
  };

  const desvincularPessoa = async (pessoaId: string) => {
    try {
      // Remover vínculo da tabela vinculos_familiares
      const { error: vinculoError } = await supabase
        .from('vinculos_familiares')
        .delete()
        .eq('pessoa_id', pessoaId);

      if (vinculoError) throw vinculoError;

      // Atualizar na tabela pessoas
      const { error: pessoaError } = await supabase
        .from('pessoas')
        .update({ familia_id: null })
        .eq('id', pessoaId);

      if (pessoaError) throw pessoaError;

      toast({
        title: 'Sucesso',
        description: 'Pessoa desvinculada da família.',
      });

      // Recarregar dados
      loadFamilias();
      loadPessoasSemFamilia();
      loadPessoasComVinculosInconsistentes();
    } catch (error) {
      console.error('Erro ao desvincular pessoa:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível desvincular a pessoa.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar família..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={consolidarFamiliasDuplicadas}
          >
            Consolidar Duplicadas
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Família
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Família</DialogTitle>
              </DialogHeader>
              <NovaFamiliaForm 
                pessoasSemFamilia={pessoasSemFamilia}
                onSubmit={criarNovaFamilia}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Seção de vinculação rápida */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Vincular Pessoa à Família
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedPessoa} onValueChange={setSelectedPessoa}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar pessoa" />
              </SelectTrigger>
              <SelectContent>
                {pessoasSemFamilia.map((pessoa) => (
                  <SelectItem key={pessoa.id} value={pessoa.id}>
                    {pessoa.nome_completo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedFamilia} onValueChange={setSelectedFamilia}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar família" />
              </SelectTrigger>
              <SelectContent>
                {familias.map((familia) => (
                  <SelectItem key={familia.id} value={familia.id}>
                    {familia.nome_familia}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={vincularPessoaFamilia} disabled={!selectedPessoa || !selectedFamilia}>
              <Link className="h-4 w-4 mr-2" />
              Vincular
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pessoas com vínculos inconsistentes */}
      {pessoasComVinculosInconsistentes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <Users className="h-5 w-5" />
              Pessoas com Vínculos Inconsistentes ({pessoasComVinculosInconsistentes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pessoasComVinculosInconsistentes.map((pessoa) => (
                <div key={pessoa.id} className="flex items-center justify-between p-3 border rounded-lg bg-warning/5">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={pessoa.foto_url} alt={pessoa.nome_completo} />
                      <AvatarFallback className="bg-warning/10 text-warning">
                        {pessoa.nome_completo.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{pessoa.nome_completo}</p>
                      <p className="text-sm text-muted-foreground">
                        Vinculado à família: {pessoa.nome_familia}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => corrigirVinculoInconsistente(pessoa.id, pessoa.familia_id)}
                  >
                    Corrigir Vínculo
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de famílias */}
      <div className="space-y-4">
        {familias.length === 0 ? (
          <Card className="p-8 text-center">
            <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma família cadastrada</h3>
            <p className="text-muted-foreground mb-4">
              Comece criando uma nova família para organizar os membros
            </p>
          </Card>
        ) : (
          familias
            .filter(familia => 
              familia.nome_familia.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((familia) => (
              <FamiliaCard
                key={familia.id}
                familia={familia}
                onDesvincular={desvincularPessoa}
                onGerenciarParentescos={(pessoaId, nomePessoa, familiaId) => 
                  setParentescosModal({
                    isOpen: true,
                    pessoaId,
                    nomePessoa,
                    familiaId
                  })
                }
              />
            ))
        )}
      </div>

      {/* Pessoas sem família */}
      {pessoasSemFamilia.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Pessoas sem Família ({pessoasSemFamilia.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {pessoasSemFamilia.map((pessoa) => (
                <div key={pessoa.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={pessoa.foto_url} alt={pessoa.nome_completo} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {pessoa.nome_completo.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{pessoa.nome_completo}</p>
                    <p className="text-xs text-muted-foreground truncate">{pessoa.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal para gerenciar parentescos */}
      <Dialog open={parentescosModal.isOpen} onOpenChange={(open) => 
        setParentescosModal(prev => ({ ...prev, isOpen: open }))
      }>
        <DialogContent className="max-w-5xl">
          {parentescosModal.isOpen && (
            <GerenciarParentescos
              pessoaId={parentescosModal.pessoaId}
              nomePessoa={parentescosModal.nomePessoa}
              familiaId={parentescosModal.familiaId}
              onClose={() => setParentescosModal(prev => ({ ...prev, isOpen: false }))}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Componente para card da família
interface FamiliaCardProps {
  familia: Familia;
  onDesvincular: (pessoaId: string) => void;
  onGerenciarParentescos: (pessoaId: string, nomePessoa: string, familiaId: string) => void;
}

const FamiliaCard: React.FC<FamiliaCardProps> = ({ familia, onDesvincular, onGerenciarParentescos }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            {familia.nome_familia}
          </CardTitle>
          <Badge variant="outline">
            {familia.membros.length} membro{familia.membros.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {familia.endereco && (
            <p className="text-sm text-muted-foreground">{familia.endereco}</p>
          )}
          
          <div className="grid gap-3">
            {familia.membros.map((membro) => (
              <div key={membro.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={membro.foto_url} alt={membro.nome_completo} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {membro.nome_completo.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{membro.nome_completo}</p>
                    <p className="text-sm text-muted-foreground">{membro.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onGerenciarParentescos(membro.id, membro.nome_completo, familia.id)}
                    title="Gerenciar Parentescos"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDesvincular(membro.id)}
                    className="text-destructive hover:text-destructive"
                    title="Desvincular da família"
                  >
                    <Unlink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Formulário para nova família
interface NovaFamiliaFormProps {
  pessoasSemFamilia: Pessoa[];
  onSubmit: (nomeFamilia: string, pessoaId: string) => void;
}

const NovaFamiliaForm: React.FC<NovaFamiliaFormProps> = ({ pessoasSemFamilia, onSubmit }) => {
  const [nomeFamilia, setNomeFamilia] = useState('');
  const [pessoaId, setPessoaId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nomeFamilia && pessoaId) {
      onSubmit(nomeFamilia, pessoaId);
      setNomeFamilia('');
      setPessoaId('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Nome da Família</label>
        <Input
          value={nomeFamilia}
          onChange={(e) => setNomeFamilia(e.target.value)}
          placeholder="Digite o nome da família"
          required
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Primeiro Membro</label>
        <Select value={pessoaId} onValueChange={setPessoaId} required>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma pessoa" />
          </SelectTrigger>
          <SelectContent>
            {pessoasSemFamilia.map((pessoa) => (
              <SelectItem key={pessoa.id} value={pessoa.id}>
                {pessoa.nome_completo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Criar Família
      </Button>
    </form>
  );
};

export default GestaoFamilias;