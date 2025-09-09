import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PublicSiteLayout from "@/components/layout/PublicSiteLayout";

const DonationSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const donationId = searchParams.get("donation_id");

  useEffect(() => {
    document.title = "Obrigado pela sua doação | CBN Kerigma";
  }, []);

  return (
    <PublicSiteLayout>
      <div className="min-h-screen flex items-center justify-center py-16 px-4">
        <Card className="max-w-md w-full mx-auto text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-700">
              Doação Recebida!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Heart className="w-5 h-5" />
              <span className="text-lg font-semibold">Obrigado por semear!</span>
            </div>
            
            <p className="text-muted-foreground">
              Sua doação foi processada com sucesso. Deus abençoe sua generosidade!
            </p>

            {donationId && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">
                  <strong>ID da doação:</strong> {donationId}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  (Modo simulação - nenhum pagamento real foi processado)
                </p>
              </div>
            )}

            <div className="space-y-3 pt-4">
              <Button 
                onClick={() => window.location.href = "/semear"}
                className="w-full"
              >
                Fazer Nova Doação
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => window.location.href = "/"}
                className="w-full"
              >
                Voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicSiteLayout>
  );
};

export default DonationSuccessPage;