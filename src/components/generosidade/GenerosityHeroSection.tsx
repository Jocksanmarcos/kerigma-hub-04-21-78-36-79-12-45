import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Heart, Globe, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import generositySeedImage from "@/assets/generosity-seed-growth.jpg";

export const GenerosityHeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={generositySeedImage}
          alt="Semente crescendo representando generosidade e transformação"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background/80 to-secondary/20" />
      </div>
      
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
            }}
            animate={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 backdrop-blur-sm rounded-full mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Portal do Impacto</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            Sua generosidade é a{' '}
            <span className="text-primary">ferramenta</span>{' '}
            que transforma o mundo
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Cada semente plantada através da sua doação gera frutos eternos 
            e transforma vidas para a glória de Deus.
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Globe className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Impacto Global</h3>
                <p className="text-sm text-muted-foreground">
                  Suas doações alcançam vidas em todo o mundo
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Heart className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Amor em Ação</h3>
                <p className="text-sm text-muted-foreground">
                  Demonstre o amor de Cristo através da generosidade
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Comunidade Unida</h3>
                <p className="text-sm text-muted-foreground">
                  Juntos construímos o Reino de Deus
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};