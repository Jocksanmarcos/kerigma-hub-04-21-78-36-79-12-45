import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { BlockRenderer } from "@/components/cms/BlockRenderer";
import PublicSiteLayout from "@/components/layout/PublicSiteLayout";
import { StandardHeroSection } from "@/components/public/StandardHeroSection";
import MapaCelulas from "@/components/cms/blocks/MapaCelulas";
import { Users, MapPin, Heart, Home, Clock, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-immersive.jpg";

const PublicCelulasPage: React.FC = () => {
  const [pageContent, setPageContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPageContent();
    // SEO basics
    document.title = 'Células | CBN Kerigma';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name','description'); document.head.appendChild(meta); }
    meta.setAttribute('content','Encontre uma célula perto de você e faça parte da nossa comunidade de fé. Relacionamentos autênticos e crescimento espiritual.');
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel','canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', window.location.href);
  }, []);

  const heroFeatures = [
    {
      icon: Home,
      title: "Ambiente Familiar",
      description: "Reuniões nas casas criam um ambiente acolhedor e íntimo"
    },
    {
      icon: MessageCircle,
      title: "Relacionamentos",
      description: "Conecte-se com pessoas que se importam verdadeiramente"
    },
    {
      icon: Clock,
      title: "Flexibilidade",
      description: "Horários diversos para se adaptar à sua rotina"
    }
  ];

  async function loadPageContent() {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('cms-get-page', {
        body: { slug: 'celulas', ttlSeconds: 300 },
      });
      if (!error && data) {
        const d: any = data;
        setPageContent(Array.isArray(d.blocks) ? d.blocks : []);
        return;
      }
      // Fallback
      const { data: pages } = await supabase
        .from('paginas_site')
        .select('*')
        .eq('slug', 'celulas')
        .eq('published', true)
        .maybeSingle();
      if (pages) {
        const { data: blocks } = await supabase
          .from('content_blocks')
          .select('*')
          .eq('page_id', pages.id)
          .order('order');
        setPageContent(blocks || []);
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicSiteLayout>
      {/* Hero Section */}
      <StandardHeroSection
        badge={{ icon: Users, text: "Células" }}
        title={
          <>
            Encontre sua{' '}
            <span className="text-primary">família</span>{' '}
            na fé
          </>
        }
        subtitle="Conecte-se com uma comunidade acolhedora através das nossas células. Relacionamentos autênticos, crescimento espiritual e cuidado mútuo."
        backgroundImage={heroImage}
        features={heroFeatures}
      />

      {/* O que são Células Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-6">O que são Células?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              As células são pequenos grupos que se reúnem semanalmente nas casas para estudar a Palavra, 
              orar juntos e construir relacionamentos genuínos. É onde a vida da igreja realmente acontece.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="text-center h-full">
                <CardHeader>
                  <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-lg">Comunhão</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Relacionamentos profundos e duradouros em Cristo
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="text-center h-full">
                <CardHeader>
                  <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-lg">Estudo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Crescimento através do estudo da Palavra de Deus
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="text-center h-full">
                <CardHeader>
                  <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-lg">Cuidado</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Apoio mútuo nas alegrias e dificuldades da vida
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="text-center h-full">
                <CardHeader>
                  <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-lg">Missão</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Evangelismo e impacto na comunidade local
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mapa de Células Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Encontre uma Célula</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Descubra uma célula próxima a você e dê o primeiro passo para fazer parte 
              de uma comunidade que se importa.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <MapaCelulas />
          </motion.div>

          {/* Dynamic Content from CMS */}
          {!loading && pageContent.length > 0 && (
            <div className="mt-16 space-y-12">
              {pageContent.map((block) => (
                <div key={block.id}>
                  <BlockRenderer block={block} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-6">Pronto para Participar?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Entre em contato conosco e daremos todo o suporte para você se conectar 
              com uma célula próxima à sua casa.
            </p>
            <Button size="lg" className="px-8">
              Quero Participar
            </Button>
          </motion.div>
        </div>
      </section>
    </PublicSiteLayout>
  );
};

export default PublicCelulasPage;