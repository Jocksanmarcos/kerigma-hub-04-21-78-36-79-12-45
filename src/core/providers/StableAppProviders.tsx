import React, { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { GlobalErrorBoundary } from "@/components/ui/global-error-boundary";

// Create a stable query client instance - NO re-creation on renders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes para reduzir requisições
      gcTime: 15 * 60 * 1000, // 15 minutes cache (antes cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Evitar re-fetch desnecessário
    },
    mutations: {
      retry: 1,
    },
  },
});

interface StableAppProvidersProps {
  children: React.ReactNode;
}

/**
 * Stable App Providers - Reconstrução arquitetural
 * 
 * Esta versão elimina loops de renderização garantindo que:
 * 1. QueryClient é criado UMA única vez
 * 2. Providers são inicializados de forma estável
 * 3. LiveEditor é carregado condicionalmente
 */
export const StableAppProviders: React.FC<StableAppProvidersProps> = ({ children }) => {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider defaultTheme="light" storageKey="kerigma-theme">
            <Suspense fallback={
              <div className="flex h-screen w-full items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            }>
              {children}
            </Suspense>
            <Toaster />
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
};