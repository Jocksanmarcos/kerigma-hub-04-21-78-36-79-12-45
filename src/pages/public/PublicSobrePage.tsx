import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PublicSiteLayout from "@/components/layout/PublicSiteLayout";
import { GenerosityHeroSection } from "@/components/generosidade/GenerosityHeroSection";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Target, Star, Heart, Users, BookOpen, MapPin, Calendar, Church, Cross, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TeamMember {
  id: string;
  nome: string;
  cargo: string;
  bio?: string;
  foto_url?: string;
}

const PublicSobrePage: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Sobre Nós | CBN Kerigma";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Conheça a história, missão, visão e valores da CBN Kerigma. Uma igreja em células comprometida com o crescimento espiritual e a transformação de vidas.");
    
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);
    
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('pessoas')
        .select('id, nome_completo, tipo_pessoa, observacoes, foto_url')
        .eq('tipo_pessoa', 'lider')
        .eq('situacao', 'ativo')
        .limit(6);

      if (error) throw error;
      
      const formattedMembers = data?.map(member => ({
        id: member.id,
        nome: member.nome_completo,
        cargo: member.observacoes || 'Liderança',
        bio: `Servo dedicado ao Reino de Deus`,
        foto_url: member.foto_url
      })) || [];
      
      setTeamMembers(formattedMembers);
    } catch (error: any) {
      console.error('Error loading team members:', error);
      // Use fallback data
      setTeamMembers([
        { id: '1', nome: 'Pr. João Silva', cargo: 'Pastor Principal', bio: 'Liderando com amor e dedicação há 5 anos, focado no crescimento espiritual da igreja.' },
        { id: '2', nome: 'Pr. Maria Santos', cargo: 'Coordenação de Células', bio: 'Responsável pelo desenvolvimento e crescimento do ministério de células.' },
        { id: '3', nome: 'Pr. Carlos Lima', cargo: 'Ministério de Ensino', bio: 'Dedicado ao ensino da Palavra e formação de novos líderes.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicSiteLayout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-accent/30" />
        
        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 mb-6">
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Nossa História</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Conheça a{' '}
              <span className="text-primary">CBN Kerigma</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Uma igreja em células comprometida com o crescimento espiritual e a transformação de vidas através de relacionamentos autênticos.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {[
                { icon: Users, title: "Comunidade", desc: "Igreja em células que valoriza relacionamentos autênticos" },
                { icon: BookOpen, title: "Ensino", desc: "Comprometidos com o ensino bíblico transformador" },
                { icon: MapPin, title: "Missão", desc: "Levando o evangelho a todas as nações" }
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

      {/* Nossa História */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="border-2 border-primary/20 shadow-2xl bg-gradient-to-br from-card to-card/50">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl md:text-4xl mb-4">
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    A História da CBN Kerigma
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 md:p-12">
                <div className="prose prose-lg max-w-none space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Church className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Origem e propósito</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        A Comunidade Batista Nacional Kerigma nasceu em 2019 com o sonho de ser uma igreja diferente,
                        focada no modelo de células como estratégia de evangelismo e relacionamento. O nome "Kerigma" vem do
                        grego e significa "proclamação", refletindo nossa missão de proclamar o Evangelho através de relacionamentos autênticos.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-accent/10 p-3 rounded-full">
                      <Users className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Crescimento em células</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Iniciamos com um pequeno grupo de famílias comprometidas com a visão de crescer através de células. Hoje, somos uma
                        comunidade de mais de 200 membros ativos, organizados em mais de 15 células na região metropolitana de São Luís.
                      </p>
                      <p className="text-muted-foreground leading-relaxed mt-4">
                        Cremos que cada pessoa importa para Deus e deve ser alcançada com amor e cuidado genuíno, promovendo relacionamentos profundos e duradouros.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Heart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Filosofia ministerial</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <strong className="text-primary">Amor e cuidado genuíno:</strong>
                          <p className="text-sm text-muted-foreground mt-1">cada pessoa é valorizada.</p>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <strong className="text-accent">Relacionamentos profundos:</strong>
                          <p className="text-sm text-muted-foreground mt-1">vida em comunidade.</p>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <strong className="text-primary">Crescimento espiritual contínuo:</strong>
                          <p className="text-sm text-muted-foreground mt-1">discipulado intencional.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Nossos Pilares */}
      <section className="py-20 bg-gradient-to-br from-muted/30 to-accent/10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Nossos Pilares
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Os princípios fundamentais que orientam nossa caminhada e definem quem somos como comunidade de fé.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Target,
                title: "Missão",
                content: "Formar discípulos de Jesus Cristo através do modelo de células, promovendo evangelismo relacional e crescimento espiritual em comunidade.",
                color: "primary"
              },
              {
                icon: Star,
                title: "Visão", 
                content: "Ser uma igreja em células que transforma vidas e multiplica discípulos, impactando nossa cidade e região com o amor de Cristo.",
                color: "accent"
              },
              {
                icon: Heart,
                title: "Valores",
                content: "",
                color: "primary",
                list: ["Amor genuíno", "Comunhão verdadeira", "Crescimento contínuo", "Evangelismo relacional", "Multiplicação saudável"]
              }
            ].map((pilar, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-2xl group">
                  <CardHeader className="text-center pb-6">
                    <div className={`mx-auto p-4 rounded-full bg-${pilar.color}/10 group-hover:bg-${pilar.color}/20 transition-colors duration-300`}>
                      <pilar.icon className={`h-8 w-8 text-${pilar.color}`} />
                    </div>
                    <CardTitle className="text-xl mt-4">{pilar.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    {pilar.content && (
                      <p className="text-muted-foreground leading-relaxed">{pilar.content}</p>
                    )}
                    {pilar.list && (
                      <ul className="space-y-2">
                        {pilar.list.map((item, i) => (
                          <li key={i} className="flex items-center justify-center gap-2 text-muted-foreground">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Nossa Liderança */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Nossa Liderança
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Líderes comprometidos com o pastoreio e o crescimento espiritual de nossa comunidade.
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-muted animate-pulse rounded-lg h-80" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {teamMembers.slice(0, 3).map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="text-center border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-2xl group">
                    <CardHeader className="pb-6">
                      <div className="relative mx-auto mb-6">
                        <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center overflow-hidden">
                          {member.foto_url ? (
                            <img 
                              src={member.foto_url} 
                              alt={member.nome}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Users className="w-16 h-16 text-muted-foreground" />
                          )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <Cross className="w-4 h-4 text-primary-foreground" />
                        </div>
                      </div>
                      <CardTitle className="text-xl">{member.nome}</CardTitle>
                      <p className="text-primary font-medium">{member.cargo}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {member.bio || "Servo dedicado ao Reino de Deus, comprometido com o crescimento espiritual da igreja."}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicSiteLayout>
  );
};

export default PublicSobrePage;