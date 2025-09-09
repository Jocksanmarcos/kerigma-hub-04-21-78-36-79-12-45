import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, Clock, BookOpen, PlayCircle, CheckCircle, 
  Star, Users, Calendar, ArrowRight 
} from 'lucide-react';

interface PlanoDeLeitura {
  id: string;
  titulo: string;
  descricao: string;
  duracao_dias: number;
  categoria: string;
  dificuldade: 'iniciante' | 'intermediario' | 'avancado';
  progresso?: number;
  iniciado?: boolean;
  concluido?: boolean;
  participantes?: number;
  rating?: number;
  destaque?: boolean;
}

const planosDisponiveis: PlanoDeLeitura[] = [
  {
    id: '1',
    titulo: 'Vida de Cristo em 40 Dias',
    descricao: 'Acompanhe a jornada de Jesus desde o nascimento até a ressurreição através dos evangelhos',
    duracao_dias: 40,
    categoria: 'Evangelhos',
    dificuldade: 'iniciante',
    participantes: 245,
    rating: 4.8,
    destaque: true,
    progresso: 65,
    iniciado: true
  },
  {
    id: '2',
    titulo: 'Sabedoria de Provérbios',
    descricao: 'Um provérbio por dia para aplicar sabedoria prática na vida diária',
    duracao_dias: 31,
    categoria: 'Sabedoria',
    dificuldade: 'iniciante',
    participantes: 189,
    rating: 4.6
  },
  {
    id: '3',
    titulo: 'Salmos de Louvor e Adoração',
    descricao: 'Fortaleça sua vida devocional com os salmos mais inspiradores',
    duracao_dias: 21,
    categoria: 'Adoração',
    dificuldade: 'iniciante',
    participantes: 156,
    rating: 4.9
  },
  {
    id: '4',
    titulo: 'Cartas de Paulo: Teologia Prática',
    descricao: 'Estude as principais epístolas paulinas e sua aplicação hoje',
    duracao_dias: 60,
    categoria: 'Doutrina',
    dificuldade: 'intermediario',
    participantes: 98,
    rating: 4.7
  },
  {
    id: '5',
    titulo: 'Grandes Narrativas do AT',
    descricao: 'Histórias que ensinam sobre fé, obediência e caráter',
    duracao_dias: 50,
    categoria: 'História',
    dificuldade: 'intermediario',
    participantes: 134,
    rating: 4.5
  },
  {
    id: '6',
    titulo: 'Profecias Messiânicas',
    descricao: 'Compreenda as profecias sobre Cristo no Antigo Testamento',
    duracao_dias: 35,
    categoria: 'Profecias',
    dificuldade: 'avancado',
    participantes: 67,
    rating: 4.8
  },
  {
    id: '7',
    titulo: 'Apocalipse Desvendado',
    descricao: 'Estudo sistemático do livro do Apocalipse',
    duracao_dias: 45,
    categoria: 'Profecias',
    dificuldade: 'avancado',
    participantes: 89,
    rating: 4.4
  },
  {
    id: '8',
    titulo: 'Mulheres da Bíblia',
    descricao: 'Histórias inspiradoras de mulheres de fé',
    duracao_dias: 28,
    categoria: 'Biografias',
    dificuldade: 'iniciante',
    participantes: 201,
    rating: 4.9
  }
];

