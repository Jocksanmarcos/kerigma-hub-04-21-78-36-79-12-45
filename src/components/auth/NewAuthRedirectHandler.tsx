import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNewUserRole } from "@/hooks/useNewRole";
import { supabase } from "@/integrations/supabase/client";

const NewAuthRedirectHandler: React.FC = () => {
  const navigate = useNavigate();
  const { data: userRole } = useNewUserRole();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const userMetadata = session.user.user_metadata;
        const requiresPasswordChange = userMetadata?.requires_password_change;
        
        if (requiresPasswordChange) {
          navigate("/force-password-change", { replace: true });
          return;
        }

        // Redirect based on user role
        if (userRole === 'pastor') {
          navigate("/dashboard", { replace: true });
        } else if (userRole === 'lider') {
          navigate("/admin/celulas", { replace: true });
        } else if (userRole === 'membro') {
          navigate("/membro/dashboard", { replace: true });
        } else {
          // Default fallback
          navigate("/dashboard", { replace: true });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, userRole]);

  return null;
};

export default NewAuthRedirectHandler;