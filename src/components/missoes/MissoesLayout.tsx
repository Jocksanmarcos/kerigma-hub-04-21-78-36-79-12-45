import React, { Suspense } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { MissoesSidebar } from './MissoesSidebar';
import { MissoesHeader } from './MissoesHeader';
import { PageLoader } from '@/components/performance/PageLoader';

interface MissoesLayoutProps {
  children: React.ReactNode;
}

export const MissoesLayout: React.FC<MissoesLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-muted/40">
        <MissoesSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <MissoesHeader />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            <Suspense fallback={<PageLoader type="minimal" />}>
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};