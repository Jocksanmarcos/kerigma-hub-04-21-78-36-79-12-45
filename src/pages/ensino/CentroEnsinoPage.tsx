import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import { ensinoAI } from '@/lib/ensinoAI';
import { AppLayout } from '@/components/layout/AppLayout';
import EnsinoOverviewCards from '@/components/ensino/dashboard/EnsinoOverviewCards';
import ContinueCourseCard from '@/components/ensino/ContinueCourseCard';
import CertificatesCard from '@/components/ensino/CertificatesCard';
import RecommendedTracks from '@/components/ensino/RecommendedTracks';

// Minimal SEO helpers without extra deps
const setMeta = (name: string, content: string) => {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const setCanonical = (href: string) => {
  let link = document.querySelector("link[rel='canonical']");
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
};

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

const CentroEnsinoPage: React.FC = () => {
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string>('');
  const [aiSummary, setAiSummary] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  useEffect(() => {
    document.title = 'Centro de Ensino | Kerigma Hub';
    setMeta('description', 'Centro de Ensino: trilhas de formação, cursos e progresso.');
    setCanonical(window.location.origin + '/ensino');
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Ensino</h1>
          <p className="text-muted-foreground">Explore trilhas e cursos disponíveis para seu crescimento.</p>
        </div>
        <div className="space-y-8">
        <EnsinoOverviewCards 
          cursosDisponiveis={cursos.length}
          matriculasAtivas={0} // TODO: Integrar com dados reais de matrículas
          certificadosObtidos={0} // TODO: Integrar com dados reais de certificados
          horasEstudadas={0} // TODO: Integrar com dados reais de progresso
          progressoGeral={0} // TODO: Integrar com dados reais de progresso
          proximasAulas={0} // TODO: Integrar com dados de agenda
        />

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ContinueCourseCard cursos={cursos} />
          <CertificatesCard />
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Assistente de Estudos (IA)</h2>
          <p className="text-muted-foreground text-sm">Faça uma pergunta sobre os cursos ou gere um resumo.</p>
          <div className="space-y-3">
            <Textarea
              placeholder="Escreva sua pergunta..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="flex gap-3">
              <Button
                disabled={aiLoading || !question.trim()}
                onClick={async () => {
                  try {
                    setAiLoading(true);
                    const content = await ensinoAI({ type: 'qna', question, trilhas, cursos });
                    setAiAnswer(content);
                    setAiSummary('');
                  } finally {
                    setAiLoading(false);
                  }
                }}
              >
                {aiLoading ? 'Processando...' : 'Perguntar'}
              </Button>
              <Button
                variant="secondary"
                disabled={aiLoading}
                onClick={async () => {
                  try {
                    setAiLoading(true);
                    const content = await ensinoAI({ type: 'summary', trilhas, cursos });
                    setAiSummary(content);
                    setAiAnswer('');
                  } finally {
                    setAiLoading(false);
                  }
                }}
              >
                {aiLoading ? 'Gerando...' : 'Gerar resumo da página'}
              </Button>
            </div>
            {(aiAnswer || aiSummary) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resposta</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap text-sm">
                    {aiAnswer || aiSummary}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {loading ? (
          <LoadingGrid />
        ) : (
          <section className="space-y-6">
            <RecommendedTracks trilhas={trilhas} cursosPorTrilha={cursosPorTrilha} />
            {trilhas.filter(t => t.ativo !== false).map((trilha) => (
              <article key={trilha.id} id={trilha.slug ?? undefined} className="space-y-3">
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
                    <Card key={curso.id}>
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
                          <Button asChild>
                            <Link to={`/cursos?inscrever=${curso.id}`}>Ver detalhes</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {(cursosPorTrilha[trilha.id] || []).length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhum curso disponível nesta trilha.</p>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </div>

      {/* JSON-LD basic for collection of courses */}
      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Centro de Ensino',
          itemListElement: trilhas.map((t, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: t.nome || t.titulo,
            url: t.slug ? `${window.location.origin}/ensino#${t.slug}` : undefined,
          })),
        })}
      </script>
      </div>
    </AppLayout>
  );
};

export default CentroEnsinoPage;
