import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-immersive.jpg";

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <img
        src={heroImage}
        alt="Comunidade em adoração e comunhão"
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />

      {/* Overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/60" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center text-white">
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-8">
          Encontre o seu Lugar
        </h1>
        <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-95 leading-relaxed">
          Uma igreja onde cada pessoa é valorizada e encontra sua família em Cristo
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Button
            size="lg"
            className="px-10 py-6 text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl border-0"
            asChild
          >
            <Link to="/primeira-vez">Planeje Sua Visita</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="px-10 py-6 text-lg bg-transparent text-white border-white/60 hover:bg-white hover:text-primary backdrop-blur-sm"
            asChild
          >
            <Link to="/celulas">Encontrar uma Célula</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};