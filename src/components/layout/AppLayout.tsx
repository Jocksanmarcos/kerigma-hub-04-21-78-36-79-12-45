
import React, { useEffect } from 'react';
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ChatbotButton } from "@/components/chatbot/ChatbotButton";
import { FeedbackButton } from "@/components/feedback/FeedbackButton";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ImpersonationBanner } from "@/components/admin/ImpersonationBanner";
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Toaster } from '@/components/ui/toaster';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isOnline, hasPendingActions } = useOfflineSync();

  // Add visual indicator for offline state
  useEffect(() => {
    if (!isOnline) {
      document.body.classList.add('offline-mode');
    } else {
      document.body.classList.remove('offline-mode');
    }
  }, [isOnline]);

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full overflow-x-hidden">
        {/* Offline indicator */}
        {!isOnline && (
          <div className="fixed top-0 left-0 right-0 bg-destructive text-destructive-foreground px-4 py-2 text-center text-sm z-50">
            🌐 Modo offline - {hasPendingActions ? 'Dados serão sincronizados quando voltar online' : 'Sem conexão'}
          </div>
        )}
        
        {/* Sidebar */}
        <Sidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className={`flex-1 p-4 md:p-6 min-w-0 ${!isOnline ? 'pt-14' : ''}`}>
            <ImpersonationBanner />
            <div className="w-full overflow-x-hidden">
              {children}
            </div>
          </main>
        </div>
        
        {/* Chatbot flutuante */}
        <ChatbotButton />
        
        {/* Feedback flutuante */}
        <div className="fixed bottom-6 left-6 z-40">
          <FeedbackButton variant="floating" />
        </div>
        
        <Toaster />
      </div>
    </SidebarProvider>
  );
};
