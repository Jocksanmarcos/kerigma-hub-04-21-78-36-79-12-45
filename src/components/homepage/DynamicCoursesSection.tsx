import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Users, Star } from "lucide-react";

export const DynamicCoursesSection: React.FC = () => {
  // Mock data - in a real app, this would come from your API
  const courses = [
    {
      id: 1,
      title: "Fundamentos da Fé",
      description: "Um curso introdutório para novos convertidos e aqueles que desejam fortalecer seus alicerces.",
      instructor: "Pastor João Silva",
      duration: "8 semanas",
      participants: 45,
      rating: 4.9,
      level: "Iniciante",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Liderança Cristã",
      description: "Desenvolva habilidades de liderança baseadas nos princípios bíblicos.",
      instructor: "Pastora Maria Santos",
      duration: "12 semanas",
      participants: 28,
      rating: 4.8,
      level: "Intermediário",
      image: "/placeholder.svg"
    },
    {
      id: 3,
      title: "Estudo de Apocalipse",
      description: "Uma jornada profunda através do último livro da Bíblia.",
      instructor: "Pastor Carlos Lima",
      duration: "16 semanas",
      participants: 32,
      rating: 4.7,
      level: "Avançado",
      image: "/placeholder.svg"
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Iniciante': return 'bg-green-500';
      case 'Intermediário': return 'bg-yellow-500';
      case 'Avançado': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

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
            Cursos de Crescimento
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Aprenda e cresça através dos nossos cursos cuidadosamente estruturados.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow group h-full">
                <div className="relative">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className={`absolute top-4 left-4 ${getLevelColor(course.level)} text-white`}>
                    {course.level}
                  </Badge>
                </div>
                <CardContent className="p-6 flex flex-col h-full">
                  <h3 className="font-semibold text-lg mb-2">
                    {course.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 flex-grow line-clamp-3">
                    {course.description}
                  </p>
                  <p className="text-sm font-medium mb-4">
                    Por: {course.instructor}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {course.duration}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {course.participants} alunos
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Material incluso
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {course.rating}
                    </div>
                  </div>

                  <Button className="w-full mt-auto">
                    Inscrever-se
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
            Ver todos os cursos
          </Button>
        </motion.div>
      </div>
    </section>
  );
};