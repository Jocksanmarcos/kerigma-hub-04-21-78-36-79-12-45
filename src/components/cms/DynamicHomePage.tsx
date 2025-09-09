import React, { useEffect } from "react";
import PublicSiteLayout from "@/components/layout/PublicSiteLayout";
import { DynamicSectionRenderer } from "./DynamicSectionRenderer";
import { PersonalizedWelcomeModal } from "@/components/homepage/PersonalizedWelcomeModal";
import { usePersonalizedWelcome } from "@/hooks/usePersonalizedWelcome";
import { useHomePageContent } from "@/hooks/useHomePageContent";
import { PageLoader } from "@/components/performance/PageLoader";
import InspiringDigitalJourneyHomePage from "@/pages/public/InspiringDigitalJourneyHomePage";
import { EditModeProvider } from "@/contexts/EditModeContext";
import { EditModeToggle } from "@/components/live-editor/EditModeToggle";
import { ContentEditModal } from "@/components/live-editor/ContentEditModal";

const DynamicHomePage: React.FC = () => {
  const { isFirstTime, showWelcomeModal, handleWelcomeResponse, closeWelcomeModal } = usePersonalizedWelcome();
  const { paginaHomeData, loading, error } = useHomePageContent();

  useEffect(() => {
    document.title = "Igreja em Células - Encontre o seu Lugar";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    const description = 'Uma igreja onde cada pessoa é valorizada e encontra sua família em Cristo';
    
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }
  }, []);

  // Loading state
  if (loading) {
    return <PageLoader />;
  }

  // Error state - fallback para página estática
  if (error) {
    console.log('Erro ao carregar CMS, usando layout estático:', error);
    return <InspiringDigitalJourneyHomePage />;
  }

  // Se não há dados do CMS, usar página estática como fallback
  if (!paginaHomeData || !paginaHomeData.secoes_pagina.length) {
    console.log('Dados CMS não encontrados, usando layout estático');
    return <InspiringDigitalJourneyHomePage />;
  }

  // Renderização dinâmica baseada nos dados do CMS
  return (
    <EditModeProvider>
      <PublicSiteLayout>
        {paginaHomeData.secoes_pagina.map((secao) => (
          <DynamicSectionRenderer 
            key={secao.id} 
            secao={secao} 
            isFirstTime={isFirstTime}
          />
        ))}
        
        <PersonalizedWelcomeModal 
          isOpen={showWelcomeModal}
          onResponse={handleWelcomeResponse}
          onClose={closeWelcomeModal}
        />
        
        <EditModeToggle />
        <ContentEditModal />
      </PublicSiteLayout>
    </EditModeProvider>
  );
};

export default DynamicHomePage;