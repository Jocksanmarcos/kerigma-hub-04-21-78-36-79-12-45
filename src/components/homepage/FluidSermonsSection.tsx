import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Clock, Calendar } from "lucide-react";

export const FluidSermonsSection: React.FC = () => {
  // Mock data - in a real app, this would come from your API
  const sermons = [
    {
      id: 1,
      title: "O Amor que Transforma",
      speaker: "Pastor João Silva",
      date: "2024-01-15",
      duration: "35 min",
      thumbnail: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Fé em Tempos Difíceis",
      speaker: "Pastora Maria Santos",
      date: "2024-01-08",
      duration: "42 min",
      thumbnail: "/placeholder.svg"
    },
    {
      id: 3,
      title: "Propósito e Chamado",
      speaker: "Pastor Carlos Lima",
      date: "2024-01-01",
      duration: "38 min",
      thumbnail: "/placeholder.svg"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Mensagens que Inspiram
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Acesse nossa biblioteca de sermões e seja edificado pela Palavra de Deus.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {sermons.map((sermon, index) => (
            <motion.div
              key={sermon.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-all group">
                <div className="relative">
                  <img 
                    src={sermon.thumbnail} 
                    alt={sermon.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <Button size="lg" className="rounded-full">
                      <Play className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {sermon.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">{sermon.speaker}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(sermon.date).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {sermon.duration}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center"
        >
          <Button variant="outline" size="lg">
            Ver todos os sermões
          </Button>
        </motion.div>
      </div>
    </section>
  );
};