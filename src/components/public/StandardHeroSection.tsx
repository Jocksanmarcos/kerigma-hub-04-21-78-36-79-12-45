import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface HeroFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface StandardHeroSectionProps {
  badge?: {
    icon: LucideIcon;
    text: string;
  };
  title: string | React.ReactNode;
  subtitle: string;
  backgroundImage?: string;
  features?: HeroFeature[];
  className?: string;
}

export const StandardHeroSection: React.FC<StandardHeroSectionProps> = ({
  badge,
  title,
  subtitle,
  backgroundImage,
  features = [],
  className = ""
}) => {
  return (
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden ${className}`}>
      {/* Background Image */}
      {backgroundImage && (
        <div className="absolute inset-0">
          <img
            src={backgroundImage}
            alt="Background hero"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background/80 to-secondary/20" />
        </div>
      )}
      
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
          {badge && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 backdrop-blur-sm rounded-full mb-8">
              <badge.icon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">{badge.text}</span>
            </div>
          )}

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            {title}
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>

          {features.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            >
              {features.map((feature, index) => (
                <Card key={index} className="border-primary/20 bg-primary/5 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <feature.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};