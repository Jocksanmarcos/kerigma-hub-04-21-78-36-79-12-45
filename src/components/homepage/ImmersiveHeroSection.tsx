import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Play, Calendar, Clock } from "lucide-react";
import heroImage from "@/assets/hero-immersive.jpg";

interface HeroData {
  title: string;
  subtitle: string;
  description: string;
  primaryCta: { label: string; link: string };
  secondaryCta: { label: string; link: string };
  backgroundImage: string;
}

export const ImmersiveHeroSection: React.FC = () => {
  const [heroData, setHeroData] = useState<HeroData>({
    title: "Encontre o seu Lugar",
    subtitle: "Igreja em Células",
    description: "Uma comunidade onde cada pessoa é valorizada e encontra sua família em Cristo",
    primaryCta: { label: "Planeje Sua Visita", link: "/primeira-vez" },
    secondaryCta: { label: "Encontrar uma Célula", link: "/celulas" },
    backgroundImage: heroImage
  });

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Enhanced Effects */}
      <div className="absolute inset-0">
        <img
          src={heroData.backgroundImage}
          alt="Comunidade em adoração e comunhão"
          className="w-full h-full object-cover scale-105 animate-[scale-in_20s_ease-out_infinite_alternate]"
          loading="eager"
        />
        {/* Dynamic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/70" />
        
        {/* Floating Menu Background */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/50 to-transparent" />
      </div>

      {/* Floating Particles Effect (CSS Only) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-[fade-in_3s_ease-in-out_infinite_alternate]" />
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-primary/30 rounded-full animate-[fade-in_4s_ease-in-out_infinite_alternate]" />
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-secondary/20 rounded-full animate-[fade-in_5s_ease-in-out_infinite_alternate]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 text-center text-white">
        {/* Subtitle Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-sm font-medium tracking-wider uppercase">
            {heroData.subtitle}
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-8 tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/90">
            {heroData.title}
          </span>
        </h1>

        {/* Description */}
        <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto opacity-95 leading-relaxed font-light">
          {heroData.description}
        </p>
        
        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Button
            size="lg"
            className="px-10 py-6 text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl border-0 hover:scale-105 transition-all duration-300"
            asChild
          >
            <Link to={heroData.primaryCta.link}>
              <Calendar className="mr-2 h-5 w-5" />
              {heroData.primaryCta.label}
            </Link>
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="px-10 py-6 text-lg bg-white/10 text-white border-white/30 hover:bg-white hover:text-primary backdrop-blur-sm hover:scale-105 transition-all duration-300"
            asChild
          >
            <Link to={heroData.secondaryCta.link}>
              <Play className="mr-2 h-5 w-5" />
              {heroData.secondaryCta.label}
            </Link>
          </Button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
          <div className="flex flex-col items-center text-white/60">
            <span className="text-sm font-medium mb-3">Descubra mais</span>
            <div className="w-0.5 h-12 bg-gradient-to-b from-white/60 to-transparent animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};