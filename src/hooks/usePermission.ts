import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PermissionParams = {
  action: string;
  subject: string;
  resourceType?: string | null;
};

export function usePermission({ action, subject, resourceType = null }: PermissionParams) {
  return useQuery({
    queryKey: ["permission", action, subject, resourceType],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("user_has_permission", {
        action_name: action,
        subject_name: subject,
        resource_type_param: resourceType,
      });
      if (error) throw error;
      return Boolean(data);
    },
    staleTime: 60_000,
  });
}

export async function userCan(action: string, subject: string, resourceType?: string | null) {
  const { data, error } = await supabase.rpc("user_has_permission", {
    action_name: action,
    subject_name: subject,
    resource_type_param: resourceType ?? null,
  });
  if (error) return false;
  return Boolean(data);
}
