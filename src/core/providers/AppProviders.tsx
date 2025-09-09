import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { GlobalErrorBoundary } from "@/components/ui/global-error-boundary";
import { ChurchProvider } from "@/contexts/ChurchContext";
import { EditModeProvider } from "@/contexts/EditModeContext";

// Create a stable query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <GlobalErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ThemeProvider defaultTheme="light" storageKey="kerigma-theme">
              <ChurchProvider>
                <EditModeProvider>
                  {children}
                </EditModeProvider>
              </ChurchProvider>
              <Toaster />
            </ThemeProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </HelmetProvider>
    </GlobalErrorBoundary>
  );
};