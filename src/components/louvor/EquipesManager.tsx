import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, User, UserX, Settings } from 'lucide-react';
import { useLouvorCargos, LouvorCargo } from '@/hooks/useLouvorCargos';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const EquipesManager: React.FC = () => {
  const {
    cargos,
    membrosCargos,
    loadingCargos,
    loadingMembrosCargos,
    createCargo,
    associarMembroCargo,
    removerMembroCargo,
    getMembrosDisponiveisPorCargo
  } = useLouvorCargos();

  const [dialogCargoOpen, setDialogCargoOpen] = useState(false);
  const [dialogMembroOpen, setDialogMembroOpen] = useState(false);
  const [cargoSelecionado, setCargoSelecionado] = useState<LouvorCargo | null>(null);
  
  const [formCargo, setFormCargo] = useState({
    nome_cargo: '',
    descricao: '',
    cor: '#3b82f6'
  });

  const [formMembro, setFormMembro] = useState({
    membro_id: '',
    cargo_id: '',
    nivel_habilidade: 'iniciante' as 'iniciante' | 'intermediario' | 'avancado'
  });

  // Buscar pessoas ativas para associar aos cargos
  const { data: pessoas } = useQuery({
    queryKey: ['pessoas-ativas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pessoas')
        .select('id, nome_completo, email')
        .eq('situacao', 'ativo')
        .order('nome_completo');

      if (error) throw error;
      return data;
    }
  });

  const handleCreateCargo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCargo({ ...formCargo, ativo: true });
      setFormCargo({ nome_cargo: '', descricao: '', cor: '#3b82f6' });
      setDialogCargoOpen(false);
    } catch (error) {
      console.error('Erro ao criar cargo:', error);
    }
  };

  const handleAssociarMembro = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await associarMembroCargo(formMembro);
      setFormMembro({ membro_id: '', cargo_id: '', nivel_habilidade: 'iniciante' });
      setDialogMembroOpen(false);
    } catch (error) {
      console.error('Erro ao associar membro:', error);
    }
  };

  const handleRemoverMembro = async (membroCargoId: string) => {
    if (confirm('Tem certeza que deseja remover este membro do cargo?')) {
      try {
        await removerMembroCargo(membroCargoId);
      } catch (error) {
        console.error('Erro ao remover membro:', error);
      }
    }
  };

  const getNivelBadgeVariant = (nivel: string) => {
    switch (nivel) {
      case 'avancado': return 'default';
      case 'intermediario': return 'secondary';
      default: return 'outline';
    }
  };

  if (loadingCargos || loadingMembrosCargos) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-2 text-muted-foreground">Carregando equipes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Equipes</h2>
          <p className="text-muted-foreground">Configure cargos e gerencie membros da equipe de louvor</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={dialogCargoOpen} onOpenChange={setDialogCargoOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Novo Cargo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Cargo</DialogTitle>
                <DialogDescription>
                  Defina um novo cargo para a equipe de louvor
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateCargo} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome_cargo">Nome do Cargo *</Label>
                  <Input
                    id="nome_cargo"
                    value={formCargo.nome_cargo}
                    onChange={(e) => setFormCargo({ ...formCargo, nome_cargo: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    value={formCargo.descricao}
                    onChange={(e) => setFormCargo({ ...formCargo, descricao: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cor">Cor</Label>
                  <Input
                    id="cor"
                    type="color"
                    value={formCargo.cor}
                    onChange={(e) => setFormCargo({ ...formCargo, cor: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogCargoOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Criar Cargo</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogMembroOpen} onOpenChange={setDialogMembroOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Membro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Membro à Equipe</DialogTitle>
                <DialogDescription>
                  Associe um membro a um cargo específico
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleAssociarMembro} className="space-y-4">
                <div className="space-y-2">
                  <Label>Pessoa *</Label>
                  <Select 
                    value={formMembro.membro_id} 
                    onValueChange={(value) => setFormMembro({ ...formMembro, membro_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma pessoa" />
                    </SelectTrigger>
                    <SelectContent>
                      {pessoas?.map(pessoa => (
                        <SelectItem key={pessoa.id} value={pessoa.id}>
                          {pessoa.nome_completo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Cargo *</Label>
                  <Select 
                    value={formMembro.cargo_id} 
                    onValueChange={(value) => setFormMembro({ ...formMembro, cargo_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      {cargos?.map(cargo => (
                        <SelectItem key={cargo.id} value={cargo.id}>
                          {cargo.nome_cargo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Nível de Habilidade *</Label>
                  <Select 
                    value={formMembro.nivel_habilidade} 
                    onValueChange={(value) => setFormMembro({ 
                      ...formMembro, 
                      nivel_habilidade: value as 'iniciante' | 'intermediario' | 'avancado' 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iniciante">Iniciante</SelectItem>
                      <SelectItem value="intermediario">Intermediário</SelectItem>
                      <SelectItem value="avancado">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogMembroOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Adicionar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lista de Cargos e Membros */}
      <div className="grid gap-6">
        {cargos?.map(cargo => {
          const membrosDesteCargo = getMembrosDisponiveisPorCargo(cargo.id);
          
          return (
            <Card key={cargo.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: cargo.cor }}
                    />
                    <div>
                      <CardTitle>{cargo.nome_cargo}</CardTitle>
                      {cargo.descricao && (
                        <CardDescription>{cargo.descricao}</CardDescription>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {membrosDesteCargo.length} membros
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                {membrosDesteCargo.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    <p>Nenhum membro neste cargo ainda</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {membrosDesteCargo.map(membro => (
                      <div key={membro.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{membro.pessoas?.nome_completo}</p>
                            <p className="text-sm text-muted-foreground">{membro.pessoas?.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant={getNivelBadgeVariant(membro.nivel_habilidade)}>
                            {membro.nivel_habilidade}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoverMembro(membro.id)}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};