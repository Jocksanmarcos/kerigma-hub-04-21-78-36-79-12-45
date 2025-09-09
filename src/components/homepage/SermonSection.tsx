import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

interface Sermon {
  id: string;
  title: string;
  description: string;
  date: string;
  speaker: string;
  thumbnail?: string;
  duration?: string;
}

export const SermonSection: React.FC = () => {
  const [latestSermons, setLatestSermons] = useState<Sermon[]>([
    {
      id: "1",
      title: "O Amor que Transforma",
      description: "Uma reflexão sobre como o amor de Deus transforma vidas e relacionamentos.",
      date: "2024-01-14",
      speaker: "Pastor João Silva",
      duration: "35 min"
    },
    {
      id: "2", 
      title: "Fé em Tempos Difíceis",
      description: "Como manter a fé quando enfrentamos desafios e adversidades.",
      date: "2024-01-07",
      speaker: "Pastora Maria Santos",
      duration: "42 min"
    }
  ]);

  return (
    <section className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Nossa Mensagem
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Palavras que edificam, inspiram e transformam vidas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {latestSermons.map((sermon) => (
            <Card key={sermon.id} className="border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-primary mb-2 group-hover:text-primary/80 transition-colors">
                      {sermon.title}
                    </CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(sermon.date).toLocaleDateString('pt-BR', { 
                        day: 'numeric', 
                        month: 'long',
                        year: 'numeric'
                      })}
                      {sermon.duration && (
                        <span className="ml-4">• {sermon.duration}</span>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="ml-4 text-primary hover:bg-primary/10">
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {sermon.description}
                </p>
                <p className="text-sm font-medium text-primary">
                  {sermon.speaker}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" variant="outline" className="px-8" asChild>
            <Link to="/mensagens">Ver Todas as Mensagens</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};