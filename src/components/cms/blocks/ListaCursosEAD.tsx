import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, GraduationCap, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CursoAPI {
  titulo: string;
  descricao_curta: string;
  imagem_url: string | null;
}

const ListaCursosEAD: React.FC<{ content?: any }> = ({ content }) => {
  const [cursos, setCursos] = useState<CursoAPI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCursos();
  }, []);

  async function loadCursos() {
    try {
      // Try Edge Function first
      const { data, error } = await supabase.functions.invoke('api-courses');
      
      if (error) {
        console.warn("Edge function error, fallback to direct query:", error);
        // Fallback to direct database query
        const { data: directData, error: directError } = await supabase
          .from('cursos')
          .select('id, nome, descricao, slug, ativo, ordem')
          .eq('ativo', true)
          .order('ordem', { ascending: true })
          .limit(12);
        
        if (directError) throw directError;
        
        const mappedData = (directData || []).map((c: any) => ({
          titulo: c.nome,
          descricao_curta: (c.descricao || "Curso de desenvolvimento espiritual e conhecimento bíblico").slice(0, 140),
          imagem_url: null,
        }));
        
        setCursos(mappedData);
        return;
      }

      setCursos(data || []);
    } catch (error) {
      console.error("Erro ao carregar cursos:", error);
      // Final fallback: empty array to show "no courses" message
      setCursos([]);
    } finally {
      setLoading(false);
    }
  }

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'iniciante': return 'bg-green-500';
      case 'intermediario': return 'bg-yellow-500';
      case 'avancado': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-5 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-16 bg-muted rounded mb-4"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-muted rounded w-16"></div>
                <div className="h-6 bg-muted rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (cursos.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum curso disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Cursos Disponíveis</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cursos.map((curso, index) => (
          <Card key={index} className="h-full flex flex-col hover:shadow-lg transition-shadow">
            {curso.imagem_url && (
              <div className="h-32 overflow-hidden">
                <img 
                  src={curso.imagem_url} 
                  alt={`Curso ${curso.titulo}`} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
            <CardHeader className="pb-3">
              <CardTitle className="text-base line-clamp-2">
                {curso.titulo}
              </CardTitle>
              <Badge variant="outline" className="w-fit text-xs">
                Curso EAD
              </Badge>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                {curso.descricao_curta || "Curso de desenvolvimento espiritual e conhecimento bíblico."}
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-primary">
                  <Star className="h-4 w-4" />
                  <span className="text-xs">Em Destaque</span>
                </div>
                
                <Button className="w-full" size="sm">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Inscrever-se
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-center pt-4">
        <Button variant="outline">
          Ver Todos os Cursos
        </Button>
      </div>
    </div>
  );
};

export default ListaCursosEAD;