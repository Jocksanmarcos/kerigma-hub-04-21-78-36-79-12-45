import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { PostDonationExperience } from "@/components/generosidade/PostDonationExperience";
import PublicSiteLayout from "@/components/layout/PublicSiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, XCircle, Home } from "lucide-react";
import { Link } from "react-router-dom";

const DonationStatusPage: React.FC = () => {
  const { status } = useParams<{ status: string }>();
  const [searchParams] = useSearchParams();
  const [donationData, setDonationData] = useState<any>(null);

  useEffect(() => {
    // Extract donation data from URL parameters
    const externalRef = searchParams.get('external_reference');
    const paymentId = searchParams.get('payment_id');
    const paymentStatus = searchParams.get('payment_status');
    
    if (externalRef) {
      try {
        const parsed = JSON.parse(decodeURIComponent(externalRef));
        setDonationData({
          ...parsed,
          paymentId,
          paymentStatus
        });
      } catch (error) {
        console.error('Error parsing donation data:', error);
      }
    }
  }, [searchParams]);

  const renderStatusContent = () => {
    switch (status) {
      case 'obrigado':
        return (
          <PostDonationExperience
            donationAmount={donationData?.amount}
            fundName={donationData?.fund_name}
            donorName={donationData?.donor_name}
          />
        );

      case 'pendente':
        return (
          <PublicSiteLayout>
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
              <Card className="max-w-lg w-full">
                <CardContent className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-6">
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                  
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Pagamento Pendente
                  </h1>
                  
                  <p className="text-gray-600 mb-6">
                    Sua doação está sendo processada. Você receberá uma confirmação 
                    por email assim que o pagamento for aprovado.
                  </p>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-yellow-800">
                      💡 Para pagamentos via PIX, a confirmação é quase instantânea. 
                      Boletos podem levar até 3 dias úteis.
                    </p>
                  </div>
                  
                  <Button asChild className="w-full">
                    <Link to="/">
                      <Home className="w-4 h-4 mr-2" />
                      Voltar ao Início
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </PublicSiteLayout>
        );

      case 'erro':
        return (
          <PublicSiteLayout>
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
              <Card className="max-w-lg w-full">
                <CardContent className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                  
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Problema no Pagamento
                  </h1>
                  
                  <p className="text-gray-600 mb-6">
                    Houve um problema ao processar seu pagamento. 
                    Por favor, tente novamente ou escolha outra forma de pagamento.
                  </p>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-red-800">
                      <AlertCircle className="w-4 h-4 inline mr-2" />
                      Se o problema persistir, entre em contato conosco.
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button variant="outline" asChild className="flex-1">
                      <Link to="/semear">Tentar Novamente</Link>
                    </Button>
                    <Button asChild className="flex-1">
                      <Link to="/contato">Contato</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </PublicSiteLayout>
        );

      default:
        return (
          <PublicSiteLayout>
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Status não encontrado</h1>
                <Button asChild>
                  <Link to="/">Voltar ao Início</Link>
                </Button>
              </div>
            </div>
          </PublicSiteLayout>
        );
    }
  };

  return renderStatusContent();
};

export default DonationStatusPage;