import React from 'react';
import { motion } from "framer-motion";
import PublicSiteLayout from '@/components/layout/PublicSiteLayout';
import { SolicitacaoAconselhamentoForm } from '@/components/aconselhamento/SolicitacaoAconselhamentoForm';
import { HeartHandshake, Shield, Clock, Users, Heart, Phone, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PublicAconselhamentoPage = () => {
  React.useEffect(() => {
    document.title = "Aconselhamento Pastoral | CBN Kerigma";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Solicite aconselhamento pastoral na CBN Kerigma. Nossa equipe está pronta para caminhar ao seu lado com amor, sabedoria e confidencialidade.");
  }, []);

  const heroFeatures = [
    {
      icon: Shield,
      title: "Confidencial",
      description: "Todas as conversas são tratadas com total sigilo pastoral"
    },
    {
      icon: Clock,
      title: "Flexível",
      description: "Horários que se adequem à sua disponibilidade"
    },
    {
      icon: Users,
      title: "Acolhedor",
      description: "Equipe preparada para acolher com amor e sem julgamentos"
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
              <HeartHandshake className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Aconselhamento Pastoral</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="text-foreground">Encontre</span>{' '}
              <span className="text-primary">Orientação</span>{' '}
              <span className="text-foreground">e Cuidado</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Em momentos de dificuldade, dúvida ou necessidade de orientação, nossa equipe pastoral 
              está aqui para caminhar ao seu lado com amor, sabedoria e confidencialidade.
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

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-muted/30 to-accent/10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Nosso <span className="text-primary">Compromisso</span> com Você
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              O aconselhamento pastoral é um ministério sagrado de cuidado, orientação e apoio 
              espiritual fundamentado na Palavra de Deus.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Shield,
                title: "Confidencial",
                description: "Todas as conversas são tratadas com total sigilo e confidencialidade pastoral.",
                color: "primary"
              },
              {
                icon: Clock,
                title: "Flexível", 
                description: "Agendamos horários que se adequem à sua disponibilidade e necessidade.",
                color: "accent"
              },
              {
                icon: Users,
                title: "Acolhedor",
                description: "Nossa equipe está preparada para acolher com amor e sem julgamentos.",
                color: "primary"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-2xl group">
                  <CardHeader className="text-center pb-6">
                    <div className={`mx-auto p-4 rounded-full bg-${feature.color}/10 group-hover:bg-${feature.color}/20 transition-colors duration-300`}>
                      <feature.icon className={`h-8 w-8 text-${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl mt-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Solicite seu <span className="text-primary">Aconselhamento</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Preencha o formulário abaixo e nossa equipe pastoral entrará em contato 
              para agendar um momento de cuidado e orientação espiritual.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="border-2 border-primary/20 shadow-2xl">
              <CardContent className="p-8">
                <SolicitacaoAconselhamentoForm />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Information Section */}
      <section className="py-20 bg-gradient-to-br from-muted/30 to-accent/10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Como Funciona o <span className="text-primary">Processo</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Um processo simples e acolhedor para conectar você com o cuidado pastoral que precisa.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                step: "1",
                icon: User,
                title: "Envie sua Solicitação",
                description: "Preencha o formulário com suas informações e descreva sua necessidade de forma confidencial.",
                color: "primary"
              },
              {
                step: "2", 
                icon: Phone,
                title: "Retorno Pastoral",
                description: "Um pastor da nossa equipe entrará em contato em até 24 horas para agendar o encontro.",
                color: "accent"
              },
              {
                step: "3",
                icon: Heart,
                title: "Encontro Pastoral", 
                description: "Momento de diálogo, oração, orientação bíblica e cuidado pastoral personalizado.",
                color: "primary"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-2xl group">
                  <CardHeader className="text-center pb-6">
                    <div className="relative mx-auto mb-4">
                      <div className={`w-16 h-16 rounded-full bg-${item.color}/10 group-hover:bg-${item.color}/20 transition-colors duration-300 flex items-center justify-center`}>
                        <item.icon className={`h-8 w-8 text-${item.color}`} />
                      </div>
                      <div className={`absolute -top-2 -right-2 w-8 h-8 bg-${item.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                        {item.step}
                      </div>
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PublicSiteLayout>
  );
};

export default PublicAconselhamentoPage;