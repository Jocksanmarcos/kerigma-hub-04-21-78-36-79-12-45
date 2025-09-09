import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useNewUserRole } from "@/hooks/useNewRole";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [requiresChange, setRequiresChange] = useState<boolean>(false);
  const { data: userRole, isLoading: roleLoading } = useNewUserRole();

  useEffect(() => {
    // 1) Listen first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthed(!!session?.user);
      setRequiresChange(Boolean(session?.user?.user_metadata?.requires_password_change));
      setLoading(false);
    });

    // 2) Then check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthed(!!session?.user);
      setRequiresChange(Boolean(session?.user?.user_metadata?.requires_password_change));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading || roleLoading) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (!isAuthed) {
    return <Navigate to="/auth" replace />;
  }

  if (isAuthed && requiresChange && window.location.pathname !== "/force-password-change") {
    return <Navigate to="/force-password-change" replace />;
  }

  return <>{children}</>;
};
