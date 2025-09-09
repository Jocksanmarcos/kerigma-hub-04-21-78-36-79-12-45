import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  BookOpen, 
  Users, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Search,
  Filter,
  GraduationCap,
  PlayCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Curso {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  nivel: string;
  ativo: boolean;
  created_at: string;
  _count?: {
    modulos: number;
    matriculas: number;
  };
}

const JornadaCursosPage: React.FC = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadCursos();
  }, []);

  const loadCursos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cursos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to include counts (simplified for now)
      const cursosWithCounts = data?.map(curso => ({
        ...curso,
        _count: {
          modulos: 0, // Will be calculated separately
          matriculas: 0 // Will be calculated separately
        }
      })) || [];

      setCursos(cursosWithCounts);
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os cursos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCursos = cursos.filter(curso => {
    const matchesSearch = curso.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         curso.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategoria === 'all' || curso.categoria === filterCategoria;
    
    return matchesSearch && matchesCategory;
  });

  const handleDeleteCurso = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('cursos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Curso excluído com sucesso."
      });

      loadCursos();
    } catch (error) {
      console.error('Erro ao excluir curso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o curso.",
        variant: "destructive"
      });
    }
  };

  const stats = {
    totalCursos: cursos.length,
    cursosAtivos: cursos.filter(c => c.ativo).length,
    totalAlunos: cursos.reduce((acc, curso) => acc + (curso._count?.matriculas || 0), 0),
    totalModulos: cursos.reduce((acc, curso) => acc + (curso._count?.modulos || 0), 0)
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="h-8 w-8" />
              Gerenciar Cursos
            </h1>
            <p className="text-muted-foreground">
              Gerencie o conteúdo educacional da Jornada de Crescimento
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Novo Curso
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Curso</DialogTitle>
              </DialogHeader>
              {/* Course form will be implemented next */}
              <div className="p-4">
                <p>Formulário de criação será implementado...</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
              <p className="font-semibold text-muted-foreground">Total de Cursos</p>
              <p className="text-3xl font-bold">{stats.totalCursos}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <PlayCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="font-semibold text-muted-foreground">Cursos Ativos</p>
              <p className="text-3xl font-bold">{stats.cursosAtivos}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-blue-500" />
              <p className="font-semibold text-muted-foreground">Total de Alunos</p>
              <p className="text-3xl font-bold">{stats.totalAlunos}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 text-purple-500" />
              <p className="font-semibold text-muted-foreground">Total de Módulos</p>
              <p className="text-3xl font-bold">{stats.totalModulos}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Cursos Disponíveis</CardTitle>
            <CardDescription>
              Gerencie todos os cursos da plataforma de ensino
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cursos..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Categoria
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterCategoria('all')}>
                    Todas as categorias
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterCategoria('discipulado')}>
                    Discipulado
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterCategoria('lideranca')}>
                    Liderança
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterCategoria('ministerio')}>
                    Ministério
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Curso</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Módulos</TableHead>
                    <TableHead>Alunos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Carregando cursos...
                      </TableCell>
                    </TableRow>
                  ) : filteredCursos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Nenhum curso encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCursos.map((curso) => (
                      <TableRow key={curso.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-semibold">{curso.nome}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {curso.descricao}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {curso.categoria}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {curso.nivel}
                          </Badge>
                        </TableCell>
                        <TableCell>{curso._count?.modulos || 0}</TableCell>
                        <TableCell>{curso._count?.matriculas || 0}</TableCell>
                        <TableCell>
                          <Badge variant={curso.ativo ? "default" : "secondary"}>
                            {curso.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => navigate(`/admin/jornada/cursos/${curso.id}/aulas`)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar Aulas
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => navigate(`/cursos/${curso.id}`)}
                              >
                                <BookOpen className="h-4 w-4 mr-2" />
                                Visualizar Curso
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {/* TODO: Implement edit course */}}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar Curso
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteCurso(curso.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default JornadaCursosPage;