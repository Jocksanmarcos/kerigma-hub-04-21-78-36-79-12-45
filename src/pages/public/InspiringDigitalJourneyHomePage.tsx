import React, { useEffect } from "react";
import PublicSiteLayout from "@/components/layout/PublicSiteLayout";
import { HeroSection } from "@/components/homepage/HeroSection";
import { EnhancedWelcomeSection } from "@/components/homepage/EnhancedWelcomeSection";
import { FluidSermonsSection } from "@/components/homepage/FluidSermonsSection";
import { DynamicEventsSection } from "@/components/homepage/DynamicEventsSection";
import { DynamicCoursesSection } from "@/components/homepage/DynamicCoursesSection";
import { CommunitySection } from "@/components/homepage/CommunitySection";
import { PersonalizedWelcomeModal } from "@/components/homepage/PersonalizedWelcomeModal";
import { usePersonalizedWelcome } from "@/hooks/usePersonalizedWelcome";

const InspiringDigitalJourneyHomePage: React.FC = () => {
  const { isFirstTime, showWelcomeModal, handleWelcomeResponse, closeWelcomeModal } = usePersonalizedWelcome();

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

  return (
    <PublicSiteLayout>
      <HeroSection />
      <EnhancedWelcomeSection isFirstTime={isFirstTime} />
      <FluidSermonsSection />
      <DynamicEventsSection />
      <DynamicCoursesSection />
      <CommunitySection />
      <PersonalizedWelcomeModal 
        isOpen={showWelcomeModal}
        onResponse={handleWelcomeResponse}
        onClose={closeWelcomeModal}
      />
    </PublicSiteLayout>
  );
};

export default InspiringDigitalJourneyHomePage;