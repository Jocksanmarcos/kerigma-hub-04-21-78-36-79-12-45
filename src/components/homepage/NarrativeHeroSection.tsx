import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowDown, Heart, Users } from "lucide-react";

interface NarrativeHeroSectionProps {
  isFirstTime: boolean | null;
}

export const NarrativeHeroSection: React.FC<NarrativeHeroSectionProps> = ({ isFirstTime }) => {
  const scrollToNext = () => {
    const nextSection = document.getElementById('welcome-section');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {isFirstTime === true ? "Bem-vindo à" : "Bem-vindo de volta à"}
            </h1>
            <h2 className="text-3xl md:text-5xl font-semibold text-foreground mb-6">
              Família Kerigma
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed"
          >
            {isFirstTime === true 
              ? "Descubra uma comunidade onde cada pessoa é valorizada, cada história importa e cada passo na fé é celebrado." 
              : "Continue sua jornada de fé conosco. Aqui você sempre terá um lugar especial em nossa família."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Button size="lg" className="gap-2">
              <Heart className="h-5 w-5" />
              {isFirstTime === true ? "Começar minha jornada" : "Continuar jornada"}
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Users className="h-5 w-5" />
              Conhecer a comunidade
            </Button>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            onClick={scrollToNext}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowDown className="h-8 w-8 mx-auto animate-bounce" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};