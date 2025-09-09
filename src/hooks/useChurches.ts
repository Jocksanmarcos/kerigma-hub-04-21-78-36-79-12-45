import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Church {
  id: string;
  name: string;
  type: 'sede' | 'missao';
  address?: string;
  cnpj?: string;
  parent_church_id?: string;
  pastor_responsavel?: string;
  data_fundacao?: string;
  email?: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserChurchRole {
  id: string;
  user_id: string;
  church_id: string;
  role: 'super_admin' | 'pastor' | 'tesoureiro' | 'lider_celula' | 'secretario' | 'membro';
  active: boolean;
  church?: Church;
}

export const useChurches = () => {
  return useQuery({
    queryKey: ["churches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("igrejas")
        .select(`
          id,
          nome,
          tipo,
          cidade,
          estado,
          email,
          telefone,
          pastor_responsavel,
          ativa,
          created_at,
          updated_at
        `)
        .eq("ativa", true)
        .order("nome");

      if (error) throw error;
      
      return data.map(igreja => ({
        id: igreja.id,
        name: igreja.nome,
        type: igreja.tipo as 'sede' | 'missao',
        cidade: igreja.cidade,
        estado: igreja.estado,
        email: igreja.email,
        telefone: igreja.telefone,
        pastor_responsavel: igreja.pastor_responsavel,
        ativa: igreja.ativa,
        created_at: igreja.created_at,
        updated_at: igreja.updated_at
      })) as Church[];
    },
  });
};

export const useUserChurchRoles = () => {
  return useQuery({
    queryKey: ["user-church-roles"],
    queryFn: async () => {
      const { data: roles, error } = await supabase
        .from("user_church_roles")
        .select("*")
        .eq("active", true);

      if (error) throw error;
      
      // If we have roles, fetch the church details separately
      if (roles && roles.length > 0) {
        const churchIds = [...new Set(roles.map(role => role.church_id))];
        
        const { data: churches, error: churchError } = await supabase
          .from("igrejas")
          .select(`
            id,
            nome,
            tipo,
            cidade,
            estado,
            ativa,
            created_at,
            updated_at
          `)
          .in("id", churchIds);

        if (churchError) throw churchError;

        // Map churches by id for quick lookup
        const churchMap = new Map(
          churches?.map(church => [
            church.id, 
            {
              id: church.id,
              name: church.nome,
              type: church.tipo as 'sede' | 'missao',
              cidade: church.cidade,
              estado: church.estado,
              ativa: church.ativa,
              created_at: church.created_at,
              updated_at: church.updated_at,
            }
          ]) || []
        );

        // Combine roles with their corresponding churches
        return roles.map(role => ({
          ...role,
          church: churchMap.get(role.church_id)
        })) as UserChurchRole[];
      }

      return roles as UserChurchRole[];
    },
  });
};

export const useUserChurch = () => {
  return useQuery({
    queryKey: ["user-church"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_user_church_id");
      if (error) throw error;
      
      if (!data) return null;
      
      const { data: church, error: churchError } = await supabase
        .from("igrejas")
        .select(`
          id,
          nome,
          tipo,
          endereco,
          email,
          telefone,
          cidade,
          estado,
          pastor_responsavel,
          data_fundacao,
          ativa,
          created_at,
          updated_at
        `)
        .eq("id", data)
        .single();
        
      if (churchError) throw churchError;
      
      return {
        id: church.id,
        name: church.nome,
        type: church.tipo as 'sede' | 'missao',
        address: church.endereco,
        cnpj: undefined, // This field doesn't exist in the igrejas table yet
        parent_church_id: undefined, // This field doesn't exist in the igrejas table yet
        pastor_responsavel: church.pastor_responsavel,
        data_fundacao: church.data_fundacao,
        email: church.email,
        telefone: church.telefone,
        cidade: church.cidade,
        estado: church.estado,
        ativa: church.ativa,
        created_at: church.created_at,
        updated_at: church.updated_at
      } as Church;
    },
  });
};

export const useIsSuperAdmin = () => {
  return useQuery({
    queryKey: ["is-super-admin"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("is_super_admin");
      if (error) throw error;
      return Boolean(data);
    },
  });
};

export const useCreateChurch = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (churchData: Omit<Church, 'id' | 'created_at' | 'updated_at'>) => {
      const insertData = {
        nome: churchData.name,
        tipo: churchData.type,
        cidade: churchData.cidade,
        estado: churchData.estado,
        endereco: churchData.address,
        email: churchData.email,
        telefone: churchData.telefone,
        pastor_responsavel: churchData.pastor_responsavel,
        parent_church_id: churchData.parent_church_id,
        ativa: churchData.ativa,
        data_fundacao: churchData.data_fundacao,
      };

      const { data, error } = await supabase
        .from("igrejas")
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["churches"] });
      toast({
        title: "Igreja criada",
        description: "Nova igreja foi criada com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar igreja",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateChurch = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Church> }) => {
      const updateData: any = {};
      
      if (updates.name) updateData.nome = updates.name;
      if (updates.type) updateData.tipo = updates.type;
      if (updates.cidade !== undefined) updateData.cidade = updates.cidade;
      if (updates.estado !== undefined) updateData.estado = updates.estado;
      if (updates.address !== undefined) updateData.endereco = updates.address;
      if (updates.email !== undefined) updateData.email = updates.email;
      if (updates.telefone !== undefined) updateData.telefone = updates.telefone;
      if (updates.pastor_responsavel !== undefined) updateData.pastor_responsavel = updates.pastor_responsavel;
      if (updates.parent_church_id !== undefined) updateData.parent_church_id = updates.parent_church_id;
      if (updates.ativa !== undefined) updateData.ativa = updates.ativa;
      if (updates.data_fundacao !== undefined) updateData.data_fundacao = updates.data_fundacao;

      const { data, error } = await supabase
        .from("igrejas")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["churches"] });
      toast({
        title: "Igreja atualizada",
        description: "Igreja foi atualizada com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar igreja",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useAssignUserToChurch = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      userId,
      churchId,
      role,
    }: {
      userId: string;
      churchId: string;
      role: UserChurchRole['role'];
    }) => {
      const { data, error } = await supabase
        .from("user_church_roles")
        .insert([{
          user_id: userId,
          church_id: churchId,
          role,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-church-roles"] });
      toast({
        title: "Usuário atribuído",
        description: "Usuário foi atribuído à igreja com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atribuir usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};