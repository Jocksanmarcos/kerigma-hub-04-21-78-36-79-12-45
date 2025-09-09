import React, { FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";
import PublicSiteLayout from "@/components/layout/PublicSiteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Clock, MessageCircle, Send, Shield } from "lucide-react";
import InteractiveMap from "@/components/maps/InteractiveMap";

const PublicContatoPage: React.FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Contato | CBN Kerigma";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Entre em contato com a CBN Kerigma. Estamos aqui para orar, aconselhar e servir você e sua família.");
    
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular envio de formulário
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({ 
        title: "Mensagem enviada com sucesso!", 
        description: "Obrigado por entrar em contato. Responderemos em breve." 
      });
      
      (e.currentTarget as HTMLFormElement).reset();
    } catch (error) {
      toast({
        title: "Erro ao enviar mensagem",
        description: "Tente novamente em alguns minutos.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

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
              <MessageCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Fale Conosco</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Estamos{' '}
              <span className="text-primary">Aqui</span>{' '}
              para Você
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Nossa porta está sempre aberta. Entre em contato conosco para oração, aconselhamento, 
              dúvidas ou para conhecer mais sobre nossa comunidade de fé.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {[
                { icon: Phone, title: "Atendimento Rápido", desc: "Resposta em até 24 horas durante dias úteis" },
                { icon: Mail, title: "Múltiplos Canais", desc: "WhatsApp, e-mail e redes sociais" },
                { icon: Shield, title: "Privacidade Total", desc: "Suas informações são protegidas e confidenciais" }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6"
                >
                  <feature.icon className="h-8 w-8 text-primary mb-3 mx-auto" />
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contato Principal */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Formulário */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card className="border-2 border-primary/20 shadow-2xl">
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl md:text-3xl">
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      Envie sua Mensagem
                    </span>
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Preencha o formulário e entraremos em contato em breve
                  </p>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Nome *
                        </label>
                        <Input 
                          name="name" 
                          placeholder="Seu nome completo" 
                          required 
                          className="border-2 border-border focus:border-primary transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          E-mail *
                        </label>
                        <Input 
                          type="email" 
                          name="email" 
                          placeholder="seu@email.com" 
                          required 
                          className="border-2 border-border focus:border-primary transition-colors"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Telefone
                      </label>
                      <Input 
                        type="tel" 
                        name="phone" 
                        placeholder="(11) 99999-9999" 
                        className="border-2 border-border focus:border-primary transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Assunto
                      </label>
                      <Input 
                        name="subject" 
                        placeholder="Como podemos ajudar?" 
                        className="border-2 border-border focus:border-primary transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Mensagem *
                      </label>
                      <Textarea 
                        name="message" 
                        placeholder="Descreva sua necessidade, dúvida ou pedido de oração..." 
                        rows={6} 
                        required 
                        className="border-2 border-border focus:border-primary transition-colors resize-none"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4 text-primary" />
                      <span>Suas informações são protegidas e não serão compartilhadas</span>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Enviando...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Send className="h-5 w-5" />
                          Enviar Mensagem
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Informações de Contato */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Informações de Contato
                  </span>
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Estamos sempre disponíveis para servir você e sua família. 
                  Use qualquer um dos canais abaixo para entrar em contato.
                </p>
              </div>

              <div className="space-y-6">
                <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">E-mail</h3>
                        <p className="text-muted-foreground mb-2">
                          contato@cbnkerigma.com.br
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Resposta em até 24 horas
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-accent/20 hover:border-accent/40 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-accent/10 p-3 rounded-full">
                        <Phone className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Telefone & WhatsApp</h3>
                        <p className="text-muted-foreground mb-2">
                          (98) 98888-8888
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Segunda a sexta, 8h às 18h
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Endereço</h3>
                        <p className="text-muted-foreground mb-2">
                          Comunidade Batista Nacional Kerigma<br />
                          São Luís/MA<br />
                          CEP: 65000-000
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Ver no Google Maps
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-accent/20 hover:border-accent/40 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-accent/10 p-3 rounded-full">
                        <Clock className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Horários dos Cultos</h3>
                        <div className="space-y-1 text-muted-foreground">
                          <p>🙏 Domingos: 19h (Culto de Celebração)</p>
                          <p>⛪ Quartas: 19h30 (Culto de Oração)</p>
                          <p>🏠 Células: Diversos horários</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mapa e Localização */}
      <section className="py-20 bg-gradient-to-br from-muted/30 to-accent/10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Como Chegar
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Venha nos visitar! A Comunidade Batista Nacional Kerigma está de portas abertas 
              para recebê-lo com amor e alegria.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <InteractiveMap 
              address="Comunidade Batista Nacional Kerigma - São Luís/MA"
              coordinates={{ lat: -2.553380003177845, lng: -44.22306216334706 }}
            />
          </motion.div>
        </div>
      </section>
    </PublicSiteLayout>
  );
};

export default PublicContatoPage;