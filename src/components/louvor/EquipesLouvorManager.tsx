import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Users, Settings, User, Trash2, UserPlus, Edit } from 'lucide-react';
import { useLouvorCargos } from '@/hooks/useLouvorCargos';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export function EquipesLouvorManager() {
  const {
    cargos,
    membrosCargos,
    loadingCargos,
    loadingMembrosCargos,
    createCargo,
    updateCargo,
    associarMembroCargo,
    removerMembroCargo,
    creatingCargo,
    associandoMembro,
    removendoMembro,
  } = useLouvorCargos();

  // Query para buscar pessoas ativas
  const { data: pessoasAtivas, isLoading: loadingPessoas } = useQuery({
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

  const [isCargoDialogOpen, setIsCargoDialogOpen] = useState(false);
  const [isMembroDialogOpen, setIsMembroDialogOpen] = useState(false);
  const [editingCargo, setEditingCargo] = useState<any>(null);
  
  const [cargoFormData, setCargoFormData] = useState({
    nome_cargo: '',
    descricao: '',
    cor: '#3b82f6',
    ativo: true,
  });

  const [membroFormData, setMembroFormData] = useState({
    membro_id: '',
    cargo_id: '',
    nivel_habilidade: 'iniciante' as 'iniciante' | 'intermediario' | 'avancado',
  });

  const resetCargoForm = () => {
    setCargoFormData({
      nome_cargo: '',
      descricao: '',
      cor: '#3b82f6',
      ativo: true,
    });
    setEditingCargo(null);
  };

  const resetMembroForm = () => {
    setMembroFormData({
      membro_id: '',
      cargo_id: '',
      nivel_habilidade: 'iniciante',
    });
  };

  const handleCargoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCargo) {
        await updateCargo({ id: editingCargo.id, ...cargoFormData });
      } else {
        await createCargo(cargoFormData);
      }
      
      resetCargoForm();
      setIsCargoDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar cargo:', error);
    }
  };

  const handleMembroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await associarMembroCargo(membroFormData);
      resetMembroForm();
      setIsMembroDialogOpen(false);
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
    }
  };

  const handleRemoverMembro = async (membroId: string) => {
    try {
      await removerMembroCargo(membroId);
    } catch (error) {
      console.error('Erro ao remover membro:', error);
    }
  };

  const handleEditCargo = (cargo: any) => {
    setEditingCargo(cargo);
    setCargoFormData({
      nome_cargo: cargo.nome_cargo,
      descricao: cargo.descricao || '',
      cor: cargo.cor,
      ativo: cargo.ativo,
    });
    setIsCargoDialogOpen(true);
  };

  const getMembrosCount = (cargoId: string) => {
    return membrosCargos?.filter(mc => mc.cargo_id === cargoId)?.length || 0;
  };

  const getMembrosDisponiveis = () => {
    const membrosJaAssociados = new Set(membrosCargos?.map(mc => mc.membro_id) || []);
    return pessoasAtivas?.filter(pessoa => !membrosJaAssociados.has(pessoa.id)) || [];
  };

  const getNivelBadgeVariant = (nivel: string) => {
    switch (nivel) {
      case 'avancado': return 'default';
      case 'intermediario': return 'secondary'; 
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="cargos" className="space-y-6">
        <TabsList>
          <TabsTrigger value="cargos" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Cargos
          </TabsTrigger>
          <TabsTrigger value="membros" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Membros
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cargos" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Cargos de Louvor</h2>
            
            <Dialog open={isCargoDialogOpen} onOpenChange={setIsCargoDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetCargoForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Cargo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCargo ? 'Editar Cargo' : 'Novo Cargo'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCargo ? 'Edite as informações do cargo.' : 'Crie um novo cargo de louvor.'}
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleCargoSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="nome_cargo">Nome do Cargo *</Label>
                    <Input
                      id="nome_cargo"
                      value={cargoFormData.nome_cargo}
                      onChange={(e) => setCargoFormData(prev => ({ ...prev, nome_cargo: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={cargoFormData.descricao}
                      onChange={(e) => setCargoFormData(prev => ({ ...prev, descricao: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cor">Cor</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="cor"
                        type="color"
                        value={cargoFormData.cor}
                        onChange={(e) => setCargoFormData(prev => ({ ...prev, cor: e.target.value }))}
                        className="w-20 h-10"
                      />
                      <Input
                        value={cargoFormData.cor}
                        onChange={(e) => setCargoFormData(prev => ({ ...prev, cor: e.target.value }))}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsCargoDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={creatingCargo}>
                      {editingCargo ? 'Atualizar' : 'Criar'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loadingCargos ? (
            <div className="text-center py-8">Carregando cargos...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cargos?.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="text-center py-8">
                    <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhum cargo encontrado</p>
                  </CardContent>
                </Card>
              ) : (
                cargos?.map((cargo) => (
                  <Card key={cargo.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6" onClick={() => handleEditCargo(cargo)}>
                      <div className="flex items-center gap-3 mb-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: cargo.cor }}
                        />
                        <h3 className="font-semibold">{cargo.nome_cargo}</h3>
                      </div>
                      
                      {cargo.descricao && (
                        <p className="text-sm text-muted-foreground mb-3">{cargo.descricao}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {getMembrosCount(cargo.id)} membros
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="membros" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Membros da Equipe</h2>
            
            <Dialog open={isMembroDialogOpen} onOpenChange={setIsMembroDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetMembroForm} disabled={loadingPessoas || !cargos?.length}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar Membro
                </Button>
              </DialogTrigger>
              <DialogContent className="z-50 bg-white dark:bg-gray-800">
                <DialogHeader>
                  <DialogTitle>Adicionar Membro à Equipe</DialogTitle>
                  <DialogDescription>
                    Selecione uma pessoa e um cargo para adicionar à equipe de louvor.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleMembroSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="membro_id">Pessoa *</Label>
                    <Select value={membroFormData.membro_id} onValueChange={(value) => 
                      setMembroFormData(prev => ({ ...prev, membro_id: value }))
                    }>
                      <SelectTrigger className="bg-white dark:bg-gray-700">
                        <SelectValue placeholder="Selecione uma pessoa" />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600">
                        {getMembrosDisponiveis().map((pessoa) => (
                          <SelectItem key={pessoa.id} value={pessoa.id}>
                            {pessoa.nome_completo} ({pessoa.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="cargo_id">Cargo *</Label>
                    <Select value={membroFormData.cargo_id} onValueChange={(value) => 
                      setMembroFormData(prev => ({ ...prev, cargo_id: value }))
                    }>
                      <SelectTrigger className="bg-white dark:bg-gray-700">
                        <SelectValue placeholder="Selecione um cargo" />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600">
                        {cargos?.map((cargo) => (
                          <SelectItem key={cargo.id} value={cargo.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: cargo.cor }}
                              />
                              {cargo.nome_cargo}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="nivel_habilidade">Nível de Habilidade *</Label>
                    <Select value={membroFormData.nivel_habilidade} onValueChange={(value: any) => 
                      setMembroFormData(prev => ({ ...prev, nivel_habilidade: value }))
                    }>
                      <SelectTrigger className="bg-white dark:bg-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600">
                        <SelectItem value="iniciante">Iniciante</SelectItem>
                        <SelectItem value="intermediario">Intermediário</SelectItem>
                        <SelectItem value="avancado">Avançado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsMembroDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={associandoMembro || !membroFormData.membro_id || !membroFormData.cargo_id}>
                      {associandoMembro ? 'Adicionando...' : 'Adicionar'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loadingMembrosCargos || loadingPessoas ? (
            <div className="text-center py-8">Carregando membros...</div>
          ) : (
            <>
              {/* Organizar por cargo */}
              {cargos?.map((cargo) => {
                const membrosNesteCargo = membrosCargos?.filter(mc => mc.cargo_id === cargo.id) || [];
                
                if (membrosNesteCargo.length === 0) {
                  return null;
                }

                return (
                  <Card key={cargo.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: cargo.cor }}
                        />
                        {cargo.nome_cargo}
                        <Badge variant="secondary" className="ml-auto">
                          {membrosNesteCargo.length} {membrosNesteCargo.length === 1 ? 'membro' : 'membros'}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {membrosNesteCargo.map((membro) => (
                        <div key={membro.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium">{membro.pessoas?.nome_completo}</h4>
                              <p className="text-sm text-muted-foreground">{membro.pessoas?.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant={getNivelBadgeVariant(membro.nivel_habilidade)}>
                              {membro.nivel_habilidade}
                            </Badge>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remover membro</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja remover <strong>{membro.pessoas?.nome_completo}</strong> 
                                    do cargo de <strong>{cargo.nome_cargo}</strong>?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRemoverMembro(membro.id)}
                                    disabled={removendoMembro}
                                  >
                                    {removendoMembro ? 'Removendo...' : 'Remover'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}

              {/* Mensagem quando não há membros */}
              {membrosCargos?.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <UserPlus className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Nenhum membro na equipe</h3>
                    <p className="text-muted-foreground mb-4">
                      Comece adicionando pessoas aos cargos de louvor.
                    </p>
                    {cargos?.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Primeiro, crie alguns cargos na aba "Cargos".
                      </p>
                    ) : (
                      <Button onClick={() => setIsMembroDialogOpen(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Adicionar Primeiro Membro
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}