import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PublicSiteLayout from "@/components/layout/PublicSiteLayout";
import { GenerosityFundCard } from "@/components/generosidade/GenerosityFundCard";
import { DonationModal } from "@/components/generosidade/DonationModal";
import { PostDonationExperience } from "@/components/generosidade/PostDonationExperience";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { GenerosityHeroSection } from "@/components/generosidade/GenerosityHeroSection";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Fund {
  id: string;
  nome: string;
  descricao: string;
  cor: string;
  meta_mensal?: number;
}

const SemearTransformarPage: React.FC = () => {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [selectedFund, setSelectedFund] = useState<{ id: string; name: string } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Semear & Transformar | CBN Kerigma";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Sua generosidade é a ferramenta que transforma o mundo. Participe da obra de Deus através da sua contribuição.");
    
    loadFunds();
  }, []);

  const loadFunds = async () => {
    try {
      const { data, error } = await supabase
        .from('fundos_contabeis')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setFunds(data || []);
    } catch (error: any) {
      console.error('Error loading funds:', error);
      toast({
        title: "Erro ao carregar fundos",
        description: "Tente recarregar a página",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = (fundId: string, fundName: string) => {
    setSelectedFund({ id: fundId, name: fundName });
  };

  const handleDonationSuccess = (paymentInfo: any) => {
    setSelectedFund(null);
    setShowSuccess(true);
  };

  if (showSuccess) {
    return <PostDonationExperience />;
  }

  return (
    <PublicSiteLayout>
      {/* Immersive Hero Section */}
      <GenerosityHeroSection />

      {/* Mural da Generosidade */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Mural da Generosidade
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Escolha onde sua semente será plantada. Cada área representa uma oportunidade 
              única de participar da obra transformadora de Deus.
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {funds.map((fund, index) => (
                <motion.div
                  key={fund.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <GenerosityFundCard
                    fund={fund}
                    onDonate={handleDonate}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Transparência Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  Transparência & Propósito
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-lg text-muted-foreground">
                  Cada real doado é administrado com zelo e transparência. 
                  Prestamos contas regularmente sobre como os recursos são utilizados 
                  para expandir o Reino de Deus e transformar vidas.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div className="text-center p-4">
                    <h4 className="font-semibold text-lg mb-2">100% Transparente</h4>
                    <p className="text-sm text-muted-foreground">
                      Relatórios mensais de como cada doação é aplicada
                    </p>
                  </div>
                  <div className="text-center p-4">
                    <h4 className="font-semibold text-lg mb-2">Segurança Total</h4>
                    <p className="text-sm text-muted-foreground">
                      Pagamentos processados com tecnologia bancária de ponta
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Donation Modal */}
      {selectedFund && (
        <DonationModal
          isOpen={!!selectedFund}
          onClose={() => setSelectedFund(null)}
          fundId={selectedFund.id}
          fundName={selectedFund.name}
          onSuccess={handleDonationSuccess}
        />
      )}
    </PublicSiteLayout>
  );
};

export default SemearTransformarPage;