import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users } from "lucide-react";

export const DynamicEventsSection: React.FC = () => {
  // Mock data - in a real app, this would come from your API
  const events = [
    {
      id: 1,
      title: "Culto de Celebração",
      description: "Um tempo especial de louvor e adoração em família.",
      date: "2024-01-28",
      time: "19:00",
      location: "Auditório Principal",
      attendees: 150,
      type: "Culto",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Encontro de Casais",
      description: "Uma noite especial para fortalecer relacionamentos.",
      date: "2024-02-03",
      time: "19:30",
      location: "Salão de Eventos",
      attendees: 40,
      type: "Encontro",
      image: "/placeholder.svg"
    },
    {
      id: 3,
      title: "Escola Bíblica Dominical",
      description: "Estudo da Palavra para toda a família.",
      date: "2024-01-29",
      time: "09:00",
      location: "Salas de Aula",
      attendees: 80,
      type: "Estudo",
      image: "/placeholder.svg"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Próximos Eventos
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Participe dos nossos encontros e fortaleça sua caminhada de fé em comunidade.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="relative">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-4 left-4">
                    {event.type}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">
                    {event.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.date).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {event.attendees} participantes
                    </div>
                  </div>

                  <Button className="w-full">
                    Participar
                  </Button>
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
            Ver todos os eventos
          </Button>
        </motion.div>
      </div>
    </section>
  );
};