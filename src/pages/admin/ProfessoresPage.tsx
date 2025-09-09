import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GraduationCap, Search, Plus, Mail, Phone, MapPin, Award } from 'lucide-react';

const ProfessoresPage: React.FC = () => {
  const [filtro, setFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [professorSelecionado, setProfessorSelecionado] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  React.useEffect(() => {
    document.title = "Professores – Kerigma Hub";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Gestão de professores e instrutores");
  }, []);

  const [professores, setProfessores] = useState([
    {
      id: 1,
      nome: "Pastor João Silva",
      email: "joao.silva@igreja.com",
      telefone: "(11) 99999-0001",
      especialidades: ["Liderança", "Teologia", "Discipulado"],
      cursos: 8,
      alunos: 156,
      status: "ativo",
      formacao: "Bacharel em Teologia",
      experiencia: "15 anos",
      nota: 4.8
    },
    {
      id: 2,
      nome: "Ev. Maria Santos",
      email: "maria.santos@igreja.com",
      telefone: "(11) 99999-0002",
      especialidades: ["Evangelismo", "Missões", "Intercessão"],
      cursos: 5,
      alunos: 89,
      status: "ativo",
      formacao: "Licenciada em Pedagogia",
      experiencia: "8 anos",
      nota: 4.9
    },
    {
      id: 3,
      nome: "Pr. Carlos Lima",
      email: "carlos.lima@igreja.com",
      telefone: "(11) 99999-0003",
      especialidades: ["Discipulado", "Aconselhamento", "Família"],
      cursos: 6,
      alunos: 124,
      status: "ativo",
      formacao: "Mestrado em Ministério",
      experiencia: "12 anos",
      nota: 4.7
    },
    {
      id: 4,
      nome: "Líder Ana Costa",
      email: "ana.costa@igreja.com",
      telefone: "(11) 99999-0004",
      especialidades: ["Células", "Mulheres", "Jovens"],
      cursos: 3,
      alunos: 67,
      status: "inativo",
      formacao: "Graduada em Psicologia",
      experiencia: "5 anos",
      nota: 4.6
    }
  ]);
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    especialidades: '',
    formacao: '',
    experiencia: '',
    status: 'ativo'
  });

  const getStatusBadge = (status: string) => {
    const config = {
      ativo: { variant: "default" as const, label: "Ativo" },
      inativo: { variant: "secondary" as const, label: "Inativo" },
      licenca: { variant: "outline" as const, label: "Licença" }
    };
    const c = config[status as keyof typeof config] || config.ativo;
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const professoresFiltrados = professores.filter(prof => {
    const matchesFiltro = prof.nome.toLowerCase().includes(filtro.toLowerCase()) ||
                         prof.especialidades.some(esp => esp.toLowerCase().includes(filtro.toLowerCase())) ||
                         prof.email.toLowerCase().includes(filtro.toLowerCase());
    const matchesStatus = statusFiltro === 'todos' || prof.status === statusFiltro;
    return matchesFiltro && matchesStatus;
  });

  const handleEditProfessor = (professor: any) => {
    setProfessorSelecionado(professor);
    alert(`Editando professor: ${professor.nome}`);
  };

  const handleVerCursos = (professor: any) => {
    alert(`Cursos do professor ${professor.nome}:\n${professor.cursos} cursos ativos`);
  };

  const handleRelatorios = (professor: any) => {
    alert(`Relatórios do professor ${professor.nome}:\n- ${professor.alunos} alunos\n- Nota média: ${professor.nota}/5\n- ${professor.experiencia} de experiência`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const novoProfessor = {
      id: Date.now(),
      nome: formData.nome,
      email: formData.email,
      telefone: formData.telefone,
      especialidades: formData.especialidades.split(',').map(e => e.trim()),
      cursos: 0,
      alunos: 0,
      status: formData.status,
      formacao: formData.formacao,
      experiencia: formData.experiencia,
      nota: 5.0
    };
    
    setProfessores([...professores, novoProfessor]);
    setFormData({ nome: '', email: '', telefone: '', especialidades: '', formacao: '', experiencia: '', status: 'ativo' });
    setDialogOpen(false);
  };

  return (
    <AppLayout>
      <main className="space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">Professores</h1>
            <p className="text-muted-foreground">Gestão de professores e instrutores do centro de ensino</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar professores..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="max-w-xs"
              />
            </div>
            <Select value={statusFiltro} onValueChange={setStatusFiltro}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="licenca">Licença</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Professor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Cadastrar Novo Professor</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="formacao">Formação</Label>
                    <Input
                      id="formacao"
                      value={formData.formacao}
                      onChange={(e) => setFormData({...formData, formacao: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="experiencia">Experiência</Label>
                    <Input
                      id="experiencia"
                      placeholder="Ex: 5 anos"
                      value={formData.experiencia}
                      onChange={(e) => setFormData({...formData, experiencia: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="especialidades">Especialidades (separadas por vírgula)</Label>
                    <Textarea
                      id="especialidades"
                      placeholder="Ex: Liderança, Teologia, Discipulado"
                      value={formData.especialidades}
                      onChange={(e) => setFormData({...formData, especialidades: e.target.value})}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Cadastrar Professor
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Professores</p>
                  <p className="text-2xl font-bold text-foreground">{professores.length}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ativos</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {professores.filter(p => p.status === "ativo").length}
                  </p>
                </div>
                <GraduationCap className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Cursos</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {professores.reduce((sum, p) => sum + p.cursos, 0)}
                  </p>
                </div>
                <Award className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Alunos</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {professores.reduce((sum, p) => sum + p.alunos, 0)}
                  </p>
                </div>
                <GraduationCap className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="lista" className="w-full">
          <TabsList>
            <TabsTrigger value="lista">Lista de Professores</TabsTrigger>
            <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="lista" className="mt-6">
            <div className="grid gap-4">
              {professoresFiltrados.map((professor) => (
                <Card key={professor.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="h-8 w-8 text-primary" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">{professor.nome}</h3>
                            <p className="text-sm text-muted-foreground">{professor.formacao}</p>
                          </div>
                          {getStatusBadge(professor.status)}
                        </div>
                        
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Contato</p>
                            <div className="space-y-1">
                              <p className="text-sm font-medium flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {professor.email}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {professor.telefone}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Experiência</p>
                            <p className="text-sm font-medium">{professor.experiencia}</p>
                            <p className="text-sm text-muted-foreground">Avaliação: {professor.nota}/5</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Estatísticas</p>
                            <p className="text-sm font-medium">{professor.cursos} cursos</p>
                            <p className="text-sm text-muted-foreground">{professor.alunos} alunos</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-xs text-muted-foreground mb-2">Especialidades</p>
                          <div className="flex flex-wrap gap-1">
                            {professor.especialidades.map((esp, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {esp}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditProfessor(professor)}>
                          Editar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleVerCursos(professor)}>
                          Ver Cursos
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleRelatorios(professor)}>
                          Relatórios
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {professoresFiltrados.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Nenhum professor encontrado
                  </h3>
                  <p className="text-muted-foreground">
                    {filtro ? 'Tente ajustar os filtros de busca.' : 'Cadastre o primeiro professor para começar.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="estatisticas" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Ativos</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-600" style={{ width: `${(professores.filter(p => p.status === "ativo").length / professores.length) * 100}%` }}></div>
                        </div>
                        <span className="text-sm font-medium">{professores.filter(p => p.status === "ativo").length}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Inativos</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-gray-600" style={{ width: `${(professores.filter(p => p.status === "inativo").length / professores.length) * 100}%` }}></div>
                        </div>
                        <span className="text-sm font-medium">{professores.filter(p => p.status === "inativo").length}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Avaliações Médias</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground mb-2">
                      {(professores.reduce((sum, p) => sum + p.nota, 0) / professores.length).toFixed(1)}
                    </div>
                    <p className="text-sm text-muted-foreground">Média geral das avaliações</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </AppLayout>
  );
};

export default ProfessoresPage;