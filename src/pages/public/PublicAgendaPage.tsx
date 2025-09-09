import React, { useEffect } from "react";
import { motion } from "framer-motion";
import PublicSiteLayout from "@/components/layout/PublicSiteLayout";
import { StandardHeroSection } from "@/components/public/StandardHeroSection";
import CarouselEventos from "@/components/cms/blocks/CarouselEventos";
import { Calendar, Clock, MapPin, Users, Star, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-immersive.jpg";

const PublicAgendaPage: React.FC = () => {
  useEffect(() => {
    document.title = "Agenda | CBN Kerigma";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Confira os próximos eventos e atividades da CBN Kerigma. Cultos, células, eventos especiais e muito mais.");
    
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);
  }, []);

  const heroFeatures = [
    {
      icon: Calendar,
      title: "Cultos Regulares",
      description: "Domingos às 19h e quintas às 19h30"
    },
    {
      icon: Users,
      title: "Eventos Especiais",
      description: "Conferências, retiros e celebrações"
    },
    {
      icon: Bell,
      title: "Atualizações",
      description: "Fique sempre informado sobre nossas atividades"
    }
  ];

  const upcomingEvents = [
    {
      title: "Culto de Domingo",
      date: "Todos os Domingos",
      time: "19:00",
      location: "Templo Principal",
      type: "regular"
    },
    {
      title: "Encontro de Oração",
      date: "Todas as Quintas",
      time: "19:30",
      location: "Templo Principal", 
      type: "regular"
    },
    {
      title: "Retiro de Jovens",
      date: "15-17 Março",
      time: "Sexta à Domingo",
      location: "Chácara Esperança",
      type: "special"
    },
    {
      title: "Conferência Anual",
      date: "20-22 Abril",
      time: "19:00 - 21:30",
      location: "Centro de Convenções",
      type: "special"
    }
  ];

  return (
    <PublicSiteLayout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-accent/30" />
        
        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 mb-6">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Nossa Agenda</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Participe dos nossos{' '}
              <span className="text-primary">eventos</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Fique por dentro de todas as atividades da nossa comunidade. Cultos, células, eventos especiais e muito mais esperando por você.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {heroFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6"
                >
                  <feature.icon className="h-8 w-8 text-primary mb-3 mx-auto" />
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Eventos em Destaque */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Eventos em Destaque</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Não perca os próximos acontecimentos da nossa comunidade.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <CarouselEventos />
          </motion.div>
        </div>
      </section>

      {/* Agenda Regular */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Programação Regular</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Atividades que acontecem semanalmente em nossa comunidade.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`h-full ${event.type === 'special' ? 'border-primary/50 bg-primary/5' : ''}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      {event.type === 'special' && (
                        <Star className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-6">Não Perca Nenhum Evento</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Cadastre-se para receber notificações sobre nossos próximos eventos 
              e atividades especiais.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8">
                <Bell className="w-4 h-4 mr-2" />
                Receber Notificações
              </Button>
              <Button variant="outline" size="lg" className="px-8">
                Ver Calendário Completo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicSiteLayout>
  );
};

export default PublicAgendaPage;
