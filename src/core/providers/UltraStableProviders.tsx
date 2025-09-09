import React, { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { GlobalErrorBoundary } from "@/components/ui/global-error-boundary";
import { ChurchProvider } from "@/contexts/ChurchContext";
import { HelmetProvider } from "react-helmet-async";

// Create SINGLE stable query client instance - NEVER recreated
const stableQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

interface UltraStableProvidersProps {
  children: React.ReactNode;
}

/**
 * Ultra Stable Providers - Eliminates ALL rendering loops
 * 
 * Architecture principles:
 * 1. Single QueryClient instance created at module level
 * 2. No dynamic provider creation or recreation
 * 3. Minimal suspense boundaries
 * 4. Error boundaries at the top level
 */
export const UltraStableProviders: React.FC<UltraStableProvidersProps> = ({ children }) => {
  return (
    <GlobalErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={stableQueryClient}>
          <BrowserRouter>
            <ThemeProvider defaultTheme="light" storageKey="kerigma-theme">
              <ChurchProvider>
                <Suspense fallback={
                  <div className="flex h-screen w-full items-center justify-center bg-background">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                  </div>
                }>
                  {children}
                </Suspense>
              </ChurchProvider>
              <Toaster />
            </ThemeProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </HelmetProvider>
    </GlobalErrorBoundary>
  );
};