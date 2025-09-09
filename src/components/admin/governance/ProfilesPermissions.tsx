import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Shield, 
  Settings, 
  Plus, 
  Edit2, 
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProfileEditor } from './ProfileEditor';
import { PermissionMatrix } from './PermissionMatrix';
import { ConditionalRulesEditor } from './ConditionalRulesEditor';

export const ProfilesPermissions: React.FC = () => {
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  // Query para buscar perfis
  const { data: profiles, refetch: refetchProfiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, profile_permissions(*, permissions(*))')
        .eq('active', true)
        .order('level', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Query para buscar permissões
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

  const getLevelBadge = (level: number) => {
    const variants = {
      1: { variant: 'secondary' as const, label: 'Básico' },
      2: { variant: 'default' as const, label: 'Intermediário' },
      3: { variant: 'default' as const, label: 'Avançado' },
      4: { variant: 'destructive' as const, label: 'Sênior' },
      5: { variant: 'destructive' as const, label: 'Administrador' }
    };
    
    const config = variants[level as keyof typeof variants] || variants[1];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Perfis & Permissões</h2>
          <p className="text-muted-foreground">Gerencie perfis de acesso e suas permissões (RBAC + ABAC)</p>
        </div>
        <Button onClick={() => setShowProfileEditor(true)} className="bg-kerigma-gradient">
          <Plus className="h-4 w-4 mr-2" />
          Novo Perfil
        </Button>
      </div>

      <Tabs defaultValue="profiles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profiles">Lista de Perfis</TabsTrigger>
          <TabsTrigger value="matrix">Matriz de Permissões</TabsTrigger>
          <TabsTrigger value="rules">Regras Condicionais (ABAC)</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles?.map((profile) => (
              <Card key={profile.id} className="hover:shadow-kerigma transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>{profile.name}</span>
                    </CardTitle>
                    {getLevelBadge(profile.level)}
                  </div>
                  <CardDescription>{profile.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Estatísticas do perfil */}
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {profile.profile_permissions?.length || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Permissões</div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-secondary">0</div>
                        <div className="text-xs text-muted-foreground">Usuários</div>
                      </div>
                    </div>

                    {/* Permissões principais */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Principais Permissões:</h4>
                      <div className="space-y-1">
                        {profile.profile_permissions?.slice(0, 3).map((pp: any) => (
                          <div key={pp.id} className="flex items-center space-x-2 text-sm">
                            {pp.granted ? 
                              <CheckCircle className="h-3 w-3 text-green-600" /> : 
                              <XCircle className="h-3 w-3 text-red-600" />
                            }
                            <span className="text-muted-foreground">
                              {({read:'Ler',create:'Criar',update:'Atualizar',delete:'Excluir',manage:'Gerenciar',perform:'Executar'} as Record<string,string>)[pp.permissions?.action] ?? pp.permissions?.action}
                              {" "}
                              {({all:'Tudo',celulas:'Células',cursos:'Cursos',financeiro:'Financeiro',pessoas:'Pessoas',eventos:'Eventos',relatorios:'Relatórios',ensino:'Ensino',public_site:'Site Público',event_check_in:'Check-in de Evento',event_attendee_list:'Lista de Participantes'} as Record<string,string>)[pp.permissions?.subject] ?? String(pp.permissions?.subject).replace(/_/g,' ')}
                            </span>
                          </div>
                        ))}
                        {profile.profile_permissions && profile.profile_permissions.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{profile.profile_permissions.length - 3} mais...
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProfile(profile.id);
                          setShowProfileEditor(true);
                        }}
                        className="flex-1"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProfile(profile.id);
                          setShowProfileEditor(true);
                        }}
                        className="flex-1"
                      >
                        <Edit2 className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="matrix" className="space-y-6">
          <PermissionMatrix profiles={profiles || []} permissions={permissions || []} />
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <ConditionalRulesEditor />
        </TabsContent>
      </Tabs>

      {showProfileEditor && (
        <ProfileEditor
          profileId={selectedProfile}
          onClose={() => {
            setShowProfileEditor(false);
            setSelectedProfile(null);
            refetchProfiles();
          }}
        />
      )}
    </div>
  );
};