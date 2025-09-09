import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Handshake, Users } from "lucide-react";

export const CommunitySection: React.FC = () => {
  const communityFeatures = [
    {
      icon: Users,
      title: "Células de Vida",
      description: "Pequenos grupos para conexões profundas e crescimento mútuo.",
      action: "Encontrar uma célula"
    },
    {
      icon: Heart,
      title: "Ação Social",
      description: "Projetos comunitários que fazem a diferença na sociedade.",
      action: "Como participar"
    },
    {
      icon: MessageCircle,
      title: "Aconselhamento",
      description: "Apoio pastoral para momentos de dificuldade e decisões importantes.",
      action: "Agendar conversa"
    },
    {
      icon: Handshake,
      title: "Voluntariado",
      description: "Use seus dons e talentos para servir a comunidade e a igreja.",
      action: "Ser voluntário"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Nossa Comunidade
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Mais que uma igreja, somos uma família que se importa uns com os outros e com a comunidade.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {communityFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow group">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-xl mb-3">{feature.title}</h3>
                        <p className="text-muted-foreground mb-4 leading-relaxed">
                          {feature.description}
                        </p>
                        <Button variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          {feature.action}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Pronto para fazer parte?
            </h3>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Junte-se a nós e descubra como é fazer parte de uma comunidade que verdadeiramente se importa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                Visitar nossa igreja
              </Button>
              <Button variant="outline" size="lg">
                Falar conosco
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};