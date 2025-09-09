import React, { useEffect } from "react";
import PublicSiteLayout from "@/components/layout/PublicSiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const PublicDizimosPage: React.FC = () => {
  useEffect(() => {
    document.title = "Dízimos e Ofertas | CBN Kerigma";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Entenda como contribuir com os dízimos e ofertas na CBN Kerigma com transparência e propósito.");
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", window.location.href);
  }, []);

  return (
    <PublicSiteLayout>
      <header className="bg-kerigma-gradient text-primary-foreground py-16 text-center animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold">Dízimos e Ofertas</h1>
        <p className="mt-3 opacity-90">Sua contribuição faz a diferença no Reino de Deus</p>
      </header>

      <main className="py-12">
        <section className="max-w-4xl mx-auto px-4 space-y-8">
          <Card>
            <CardContent className="p-6 space-y-3">
              <h2 className="text-2xl font-semibold text-primary">Por que contribuir?</h2>
              <p className="text-muted-foreground">
                "Trazei todos os dízimos à casa do tesouro, para que haja mantimento na minha casa,
                e depois fazei prova de mim nisto, diz o Senhor dos Exércitos, se eu não vos abrir
                as janelas do céu, e não derramar sobre vós uma bênção tal até que não haja lugar
                suficiente para a recolherdes." — Malaquias 3:10
              </p>
              <p className="text-muted-foreground">
                O dízimo é uma prática bíblica que demonstra gratidão e confiança na provisão de Deus.
                Ao dizimar e ofertar, você participa da obra e do avanço do Reino.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <h3 className="text-xl font-semibold text-primary">Como contribuir</h3>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Durante os cultos presenciais</li>
                <li>PIX — mais rápido</li>
                <li>Transferência bancária</li>
              </ul>
              <div className="pt-2">
                <Button size="lg" variant="secondary" asChild>
                  <a href="/auth">Contribuir Agora</a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <h3 className="text-xl font-semibold text-primary">PIX — Mais Rápido</h3>
              <div className="space-y-1 text-muted-foreground">
                <p><span className="font-medium">Chave PIX (CNPJ):</span> <span className="font-mono">10472815000127</span></p>
                <p><span className="font-medium">Beneficiário:</span> Comunidade Batista Nacional Kerigma</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <h3 className="text-xl font-semibold text-primary">Transferência Bancária</h3>
              <div className="space-y-1 text-muted-foreground">
                <p><span className="font-medium">Banco:</span> Banco do Brasil</p>
                <p><span className="font-medium">Agência:</span> 1234-5</p>
                <p><span className="font-medium">Conta Corrente:</span> 12345-6</p>
                <p><span className="font-medium">Beneficiário:</span> Comunidade Batista Nacional Kerigma</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <h3 className="text-xl font-semibold text-primary">Informações Importantes</h3>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Após a transferência, envie o comprovante via WhatsApp.</li>
                <li>Suas contribuições são utilizadas para a obra de Deus.</li>
                <li>Transparência financeira é nossa prioridade.</li>
                <li>Recibo disponível mediante solicitação.</li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </main>
    </PublicSiteLayout>
  );
};

export default PublicDizimosPage;
