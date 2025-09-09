import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// Lazy load ONLY when absolutely necessary
const LiveEditorProvider = React.lazy(() => 
  import("@/components/live-editor/LiveEditorProvider").then(module => ({
    default: module.LiveEditorProvider
  }))
);

const MasterLiveEditor = React.lazy(() => import("@/components/live-editor/MasterLiveEditor"));

interface MinimalLiveEditorProviderProps {
  children: React.ReactNode;
}

/**
 * Minimal Live Editor Provider - Loads ONLY for authenticated admins
 * 
 * Stability principles:
 * 1. Single admin check with timeout
 * 2. No re-checks or loops
 * 3. Lazy loading to prevent bundle bloat
 * 4. Fail-safe fallback
 */
export const MinimalLiveEditorProvider: React.FC<MinimalLiveEditorProviderProps> = ({ 
  children 
}) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkComplete, setCheckComplete] = useState(false);

  const checkAdminOnce = useCallback(async () => {
    let timeoutId: NodeJS.Timeout;
    
    try {
      // Set timeout to prevent hanging
      timeoutId = setTimeout(() => {
        setIsAdmin(false);
        setCheckComplete(true);
      }, 3000);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        clearTimeout(timeoutId);
        setIsAdmin(false);
        setCheckComplete(true);
        return;
      }

      const { data, error } = await supabase.rpc("is_admin");
      
      clearTimeout(timeoutId);
      
      if (!error) {
        setIsAdmin(Boolean(data));
      } else {
        setIsAdmin(false);
      }
      setCheckComplete(true);
    } catch (error) {
      clearTimeout(timeoutId);
      console.warn("Admin check failed:", error);
      setIsAdmin(false);
      setCheckComplete(true);
    }
  }, []);

  useEffect(() => {
    checkAdminOnce();
  }, []); // Run ONLY once

  // Show children immediately while checking
  if (!checkComplete) {
    return <>{children}</>;
  }

  // If admin, wrap with LiveEditor
  if (isAdmin) {
    return (
      <React.Suspense fallback={<>{children}</>}>
        <LiveEditorProvider>
          {children}
          <React.Suspense fallback={null}>
            <MasterLiveEditor />
          </React.Suspense>
        </LiveEditorProvider>
      </React.Suspense>
    );
  }

  // Non-admin users get direct children
  return <>{children}</>;
};