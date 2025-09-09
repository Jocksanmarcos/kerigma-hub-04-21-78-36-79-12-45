import React from "react";
import { DynamicPageRenderer } from "@/components/cms/DynamicPageRenderer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, CreditCard, QrCode, Banknote } from "lucide-react";

const PublicDizimosPageDynamic: React.FC = () => {
  return (
    <DynamicPageRenderer
      slug="dizimos"
      defaultTitle="Dízimos e Ofertas"
      defaultDescription="Contribua com os dízimos e ofertas da nossa igreja de forma segura e prática."
      defaultHeroTitle="Dízimos e Ofertas"
      defaultHeroSubtitle="Contribua com nossa missão e participe da obra de Deus"
      fallbackContent={
        <div className="space-y-12">
          {/* Explicação sobre dízimos */}
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl md:text-3xl flex items-center justify-center gap-2">
                <Heart className="h-6 w-6 text-primary" />
                Por que contribuir?
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="prose prose-lg max-w-none space-y-4">
                <p>
                  O dízimo é uma expressão de gratidão a Deus e confiança em Sua provisão. 
                  Através das suas contribuições, conseguimos manter e expandir os ministérios da igreja.
                </p>
                <p>
                  <strong>Malaquias 3:10</strong> - "Tragam o dízimo todo ao depósito do templo, 
                  para que haja alimento em minha casa. Ponham-me à prova, diz o Senhor dos Exércitos, 
                  e vejam se não vou abrir as comportas dos céus e derramar sobre vocês tantas bênçãos 
                  que nem tenham onde guardá-las."
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Formas de contribuir */}
          <div>
            <h2 className="text-3xl font-bold text-center mb-8">Formas de Contribuir</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <QrCode className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">PIX</h3>
                  <p className="text-muted-foreground mb-4">Forma rápida e segura</p>
                  <div className="bg-muted p-3 rounded text-sm font-mono">
                    cbnkerigma@gmail.com
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Transferência</h3>
                  <p className="text-muted-foreground mb-4">Banco do Brasil</p>
                  <div className="bg-muted p-3 rounded text-sm space-y-1">
                    <div>Ag: 1234-5</div>
                    <div>CC: 12345-6</div>
                    <div>CNPJ: 12.345.678/0001-90</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Banknote className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Presencial</h3>
                  <p className="text-muted-foreground mb-4">Durante os cultos e células</p>
                  <Button variant="outline" className="w-full">
                    Encontrar Célula
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Transparência */}
          <Card className="bg-muted/30">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Transparência</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Acreditamos na transparência financeira. Relatórios de prestação de contas 
                são disponibilizados regularmente para toda a comunidade.
              </p>
            </CardContent>
          </Card>
        </div>
      }
    />
  );
};

export default PublicDizimosPageDynamic;