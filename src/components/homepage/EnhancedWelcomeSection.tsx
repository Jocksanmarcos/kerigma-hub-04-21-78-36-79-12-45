import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, BookOpen, Calendar } from "lucide-react";

interface EnhancedWelcomeSectionProps {
  isFirstTime: boolean | null;
}

export const EnhancedWelcomeSection: React.FC<EnhancedWelcomeSectionProps> = ({ isFirstTime }) => {
  const features = [
    {
      icon: Heart,
      title: "Comunidade Acolhedora",
      description: "Uma família que se importa e caminha junto com você."
    },
    {
      icon: BookOpen,
      title: "Crescimento Espiritual",
      description: "Recursos e estudos para fortalecer sua fé."
    },
    {
      icon: Users,
      title: "Células Conectadas",
      description: "Pequenos grupos para relacionamentos genuínos."
    },
    {
      icon: Calendar,
      title: "Eventos Especiais",
      description: "Momentos únicos de celebração e aprendizado."
    }
  ];

  return (
    <section id="welcome-section" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {isFirstTime === true ? "O que você encontrará aqui" : "Continue explorando"}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {isFirstTime === true 
              ? "Nossa igreja é um lugar onde você pode crescer, se conectar e fazer a diferença."
              : "Continue descobrindo novas oportunidades para crescer e se conectar."}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};