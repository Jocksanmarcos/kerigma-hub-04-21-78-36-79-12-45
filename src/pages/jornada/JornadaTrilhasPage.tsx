import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ArrowLeft } from 'lucide-react';

interface Trilha {
  id: string;
  slug: string | null;
  titulo: string | null;
  nome: string | null;
  descricao: string | null;
  ordem: number | null;
  ativo: boolean | null;
}

interface Curso {
  id: string;
  trilha_id: string | null;
  nome: string;
  descricao: string | null;
  slug: string | null;
  ordem: number | null;
  categoria: string | null;
  nivel: string | null;
  carga_horaria: number | null;
}

const LoadingGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <Card key={i}>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const JornadaTrilhasPage: React.FC = () => {
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Trilhas de Aprendizagem | Jornada de Crescimento';
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [trilhasRes, cursosRes] = await Promise.all([
        supabase.from('trilhas_formacao').select('id, slug, titulo, nome, descricao, ordem, ativo').order('ordem', { ascending: true }),
        supabase.from('cursos').select('id, trilha_id, nome, descricao, slug, ordem, categoria, nivel, carga_horaria').eq('ativo', true).order('ordem', { ascending: true }),
      ]);

      if (!trilhasRes.error && trilhasRes.data) setTrilhas(trilhasRes.data as any);
      if (!cursosRes.error && cursosRes.data) setCursos(cursosRes.data as any);
      setLoading(false);
    };
    fetchData();
  }, []);

  const cursosPorTrilha = useMemo(() => {
    const map: Record<string, Curso[]> = {};
    cursos.forEach((c) => {
      if (!c.trilha_id) return;
      if (!map[c.trilha_id]) map[c.trilha_id] = [];
      map[c.trilha_id].push(c);
    });
    return map;
  }, [cursos]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header com navegação */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/jornada')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Trilhas de Aprendizagem</h1>
            <p className="text-muted-foreground">Explore nossos cursos organizados por trilhas de formação.</p>
          </div>
        </div>

        {loading ? (
          <LoadingGrid />
        ) : (
          <div className="space-y-8">
            {trilhas.filter(t => t.ativo !== false).map((trilha) => (
              <section key={trilha.id} id={trilha.slug ?? undefined} className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-semibold">
                    {trilha.nome || trilha.titulo || 'Trilha de Formação'}
                  </h2>
                  {trilha.slug && (
                    <Badge variant="secondary">{trilha.slug}</Badge>
                  )}
                </div>
                {trilha.descricao && (
                  <p className="text-muted-foreground">{trilha.descricao}</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {(cursosPorTrilha[trilha.id] || []).map((curso) => (
                    <Card key={curso.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">{curso.nome}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {curso.descricao && (
                          <p className="text-sm text-muted-foreground line-clamp-3">{curso.descricao}</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {curso.categoria && <Badge variant="outline">{curso.categoria}</Badge>}
                          {curso.nivel && <Badge variant="secondary">{curso.nivel}</Badge>}
                          {curso.carga_horaria ? (
                            <Badge variant="outline">{curso.carga_horaria}h</Badge>
                          ) : null}
                        </div>
                        <div className="pt-2">
                          <Button asChild className="w-full">
                            <Link to={`/cursos?inscrever=${curso.id}`}>Ver detalhes</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {(cursosPorTrilha[trilha.id] || []).length === 0 && (
                    <div className="col-span-full">
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Nenhum curso disponível nesta trilha no momento.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default JornadaTrilhasPage;