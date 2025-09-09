import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Clock, Users, Star, Search, Filter } from 'lucide-react';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';
import { useToast } from '@/hooks/use-toast';

export const CoursesCatalog: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [matriculas, setMatriculas] = useState<any[]>([]);
  const { pessoa } = useCurrentPerson();
  const { toast } = useToast();

  useEffect(() => {
    loadCourses();
    if (pessoa) {
      loadMatriculas();
    }
  }, [pessoa]);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, selectedCategory]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cursos')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMatriculas = async () => {
    if (!pessoa) return;
    
    try {
      const { data, error } = await supabase
        .from('matriculas')
        .select('curso_id, status')
        .eq('pessoa_id', pessoa.id);

      if (error) throw error;
      setMatriculas(data || []);
    } catch (error) {
      console.error('Erro ao carregar matrículas:', error);
    }
  };

  const handleInscricao = async (cursoId: string) => {
    if (!pessoa) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para se inscrever.",
        variant: "destructive"
      });
      return;
    }

    // Verificar se já está matriculado
    const jaMatriculado = matriculas.some(m => m.curso_id === cursoId);
    if (jaMatriculado) {
      toast({
        title: "Atenção",
        description: "Você já está matriculado neste curso.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('matriculas')
        .insert({
          pessoa_id: pessoa.id,
          curso_id: cursoId,
          status: 'ativa',
          data_matricula: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Matrícula realizada com sucesso.",
      });

      // Recarregar matrículas
      loadMatriculas();
    } catch (error) {
      console.error('Erro ao se inscrever:', error);
      toast({
        title: "Erro",
        description: "Não foi possível realizar a matrícula. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const isEnrolled = (cursoId: string) => {
    return matriculas.some(m => m.curso_id === cursoId);
  };

  const filterCourses = () => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.descricao && course.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'todos') {
      filtered = filtered.filter(course => course.categoria === selectedCategory);
    }

    setFilteredCourses(filtered);
  };

  const categories = [
    { id: 'todos', name: 'Todos os Cursos', count: courses.length },
    { id: 'discipulado', name: 'Discipulado', count: courses.filter(c => c.categoria === 'discipulado').length },
    { id: 'lideranca', name: 'Liderança', count: courses.filter(c => c.categoria === 'lideranca').length },
    { id: 'evangelismo', name: 'Evangelismo', count: courses.filter(c => c.categoria === 'evangelismo').length },
    { id: 'ministerio', name: 'Ministério', count: courses.filter(c => c.categoria === 'ministerio').length }
  ];

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case 'discipulado': return 'bg-primary/10 text-primary border-primary/20';
      case 'lideranca': return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'evangelismo': return 'bg-success/10 text-success border-success/20';
      case 'ministerio': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getLevelColor = (nivel: string) => {
    switch (nivel?.toLowerCase()) {
      case 'iniciante': return 'text-success';
      case 'intermediario': return 'text-warning';
      case 'avancado': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Cursos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-muted rounded mb-4"></div>
                <div className="h-8 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Catálogo de Cursos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filtros e Busca */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-5">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="text-xs">
                  {category.name}
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {category.count}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Lista de Cursos */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-kerigma-md transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <Badge variant="outline" className={getCategoryColor(course.categoria)}>
                    {course.categoria}
                  </Badge>
                  {course.destaque && (
                    <Badge variant="default" className="bg-secondary text-secondary-foreground">
                      <Star className="h-3 w-3 mr-1" />
                      Destaque
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg leading-tight">{course.nome}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {course.descricao || 'Desenvolva seus conhecimentos e cresça na fé através deste curso abrangente.'}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.carga_horaria || 8}h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>42 alunos</span>
                  </div>
                  <span className={`font-medium ${getLevelColor(course.nivel)}`}>
                    {course.nivel || 'Iniciante'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current text-warning" />
                    <span className="text-sm font-medium">4.8</span>
                    <span className="text-sm text-muted-foreground">(124)</span>
                  </div>
                  {isEnrolled(course.id) ? (
                    <Button size="sm" variant="outline" disabled>
                      Matriculado
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      className="bg-primary hover:bg-primary/90"
                      onClick={() => handleInscricao(course.id)}
                    >
                      Inscrever-se
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum curso encontrado</h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? 'Tente ajustar sua busca ou explorar outras categorias.'
                : 'Não há cursos disponíveis nesta categoria no momento.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};