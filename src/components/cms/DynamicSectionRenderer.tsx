import React from 'react';
import { SecaoPagina } from '@/hooks/useHomePageContent';
import { HeroSection } from '@/components/homepage/HeroSection';
import { EnhancedWelcomeSection } from '@/components/homepage/EnhancedWelcomeSection';
import { FluidSermonsSection } from '@/components/homepage/FluidSermonsSection';
import { DynamicEventsSection } from '@/components/homepage/DynamicEventsSection';
import { DynamicCoursesSection } from '@/components/homepage/DynamicCoursesSection';
import { CommunitySection } from '@/components/homepage/CommunitySection';
import { EditableContentBlock } from '@/components/live-editor/EditableContentBlock';

interface DynamicSectionRendererProps {
  secao: SecaoPagina;
  isFirstTime?: boolean;
}

export const DynamicSectionRenderer: React.FC<DynamicSectionRendererProps> = ({ 
  secao, 
  isFirstTime = false 
}) => {
  // Renderização condicional baseada no tipo de seção
  switch (secao.tipo_secao) {
    case 'hero-banner':
      return <HeroSection />;
      
    case 'welcome-section':
      return <EnhancedWelcomeSection isFirstTime={isFirstTime} />;
      
    case 'sermons-section':
      return <FluidSermonsSection />;
      
    case 'events-section':
      return <DynamicEventsSection />;
      
    case 'courses-section':
      return <DynamicCoursesSection />;
      
    case 'community-section':
      return <CommunitySection />;
      
    case 'cta-section':
      return (
        <section className="py-16 bg-gradient-to-r from-primary to-secondary">
          <div className="container mx-auto px-4">
            {secao.blocos_conteudo.map((bloco) => (
              <EditableContentBlock key={bloco.id} bloco={bloco} />
            ))}
          </div>
        </section>
      );
      
    case 'text-section':
      return (
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            {secao.blocos_conteudo.map((bloco) => (
              <EditableContentBlock key={bloco.id} bloco={bloco} />
            ))}
          </div>
        </section>
      );
      
    case 'image-text-section':
      return (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {secao.blocos_conteudo.map((bloco) => (
                <EditableContentBlock key={bloco.id} bloco={bloco} />
              ))}
            </div>
          </div>
        </section>
      );
      
    default:
      // Seção genérica - renderiza blocos em sequência
      return (
        <section className="py-12">
          <div className="container mx-auto px-4">
            {secao.blocos_conteudo.map((bloco) => (
              <EditableContentBlock key={bloco.id} bloco={bloco} />
            ))}
          </div>
        </section>
      );
  }
};