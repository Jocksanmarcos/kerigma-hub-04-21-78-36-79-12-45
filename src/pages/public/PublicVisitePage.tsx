import React from "react";
import { DynamicPageRenderer } from "@/components/cms/DynamicPageRenderer";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Phone, Mail } from "lucide-react";

const PublicVisitePage: React.FC = () => {
  return (
    <DynamicPageRenderer
      slug="visite"
      defaultTitle="Primeira Vez"
      defaultDescription="Como é um culto, horários, endereço e formulário de boas-vindas."
      defaultHeroTitle="Primeira Vez"
      defaultHeroSubtitle="Você é bem-vindo(a) para conhecer nossa comunidade!"
      fallbackContent={
        <div className="space-y-16">
          {/* Informações de Horários */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-8">Horários dos Cultos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8 max-w-4xl mx-auto">
              <div className="bg-card p-8 rounded-lg border">
                <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Domingo</h3>
                <p className="text-muted-foreground">Culto de Celebração às 19h</p>
              </div>
              <div className="bg-card p-8 rounded-lg border">
                <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Quarta-feira</h3>
                <p className="text-muted-foreground">Culto de Oração às 19h30</p>
              </div>
            </div>
          </div>

          {/* Localização */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-8">Como Chegar</h2>
            <div className="bg-card p-8 rounded-lg border max-w-2xl mx-auto">
              <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">Endereço</h3>
              <p className="text-muted-foreground mb-6">
                Rua das Flores, 123<br />
                Centro - Cidade<br />
                CEP: 12345-678
              </p>
              <Button variant="outline">Ver no Google Maps</Button>
            </div>
          </div>

          {/* Contato */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-8">Entre em Contato</h2>
            <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8 max-w-4xl mx-auto">
              <div className="bg-card p-8 rounded-lg border">
                <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Telefone</h3>
                <p className="text-muted-foreground">(11) 99999-9999</p>
              </div>
              <div className="bg-card p-8 rounded-lg border">
                <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">E-mail</h3>
                <p className="text-muted-foreground">contato@kerigmahub.com</p>
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
};

export default PublicVisitePage;
