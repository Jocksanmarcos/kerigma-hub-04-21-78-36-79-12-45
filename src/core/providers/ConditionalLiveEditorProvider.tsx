import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Lazy load LiveEditorProvider to avoid loading it for non-admin users
const LiveEditorProvider = React.lazy(() => 
  import("@/components/live-editor/LiveEditorProvider").then(module => ({
    default: module.LiveEditorProvider
  }))
);

interface ConditionalLiveEditorProviderProps {
  children: React.ReactNode;
}

/**
 * Conditional Live Editor Provider
 * 
 * Only loads the heavy LiveEditorProvider for authenticated admin users.
 * This prevents unnecessary resource loading for regular visitors.
 */
export const ConditionalLiveEditorProvider: React.FC<ConditionalLiveEditorProviderProps> = ({ 
  children 
}) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          if (mounted) {
            setIsAdmin(false);
            setIsLoading(false);
          }
          return;
        }

        const { data, error } = await supabase.rpc("is_admin");
        
        if (!error && mounted) {
          setIsAdmin(Boolean(data));
        } else if (mounted) {
          setIsAdmin(false);
        }
      } catch (error) {
        console.warn("Error checking admin status:", error);
        if (mounted) {
          setIsAdmin(false);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkAdminStatus();

    return () => {
      mounted = false;
    };
  }, []);

  // Show loading state while checking admin status
  if (isLoading) {
    return <>{children}</>;
  }

  // If user is admin, wrap with LiveEditorProvider
  if (isAdmin) {
    return (
      <React.Suspense fallback={<>{children}</>}>
        <LiveEditorProvider>
          {children}
        </LiveEditorProvider>
      </React.Suspense>
    );
  }

  // For non-admin users, return children directly (no live editor overhead)
  return <>{children}</>;
};