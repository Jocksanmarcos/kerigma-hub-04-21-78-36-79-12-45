import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { EditableComponentWrapper } from "@/components/live-editor/EditableComponentWrapper";
import { RichTextEditor } from "@/components/live-editor/RichTextEditor";
import { EditableButton } from "./EditableButton";

interface HeroImmersiveProps {
  title: React.ReactNode;
  subtitle?: string;
  description?: string;
  backgroundImage: string;
  primaryCta: { label: string; to: string };
  secondaryCta?: { label: string; to: string };
}

export const HeroImmersive: React.FC<HeroImmersiveProps> = ({
  title,
  subtitle,
  description,
  backgroundImage,
  primaryCta,
  secondaryCta,
}) => {
  const [currentProps, setCurrentProps] = useState({
    title: typeof title === 'string' ? title : '',
    subtitle: subtitle || '',
    description: description || '',
    backgroundImage: backgroundImage || '',
    primaryCtaLabel: primaryCta.label,
    primaryCtaTo: primaryCta.to,
    secondaryCtaLabel: secondaryCta?.label || '',
    secondaryCtaTo: secondaryCta?.to || '',
  });

  const handlePropsChange = (newProps: Record<string, any>) => {
    setCurrentProps(prev => ({ ...prev, ...newProps }));
  };
  const handleComponentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // This would trigger component selection in design mode
  };

  return (
    <EditableComponentWrapper
      id="hero-immersive"
      type="HeroSection"
      props={currentProps}
      onPropsChange={handlePropsChange}
    >
      <section 
        className="relative min-h-[calc(100vh-var(--header-height))] md:min-h-screen flex items-center justify-center overflow-hidden"
        data-component-id="hero-immersive"
        onClick={handleComponentClick}
      >
        {/* Background image */}
        <img
          src={currentProps.backgroundImage}
          alt="Comunidade em adoração e comunhão"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />

        {/* Overlay gradient for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/40 to-transparent" />

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          {currentProps.subtitle && (
            <p className="text-sm md:text-base tracking-widest uppercase text-background/80 mb-4">
              <RichTextEditor
                id="hero-subtitle"
                content={currentProps.subtitle}
                placeholder="Subtítulo do hero..."
                className="block"
                tag="span"
                onContentChange={(content) => handlePropsChange({ subtitle: content })}
              />
            </p>
          )}
          <h1 className="font-bold leading-tight mb-6 text-background" style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: "700" }}>
            <RichTextEditor
              id="hero-title"
              content={currentProps.title || (typeof title === 'string' ? title : '')}
              placeholder="Título principal..."
              className="block"
              tag="span"
              onContentChange={(content) => handlePropsChange({ title: content })}
            />
          </h1>
          {currentProps.description && (
            <p className="text-base md:text-lg mb-10 max-w-3xl mx-auto text-background/90">
              <RichTextEditor
                id="hero-description"
                content={currentProps.description}
                placeholder="Descrição do hero..."
                className="block"
                tag="span"
                onContentChange={(content) => handlePropsChange({ description: content })}
              />
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              variant="secondary"
              className="px-8 py-6"
              asChild
            >
              <Link to={currentProps.primaryCtaTo}>{currentProps.primaryCtaLabel}</Link>
            </Button>
            {currentProps.secondaryCtaLabel && (
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 bg-transparent text-background border-background/60 hover:bg-background hover:text-primary focus-visible:ring-background/60"
                asChild
              >
                <Link to={currentProps.secondaryCtaTo}>{currentProps.secondaryCtaLabel}</Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </EditableComponentWrapper>
  );
};

export default HeroImmersive;
