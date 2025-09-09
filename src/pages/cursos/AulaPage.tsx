import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Play,
  ArrowRight,
  Clock,
  BookOpen
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';
import { ConcluirCursoButton } from '@/components/jornada/ConcluirCursoButton';
import { useToast } from '@/hooks/use-toast';

interface Curso {
  id: string;
  nome: string;
  categoria: string | null;
}

interface Aula {
  id: string;
  titulo: string;
  conteudo: string;
  ordem: number;
  duracao_minutos: number;
}

const AulaPage: React.FC = () => {
  const { cursoId, aulaId } = useParams<{ cursoId: string; aulaId: string }>();
  const { pessoa } = useCurrentPerson();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [curso, setCurso] = useState<Curso | null>(null);
  const [aula, setAula] = useState<Aula | null>(null);
  const [loading, setLoading] = useState(true);
  const [aulaConcluida, setAulaConcluida] = useState(false);
  const [todasAulasConcluidas, setTodasAulasConcluidas] = useState(false);

  // Simular aulas do curso
  const aulasSimuladas: Aula[] = [
    { 
      id: '1', 
      titulo: 'Introdução ao Curso', 
      ordem: 1, 
      duracao_minutos: 15,
      conteudo: `
        <h2>Bem-vindo ao curso!</h2>
        <p>Nesta primeira aula, vamos apresentar os objetivos e a estrutura do curso.</p>
        
        <h3>O que você vai aprender:</h3>
        <ul>
          <li>Fundamentos teóricos importantes</li>
          <li>Aplicações práticas do conhecimento</li>
          <li>Como aplicar na vida diária</li>
        </ul>
        
        <h3>Estrutura do Curso:</h3>
        <p>O curso está dividido em 5 módulos principais, cada um com exercícios práticos e reflexões.</p>
        
        <blockquote>
          "O conhecimento não é apenas informação, mas transformação." - Provérbios
        </blockquote>
      `
    },
    { 
      id: '2', 
      titulo: 'Fundamentos Bíblicos', 
      ordem: 2, 
      duracao_minutos: 25,
      conteudo: `
        <h2>Explorando os Fundamentos</h2>
        <p>Nesta aula, vamos mergulhar nos princípios fundamentais que baseiam todo o nosso estudo.</p>
        
        <h3>Principais Conceitos:</h3>
        <ul>
          <li>Contexto histórico e cultural</li>
          <li>Interpretação correta das Escrituras</li>
          <li>Aplicação contemporânea</li>
        </ul>
        
        <h3>Reflexão:</h3>
        <p>Como estes fundamentos se aplicam à sua vida pessoal e ministério?</p>
      `
    },
    { 
      id: '3', 
      titulo: 'Aplicação Prática', 
      ordem: 3, 
      duracao_minutos: 30,
      conteudo: `
        <h2>Colocando em Prática</h2>
        <p>Agora vamos ver como aplicar o que aprendemos nas aulas anteriores.</p>
        
        <h3>Exercícios Práticos:</h3>
        <ol>
          <li>Identifique uma situação em sua vida onde pode aplicar este conhecimento</li>
          <li>Elabore um plano de ação</li>
          <li>Estabeleça marcos de progresso</li>
        </ol>
        
        <h3>Estudo de Caso:</h3>
        <p>Vamos analisar exemplos reais de aplicação destes princípios.</p>
      `
    },
    { 
      id: '4', 
      titulo: 'Exercícios e Reflexões', 
      ordem: 4, 
      duracao_minutos: 20,
      conteudo: `
        <h2>Tempo de Reflexão</h2>
        <p>Esta aula é dedicada ao aprofundamento através de exercícios dirigidos.</p>
        
        <h3>Perguntas para Reflexão:</h3>
        <ul>
          <li>O que mais impactou você neste curso?</li>
          <li>Quais mudanças pretende implementar?</li>
          <li>Como vai manter a consistência na aplicação?</li>
        </ul>
        
        <h3>Exercício Final:</h3>
        <p>Prepare um resumo pessoal dos principais aprendizados e compromissos assumidos.</p>
      `
    },
    { 
      id: '5', 
      titulo: 'Conclusão e Próximos Passos', 
      ordem: 5, 
      duracao_minutos: 15,
      conteudo: `
        <h2>Parabéns pela Jornada!</h2>
        <p>Você chegou ao final do curso. Agora é hora de consolidar o aprendizado.</p>
        
        <h3>Principais Realizações:</h3>
        <ul>
          <li>Domínio dos conceitos fundamentais</li>
          <li>Desenvolvimento de habilidades práticas</li>
          <li>Criação de um plano de aplicação</li>
        </ul>
        
        <h3>Próximos Passos:</h3>
        <ol>
          <li>Continue praticando o que aprendeu</li>
          <li>Compartilhe o conhecimento com outros</li>
          <li>Explore cursos avançados relacionados</li>
        </ol>
        
        <p><strong>Lembre-se:</strong> O aprendizado é uma jornada contínua!</p>
      `
    }
  ];

  useEffect(() => {
    if (cursoId && aulaId && pessoa) {
      loadAulaData();
    }
  }, [cursoId, aulaId, pessoa]);

  const loadAulaData = async () => {
    if (!cursoId || !aulaId || !pessoa) return;

    try {
      // Carregar dados do curso
      const { data: cursoData, error: cursoError } = await supabase
        .from('cursos')
        .select('id, nome, categoria')
        .eq('id', cursoId)
        .single();

      if (cursoError) throw cursoError;
      setCurso(cursoData);

      // Encontrar a aula simulada
      const aulaEncontrada = aulasSimuladas.find(a => a.id === aulaId);
      if (aulaEncontrada) {
        setAula(aulaEncontrada);
        
        // Verificar se é a última aula
        const ultimaAula = aulaEncontrada.ordem === aulasSimuladas.length;
        setTodasAulasConcluidas(ultimaAula);
      }

    } catch (error) {
      console.error('Erro ao carregar aula:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConcluirAula = async () => {
    if (!aula || !pessoa || !cursoId) return;

    try {
      // Registrar atividade de estudo
      await supabase.from('atividades_estudo').insert({
        pessoa_id: pessoa.id,
        tipo_atividade: 'aula_completa',
        curso_id: cursoId,
        duracao_minutos: aula.duracao_minutos,
        data_atividade: new Date().toISOString().split('T')[0]
      });

      // Atualizar matrícula com progresso
      const novoProgresso = Math.round((aula.ordem / aulasSimuladas.length) * 100);
      await supabase
        .from('matriculas')
        .update({
          frequencia_percentual: novoProgresso
        })
        .eq('curso_id', cursoId)
        .eq('pessoa_id', pessoa.id);

      setAulaConcluida(true);
      
      toast({
        title: "Aula concluída!",
        description: `Você ganhou conhecimento e progrediu no curso.`,
      });

      // Se for a última aula, redirecionar para a página do curso
      if (todasAulasConcluidas) {
        setTimeout(() => {
          navigate(`/cursos/${cursoId}`);
        }, 2000);
      }

    } catch (error) {
      console.error('Erro ao concluir aula:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar a aula como concluída.",
        variant: "destructive"
      });
    }
  };

  const getProximaAula = () => {
    if (!aula) return null;
    return aulasSimuladas.find(a => a.ordem === aula.ordem + 1);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="h-96 bg-muted animate-pulse rounded" />
        </div>
      </AppLayout>
    );
  }

  if (!curso || !aula) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Aula não encontrada</h1>
          <Button asChild>
            <Link to="/cursos">Voltar aos Cursos</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const proximaAula = getProximaAula();

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link to={`/cursos/${cursoId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Curso
              </Link>
            </Button>
            <div>
              <p className="text-sm text-muted-foreground">{curso.nome}</p>
              <h1 className="text-xl font-semibold">{aula.titulo}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline">{curso.categoria}</Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {aula.duracao_minutos} min
            </div>
          </div>
        </div>

        {/* Progresso */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span>Progresso no curso</span>
              <span>Aula {aula.ordem} de {aulasSimuladas.length}</span>
            </div>
            <Progress value={(aula.ordem / aulasSimuladas.length) * 100} className="h-2" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Conteúdo da Aula */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {aula.titulo}
                </CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: aula.conteudo }} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar de Ações */}
          <div className="space-y-6">
            {!aulaConcluida ? (
              <Card>
                <CardHeader>
                  <CardTitle>Concluir Aula</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Marque esta aula como concluída para continuar.
                  </p>
                  <Button onClick={handleConcluirAula} className="w-full" size="lg">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Marcar como Concluída
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      Aula Concluída!
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Parabéns! Você concluiu esta aula.
                    </p>
                    
                    {proximaAula ? (
                      <Button asChild className="w-full" size="lg">
                        <Link to={`/cursos/${cursoId}/aula/${proximaAula.id}`}>
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Próxima Aula
                        </Link>
                      </Button>
                    ) : todasAulasConcluidas ? (
                      <div className="space-y-3">
                        <p className="text-sm text-green-600 font-medium">
                          🎉 Você concluiu todas as aulas!
                        </p>
                        <ConcluirCursoButton 
                          cursoId={cursoId}
                          cursoNome={curso.nome}
                          className="w-full"
                        />
                      </div>
                    ) : (
                      <Button asChild variant="outline" className="w-full">
                        <Link to={`/cursos/${cursoId}`}>
                          Ver Curso Completo
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Informações da Aula */}
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duração</span>
                  <span className="font-medium">{aula.duracao_minutos} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ordem</span>
                  <span className="font-medium">{aula.ordem}ª aula</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Categoria</span>
                  <span className="font-medium">{curso.categoria}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AulaPage;