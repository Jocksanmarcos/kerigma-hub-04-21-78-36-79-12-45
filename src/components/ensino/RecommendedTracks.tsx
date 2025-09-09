import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Trilha {
  id: string;
  slug: string | null;
  titulo: string | null;
  nome: string | null;
  descricao: string | null;
  ativo?: boolean | null;
}

interface Curso {
  id: string;
  trilha_id: string | null;
}

interface Props {
  trilhas: Trilha[];
  cursosPorTrilha: Record<string, Curso[]>;
}

const RecommendedTracks: React.FC<Props> = ({ trilhas, cursosPorTrilha }) => {
  const list = trilhas.filter((t) => t.ativo !== false).slice(0, 3);

  if (list.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">Trilhas recomendadas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map((t) => (
          <Card key={t.id}>
            <CardHeader>
              <CardTitle className="text-base">
                <a href={t.slug ? `#${t.slug}` : undefined} className="hover:underline">
                  {t.nome || t.titulo || 'Trilha'}
                </a>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {t.descricao && (
                <p className="text-sm text-muted-foreground line-clamp-2">{t.descricao}</p>
              )}
              <div className="pt-2">
                <Badge variant="secondary">
                  {(cursosPorTrilha[t.id] || []).length} curso(s)
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default RecommendedTracks;
