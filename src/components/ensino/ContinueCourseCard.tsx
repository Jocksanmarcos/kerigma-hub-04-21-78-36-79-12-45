import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

interface Curso {
  id: string;
  nome: string;
  descricao: string | null;
}

interface Props {
  cursos: Curso[];
}

const ContinueCourseCard: React.FC<Props> = ({ cursos }) => {
  const course = useMemo(() => cursos?.[0], [cursos]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Continuar curso</CardTitle>
        <BookOpen className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-2">
        {course ? (
          <>
            <div className="text-lg font-semibold">{course.nome}</div>
            {course.descricao && (
              <p className="text-sm text-muted-foreground line-clamp-2">{course.descricao}</p>
            )}
            <Button asChild className="mt-2">
              <Link to={`/cursos?inscrever=${course.id}`}>Retomar</Link>
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">Você ainda não tem cursos para continuar.</p>
            <Button asChild className="mt-2" variant="secondary">
              <Link to="/cursos">Explorar cursos</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ContinueCourseCard;
