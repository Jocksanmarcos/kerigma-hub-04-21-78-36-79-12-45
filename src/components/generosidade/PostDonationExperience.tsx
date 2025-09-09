import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Share2, Home, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface PostDonationExperienceProps {
  donationAmount?: number;
  fundName?: string;
  donorName?: string;
}

export const PostDonationExperience: React.FC<PostDonationExperienceProps> = ({
  donationAmount,
  fundName,
  donorName
}) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Start animation after component mounts
    const timer = setTimeout(() => setShowAnimation(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Acabei de semear na CBN Kerigma!',
        text: `Que alegria participar da obra de Deus através da minha generosidade! 🌱✨`,
        url: window.location.origin + '/semear'
      });
    } else {
      // Fallback for browsers without native share
      const text = `Que alegria participar da obra de Deus através da minha generosidade! 🌱✨ ${window.location.origin}/semear`;
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-lg w-full"
      >
        <Card className="relative overflow-hidden">
          <CardContent className="p-8 text-center">
            {/* Animated Seed Growing */}
            <div className="relative mb-8">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={showAnimation ? { scale: 1, rotate: 0 } : {}}
                transition={{ duration: 1, delay: 0.5 }}
                className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full mb-4"
              >
                <motion.div
                  animate={showAnimation ? { 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  } : {}}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    repeatType: "reverse",
                    delay: 1.5 
                  }}
                >
                  <Sparkles className="w-12 h-12 text-primary" />
                </motion.div>
              </motion.div>
              
              {/* Growing plant animation */}
              <motion.div
                initial={{ height: 0 }}
                animate={showAnimation ? { height: 40 } : {}}
                transition={{ duration: 1.5, delay: 1 }}
                className="w-1 bg-green-500 mx-auto"
              />
              
              <motion.div
                initial={{ scale: 0 }}
                animate={showAnimation ? { scale: 1 } : {}}
                transition={{ duration: 0.8, delay: 2 }}
                className="inline-block"
              >
                🌱
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <h1 className="text-3xl font-bold text-primary mb-4">
                Sua semente foi plantada! 🌱
              </h1>
              
              {donorName && (
                <p className="text-lg text-muted-foreground mb-2">
                  Obrigado, <span className="font-semibold text-foreground">{donorName}</span>!
                </p>
              )}

              <p className="text-muted-foreground mb-6 leading-relaxed">
                Sua generosidade de{' '}
                {donationAmount && (
                  <span className="font-bold text-primary">
                    R$ {donationAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                )}{' '}
                {fundName && `para ${fundName} `}
                está transformando vidas e expandindo o Reino de Deus.
              </p>

              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <p className="text-sm italic text-muted-foreground">
                  "Dê, e será dado a você: uma boa medida, calcada, sacudida 
                  e transbordante será dada a você. Pois com a medida que você 
                  usar, também será medido para você."
                </p>
                <p className="text-xs text-muted-foreground mt-2">— Lucas 6:38</p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="flex-1"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
                
                <Button asChild className="flex-1">
                  <Link to="/" replace>
                    <Home className="w-4 h-4 mr-2" />
                    Voltar para a Kerigma
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* Floating particles effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-primary/20 rounded-full"
                  initial={{ 
                    x: Math.random() * 400,
                    y: Math.random() * 300,
                    scale: 0 
                  }}
                  animate={showAnimation ? {
                    scale: [0, 1, 0],
                    y: [300, -50],
                    x: Math.random() * 400,
                  } : {}}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.5 + 2
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};