import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfileEditorProps {
  profileId: string | null;
  onClose: () => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ profileId, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 1,
    active: true
  });
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar perfil existente
  const { data: profile } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: async () => {
      if (!profileId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*, profile_permissions(*)')
        .eq('id', profileId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!profileId
  });

  // Query para buscar todas as permissões
  const { data: permissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('subject', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Mutation para salvar perfil
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (profileId) {
        // Atualizar perfil existente
        const { error } = await supabase
          .from('profiles')
          .update(data)
          .eq('id', profileId);
        
        if (error) throw error;
        return profileId;
      } else {
        // Criar novo perfil
        const { data: newProfile, error } = await supabase
          .from('profiles')
          .insert(data)
          .select()
          .single();
        
        if (error) throw error;
        return newProfile.id;
      }
    },
    onSuccess: async (savedProfileId) => {
      // Atualizar permissões
      await updatePermissions(savedProfileId);
      toast({
        title: "Sucesso",
        description: `Perfil ${profileId ? 'atualizado' : 'criado'} com sucesso!`
      });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao salvar perfil. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  const updatePermissions = async (savedProfileId: string) => {
    // Remover permissões antigas
    await supabase
      .from('profile_permissions')
      .delete()
      .eq('profile_id', savedProfileId);

    // Adicionar novas permissões
    const newPermissions = Object.entries(selectedPermissions)
      .filter(([_, granted]) => granted)
      .map(([permissionId]) => ({
        profile_id: savedProfileId,
        permission_id: permissionId,
        granted: true
      }));

    if (newPermissions.length > 0) {
      await supabase
        .from('profile_permissions')
        .insert(newPermissions);
    }
  };

  // Carregar dados do perfil quando disponível
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        description: profile.description || '',
        level: profile.level,
        active: profile.active
      });

      // Carregar permissões existentes
      const existingPermissions: Record<string, boolean> = {};
      profile.profile_permissions?.forEach((pp: any) => {
        existingPermissions[pp.permission_id] = pp.granted;
      });
      setSelectedPermissions(existingPermissions);
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev => ({
      ...prev,
      [permissionId]: !prev[permissionId]
    }));
  };

  // Organizar permissões por subject
  const permissionsBySubject = (permissions?.reduce((acc, permission) => {
    if (!acc[permission.subject]) {
      acc[permission.subject] = [];
    }
    acc[permission.subject].push(permission);
    return acc;
  }, {} as Record<string, any[]>) ?? {}) as Record<string, any[]>;
  const tAction = (a: string) => ({
    read: 'Ler',
    create: 'Criar',
    update: 'Atualizar',
    delete: 'Excluir',
    manage: 'Gerenciar',
    perform: 'Executar',
  } as Record<string, string>)[a] || a;

  const tSubject = (s: string) => ({
    all: 'Tudo',
    celulas: 'Células',
    cursos: 'Cursos',
    financeiro: 'Financeiro',
    pessoas: 'Pessoas',
    eventos: 'Eventos',
    relatorios: 'Relatórios',
    ensino: 'Ensino',
    public_site: 'Site Público',
    event_check_in: 'Check-in de Evento',
    event_attendee_list: 'Lista de Participantes',
  } as Record<string, string>)[s] || s.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {profileId ? 'Editar Perfil' : 'Novo Perfil de Acesso'}
          </DialogTitle>
          <DialogDescription>
            Configure as informações básicas e permissões do perfil
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
              <TabsTrigger value="permissions">Permissões</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Perfil</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Líder de Célula"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Nível de Acesso</Label>
                  <Select 
                    value={formData.level.toString()}
                    onValueChange={(value) => setFormData({ ...formData, level: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Básico</SelectItem>
                      <SelectItem value="2">2 - Intermediário</SelectItem>
                      <SelectItem value="3">3 - Avançado</SelectItem>
                      <SelectItem value="4">4 - Sênior</SelectItem>
                      <SelectItem value="5">5 - Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva as responsabilidades deste perfil..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked as boolean })}
                />
                <Label htmlFor="active">Perfil ativo</Label>
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <div className="space-y-6">
                {Object.entries(permissionsBySubject).map(([subject, subjectPermissions]) => (
                  <Card key={subject}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{tSubject(subject)}</span>
                        <Badge variant="outline">
                          {subjectPermissions.filter(p => selectedPermissions[p.id]).length}/{subjectPermissions.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {subjectPermissions.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission.id}
                              checked={selectedPermissions[permission.id] || false}
                              onCheckedChange={() => togglePermission(permission.id)}
                            />
                            <Label htmlFor={permission.id} className="text-sm">
                              {tAction(permission.action)}
                              {permission.resource_type && (
                                <span className="text-muted-foreground"> ({permission.resource_type})</span>
                              )}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={saveMutation.isPending} className="bg-kerigma-gradient">
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isPending ? 'Salvando...' : 'Salvar Perfil'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};