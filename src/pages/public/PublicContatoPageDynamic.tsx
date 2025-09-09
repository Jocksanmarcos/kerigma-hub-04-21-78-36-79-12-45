import React from 'react';
import PublicSiteLayout from '@/components/layout/PublicSiteLayout';
import { StandardHeroSection } from '@/components/public/StandardHeroSection';
import { Card, CardContent } from '@/components/ui/card';
import { GoogleMap } from '@/components/maps/GoogleMap';
import { RecaptchaForm } from '@/components/forms/RecaptchaForm';
import { MapPin, Mail, Phone, Clock, MessageSquare } from 'lucide-react';
import heroImage from '@/assets/hero-immersive.jpg';

const PublicContatoPageDynamic = () => {
  React.useEffect(() => {
    document.title = "Contato | CBN Kerigma";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Entre em contato com a CBN Kerigma. Endereço, telefone, e-mail e formulário de contato.");
  }, []);

  const heroFeatures = [
    {
      icon: MessageSquare,
      title: "Comunicação",
      description: "Estamos sempre abertos ao diálogo"
    },
    {
      icon: MapPin,
      title: "Localização",
      description: "Venha nos visitar em nossa sede"
    },
    {
      icon: Clock,
      title: "Horários",
      description: "Cultos aos domingos às 9h e 19h"
    }
  ];

  const handleFormSubmit = (data: any) => {
    console.log('Form submitted:', data);
    // Here you would typically send the data to your backend
  };

  return (
    <PublicSiteLayout>
      {/* Hero Section */}
      <StandardHeroSection
        badge={{ icon: MessageSquare, text: "Contato" }}
        title={
          <>
            Entre em <span className="text-primary">contato</span> conosco
          </>
        }
        subtitle="Estamos aqui para servir você e sua família. Seja para dúvidas, sugestões ou pedidos de oração, nossa equipe está pronta para atendê-lo."
        backgroundImage={heroImage}
        features={heroFeatures}
      />

      {/* Contact Form and Info */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form with reCAPTCHA */}
            <RecaptchaForm onSubmit={handleFormSubmit} />

            {/* Contact Information */}
            <div className="space-y-8">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold mb-6">Informações de Contato</h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold mb-1">Endereço</h4>
                        <p className="text-muted-foreground">
                          Rua São Luis, s/n - Centro<br />
                          São Luís - MA, 65020-000<br />
                          Brasil
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <Phone className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold mb-1">Telefone</h4>
                        <p className="text-muted-foreground">
                          (98) 99999-9999<br />
                          (98) 3333-4444
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <Mail className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold mb-1">E-mail</h4>
                        <p className="text-muted-foreground">
                          contato@cbnkerigma.com<br />
                          pastoreio@cbnkerigma.com
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <Clock className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold mb-1">Horários dos Cultos</h4>
                        <p className="text-muted-foreground">
                          Domingos: 9h00 e 19h00<br />
                          Quartas: 19h30 (Culto de Oração)
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Interactive Map */}
              <div>
                <h3 className="text-xl font-bold mb-4">Como Chegar</h3>
                <GoogleMap
                  latitude={-2.5533569819050466}
                  longitude={-44.22303380556121}
                  title="Comunidade Batista Nacional Kerigma"
                  zoom={16}
                  height="300px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicSiteLayout>
  );
};

export default PublicContatoPageDynamic;