export const CatalogoPlanosLeitura: React.FC = () => {
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [filtroDificuldade, setFiltroDificuldade] = useState<string>('todos');
  const [planosAtivos] = useState<string[]>(['1']); // Simular plano ativo

  const categorias = [...new Set(planosDisponiveis.map(p => p.categoria))];
  const dificuldades = ['iniciante', 'intermediario', 'avancado'];

  const planosFiltrados = planosDisponiveis.filter(plano => {
    const passaCategoria = filtroCategoria === 'todos' || plano.categoria === filtroCategoria;
    const passaDificuldade = filtroDificuldade === 'todos' || plano.dificuldade === filtroDificuldade;
    return passaCategoria && passaDificuldade;
  });

  const planosEmDestaque = planosFiltrados.filter(p => p.destaque);
  const planosRegulares = planosFiltrados.filter(p => !p.destaque);

  const iniciarPlano = (planoId: string) => {
    console.log('Iniciar plano:', planoId);
    // Implementar lógica para iniciar plano
  };

  const getCategoriaColor = (categoria: string) => {
    const colors: Record<string, string> = {
      'Evangelhos': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Sabedoria': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Adoração': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Doutrina': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'História': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Profecias': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Biografias': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    };
    return colors[categoria] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const getDificuldadeColor = (dificuldade: string) => {
    const colors: Record<string, string> = {
      'iniciante': 'bg-green-100 text-green-700 border-green-200',
      'intermediario': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'avancado': 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[dificuldade] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const renderEstrelas = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Planos de Leitura Bíblica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <select 
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm bg-background"
              >
                <option value="todos">Todas as categorias</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Dificuldade</label>
              <select 
                value={filtroDificuldade}
                onChange={(e) => setFiltroDificuldade(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm bg-background"
              >
                <option value="todos">Todas as dificuldades</option>
                {dificuldades.map(dif => (
                  <option key={dif} value={dif}>
                    {dif.charAt(0).toUpperCase() + dif.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Planos em Destaque */}
      {planosEmDestaque.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Planos em Destaque
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {planosEmDestaque.map((plano) => (
              <Card key={plano.id} className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <Badge className={getCategoriaColor(plano.categoria)}>
                        {plano.categoria}
                      </Badge>
                      <CardTitle className="text-lg">{plano.titulo}</CardTitle>
                    </div>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      <Star className="h-3 w-3 mr-1" />
                      Destaque
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{plano.descricao}</p>
                  
                  {plano.progresso && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-primary font-medium">Seu progresso</span>
                        <span>{plano.progresso}%</span>
                      </div>
                      <Progress value={plano.progresso} className="h-2" />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {plano.duracao_dias} dias
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {plano.participantes}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {renderEstrelas(plano.rating || 0)}
                      <span className="text-xs text-muted-foreground ml-1">
                        ({plano.rating})
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={getDificuldadeColor(plano.dificuldade)}
                    >
                      {plano.dificuldade.charAt(0).toUpperCase() + plano.dificuldade.slice(1)}
                    </Badge>
                    
                    <Button 
                      onClick={() => iniciarPlano(plano.id)}
                      className="ml-auto"
                      size="sm"
                    >
                      {plano.iniciado ? 'Continuar' : 'Iniciar Plano'}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Todos os Planos */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Todos os Planos ({planosRegulares.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {planosRegulares.map((plano) => (
            <Card key={plano.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="space-y-2">
                  <Badge className={getCategoriaColor(plano.categoria)}>
                    {plano.categoria}
                  </Badge>
                  <CardTitle className="text-lg">{plano.titulo}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{plano.descricao}</p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {plano.duracao_dias} dias
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {plano.participantes}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {renderEstrelas(plano.rating || 0)}
                    <span className="text-xs text-muted-foreground ml-1">
                      ({plano.rating})
                    </span>
                  </div>
                  
                  <Badge 
                    variant="outline" 
                    className={getDificuldadeColor(plano.dificuldade)}
                  >
                    {plano.dificuldade.charAt(0).toUpperCase() + plano.dificuldade.slice(1)}
                  </Badge>
                </div>
                
                <Button 
                  onClick={() => iniciarPlano(plano.id)}
                  className="w-full"
                  size="sm"
                  variant={planosAtivos.includes(plano.id) ? "default" : "outline"}
                >
                  {planosAtivos.includes(plano.id) ? (
                    <>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Continuar
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Iniciar Plano
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Criar Plano Personalizado */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Target className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Plano Personalizado</h3>
          <p className="text-muted-foreground text-center max-w-md mb-4">
            Crie seu próprio plano de leitura baseado em suas necessidades específicas
          </p>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Criar Plano
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};