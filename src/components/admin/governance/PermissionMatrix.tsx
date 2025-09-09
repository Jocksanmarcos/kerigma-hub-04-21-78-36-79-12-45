import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PermissionMatrixProps {
  profiles: any[];
  permissions: any[];
}

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({ profiles, permissions }) => {
  // Organizar permissões por subject
  const permissionsBySubject = permissions.reduce((acc, permission) => {
    if (!acc[permission.subject]) {
      acc[permission.subject] = [];
    }
    acc[permission.subject].push(permission);
    return acc;
  }, {} as Record<string, any[]>);

  // Helper: obter registro atual de permissão (se existir)
  const hasPermission = (profile: any, permissionId: string) => {
    if (!profile.profile_permissions) return null;
    return profile.profile_permissions.find((pp: any) => pp.permission_id === permissionId) || null;
  };

  const getPermissionIcon = (profile: any, permissionId: string) => {
    const permission = hasPermission(profile, permissionId);
    if (!permission) {
      return <MinusCircle className="h-4 w-4 text-muted-foreground" />;
    }
    return permission.granted ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const queryClient = useQueryClient();
  const togglePermissionMutation = useMutation({
    mutationFn: async ({ profileId, permissionId, current }: { profileId: string; permissionId: string; current: any | null }) => {
      if (!current) {
        const { error } = await supabase.from('profile_permissions').insert({
          profile_id: profileId,
          permission_id: permissionId,
          granted: true,
        });
        if (error) throw error;
        return;
      }
      if (current.granted) {
        const { error } = await supabase
          .from('profile_permissions')
          .update({ granted: false })
          .eq('id', current.id);
        if (error) throw error;
        return;
      }
      // If was explicitly denied, remove to go back to "not configured"
      const { error } = await supabase
        .from('profile_permissions')
        .delete()
        .eq('id', current.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Matriz de Permissões RBAC</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {Object.entries(permissionsBySubject).map(([subject, subjectPermissions]) => (
            <div key={subject} className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-sm font-medium">
                  {({all:'Tudo',celulas:'Células',cursos:'Cursos',financeiro:'Financeiro',pessoas:'Pessoas',eventos:'Eventos',relatorios:'Relatórios',ensino:'Ensino',public_site:'Site Público',event_check_in:'Check-in de Evento',event_attendee_list:'Lista de Participantes'} as Record<string,string>)[subject] ?? subject}
                </Badge>
                <div className="h-px bg-border flex-1" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Ação</th>
                      {profiles.map((profile) => (
                        <th key={profile.id} className="text-center p-2 font-medium min-w-[120px]">
                          <div className="space-y-1">
                            <div className="text-sm">{profile.name}</div>
                            <Badge 
                              variant={profile.level >= 4 ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              Nível {profile.level}
                            </Badge>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(subjectPermissions as any[]).map((permission) => (
                      <tr key={permission.id} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          <div className="space-y-1">
                            <div className="font-medium">{({read:'Ler',create:'Criar',update:'Atualizar',delete:'Excluir',manage:'Gerenciar',perform:'Executar'} as Record<string,string>)[permission.action] ?? permission.action}</div>
                            {permission.resource_type && (
                              <div className="text-xs text-muted-foreground">
                                {permission.resource_type}
                              </div>
                            )}
                          </div>
                        </td>
                        {profiles.map((profile) => (
                          <td key={profile.id} className="p-2 text-center">
                          <button
                                type="button"
                                className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-muted transition"
                                onClick={() =>
                                  togglePermissionMutation.mutate({
                                    profileId: profile.id,
                                    permissionId: permission.id,
                                    current: hasPermission(profile, permission.id),
                                  })
                                }
                                aria-label="Alternar permissão"
                                disabled={togglePermissionMutation.isPending}
                              >
                                {getPermissionIcon(profile, permission.id)}
                              </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Legenda */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-medium mb-3">Legenda:</h4>
          <div className="flex space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Permissão concedida</span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span>Permissão negada</span>
            </div>
            <div className="flex items-center space-x-2">
              <MinusCircle className="h-4 w-4 text-muted-foreground" />
              <span>Não configurada</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};