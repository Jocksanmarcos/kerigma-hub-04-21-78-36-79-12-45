import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Heart, Baby } from "lucide-react";

export const WelcomeSection: React.FC = () => {
  return (
    <section className="py-24 bg-muted">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Comece por aqui.
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Queremos que você se sinta em casa desde o primeiro momento
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card Horários */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl text-primary">Nossos Horários</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-foreground">Culto Domingo</p>
                  <p className="text-muted-foreground">19h00</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Culto Terça</p>
                  <p className="text-muted-foreground">19h30</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Células</p>
                  <p className="text-muted-foreground">Durante a semana</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card O que Esperar */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl text-primary">O que Esperar</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  Ambiente acolhedor e familiar
                </p>
                <p className="text-muted-foreground">
                  Louvor contemporâneo
                </p>
                <p className="text-muted-foreground">
                  Mensagem bíblica relevante
                </p>
                <p className="text-muted-foreground">
                  Comunhão verdadeira
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card Para Seus Filhos */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center">
                <Baby className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl text-primary">Para Seus Filhos</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  Ministério Infantil
                </p>
                <p className="text-muted-foreground">
                  Atividades por idade
                </p>
                <p className="text-muted-foreground">
                  Ambiente seguro e divertido
                </p>
                <p className="text-muted-foreground">
                  Professores capacitados
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};