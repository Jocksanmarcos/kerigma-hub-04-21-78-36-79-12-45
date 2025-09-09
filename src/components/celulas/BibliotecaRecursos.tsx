import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, Download, Upload, Search, Filter, Video, FileText, Users, Heart, CheckCircle, Clock, AlertTriangle, Eye, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UploadRecursoModal } from './UploadRecursoModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';

interface RecursoCelula {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  categoria: string;
  arquivo_url: string;
  arquivo_nome: string;
  publico_alvo: string[];
  tags: string[];
  downloads: number;
  aprovado_em: string | null;
  aprovado_por: string | null;
  criado_por: string | null;
  created_at: string;
}

async function fetchRecursosCelulas(): Promise<RecursoCelula[]> {
  const { data, error } = await supabase
    .from('biblioteca_recursos_celulas')
    .select(`
      *,
      criador:pessoas!criado_por(nome_completo),
      aprovador:pessoas!aprovado_por(nome_completo)
    `)
    .eq('ativo', true)
    .not('aprovado_em', 'is', null)
    .order('downloads', { ascending: false });

  if (error) {
    console.error('Erro ao buscar recursos:', error);
    return [];
  }

  return data || [];
}

// Função para buscar recursos pendentes
async function fetchRecursosPendentes() {
  const { data, error } = await supabase
    .from('biblioteca_recursos_celulas')
    .select(`
      *,
      criador:pessoas!criado_por(nome_completo)
    `)
    .eq('ativo', true)
    .is('aprovado_em', null)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Erro ao buscar recursos pendentes:', error);
    return [];
  }

  return data || [];
}

// Função para buscar estatísticas reais
async function fetchEstatisticasRecursos() {
  try {
    const [totalRes, pendentesRes, novosRes, downloadsRes] = await Promise.all([
      supabase.from('biblioteca_recursos_celulas').select('id', { count: 'exact' }).eq('ativo', true),
      supabase.from('biblioteca_recursos_celulas').select('id', { count: 'exact' }).eq('ativo', true).is('aprovado_em', null),
      supabase.from('biblioteca_recursos_celulas').select('id', { count: 'exact' }).eq('ativo', true).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('biblioteca_recursos_celulas').select('downloads').eq('ativo', true)
    ]);

    const totalDownloads = downloadsRes.data?.reduce((sum, item) => sum + (item.downloads || 0), 0) || 0;

    return {
      total: totalRes.count || 0,
      pendentes: pendentesRes.count || 0,
      novos: novosRes.count || 0,
      downloads: totalDownloads
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return { total: 0, pendentes: 0, novos: 0, downloads: 0 };
  }
}

export const BibliotecaRecursos: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const { pessoa } = useCurrentPerson();
  const queryClient = useQueryClient();

  const { data: recursos = [], isLoading, error, refetch } = useQuery({
    queryKey: ['recursos-celulas'],
    queryFn: fetchRecursosCelulas,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  const { data: recursosPendentes = [] } = useQuery({
    queryKey: ['recursos-pendentes'],
    queryFn: fetchRecursosPendentes,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const { data: estatisticas } = useQuery({
    queryKey: ['estatisticas-recursos'],
    queryFn: fetchEstatisticasRecursos,
    staleTime: 10 * 60 * 1000,
  });

  // Mutation para aprovar recursos
  const aprovarRecurso = useMutation({
    mutationFn: async (recursoId: string) => {
      const { error } = await supabase
        .from('biblioteca_recursos_celulas')
        .update({
          aprovado_em: new Date().toISOString(),
          aprovado_por: pessoa?.id
        })
        .eq('id', recursoId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Recurso aprovado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['recursos-celulas'] });
      queryClient.invalidateQueries({ queryKey: ['recursos-pendentes'] });
      queryClient.invalidateQueries({ queryKey: ['estatisticas-recursos'] });
    },
    onError: (error) => {
      console.error('Erro ao aprovar recurso:', error);
      toast.error('Erro ao aprovar recurso');
    }
  });

  // Mutation para rejeitar recursos
  const rejeitarRecurso = useMutation({
    mutationFn: async (recursoId: string) => {
      const { error } = await supabase
        .from('biblioteca_recursos_celulas')
        .update({ ativo: false })
        .eq('id', recursoId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Recurso rejeitado');
      queryClient.invalidateQueries({ queryKey: ['recursos-pendentes'] });
      queryClient.invalidateQueries({ queryKey: ['estatisticas-recursos'] });
    },
    onError: (error) => {
      console.error('Erro ao rejeitar recurso:', error);
      toast.error('Erro ao rejeitar recurso');
    }
  });

  if (error) {
    toast.error('Erro ao carregar recursos da biblioteca');
  }

  // Usar dados reais 
  const recursosParaUsar = recursos;

  const recursosFiltrados = recursosParaUsar.filter(recurso => {
    const filtroTipoOk = filtroTipo === 'todos' || recurso.tipo.toLowerCase().includes(filtroTipo);
    const filtroCategoriaOk = filtroCategoria === 'todas' || recurso.categoria.toLowerCase() === filtroCategoria;
    const filtroBuscaOk = searchTerm === '' || 
      recurso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recurso.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return filtroTipoOk && filtroCategoriaOk && filtroBuscaOk;
  });

  const handleDownload = async (recurso: RecursoCelula) => {
    if (!recurso.arquivo_url) {
      toast.error('Arquivo não disponível para download');
      return;
    }

    try {
      // Incrementar contador de downloads
      const { error } = await supabase
        .from('biblioteca_recursos_celulas')
        .update({ downloads: recurso.downloads + 1 })
        .eq('id', recurso.id);

      if (error) {
        console.error('Erro ao incrementar downloads:', error);
      }

      // Abrir arquivo
      window.open(recurso.arquivo_url, '_blank');
      toast.success(`Download de "${recurso.titulo}" iniciado`);
    } catch (error) {
      toast.error('Erro ao fazer download do arquivo');
    }
  };

  const handleUploadRecurso = () => {
    setUploadModalOpen(true);
  };

  const getIconByType = (tipo: string) => {
    switch (tipo) {
      case 'Vídeo de Treino':
        return <Video className="h-5 w-5" />;
      case 'Estudo Semanal':
      case 'Devocional':
        return <FileText className="h-5 w-5" />;
      case 'Quebra-Gelo':
        return <Users className="h-5 w-5" />;
      case 'Dinâmica':
        return <Heart className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'Estudo Semanal':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Quebra-Gelo':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Vídeo de Treino':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Dinâmica':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'Devocional':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header com Upload e Aprovações */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Biblioteca de Recursos</h2>
          <p className="text-muted-foreground">
            Materiais aprovados para estudos, dinâmicas e treinamentos
          </p>
        </div>
        <div className="flex gap-2">
          {recursosPendentes.length > 0 && (
            <Dialog open={approvalModalOpen} onOpenChange={setApprovalModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="relative">
                  <Clock className="h-4 w-4 mr-2" />
                  Pendentes
                  <Badge className="ml-2 bg-orange-500">{recursosPendentes.length}</Badge>
                </Button>
              </DialogTrigger>
            </Dialog>
          )}
          <Button onClick={handleUploadRecurso}>
            <Upload className="h-4 w-4 mr-2" />
            Enviar Recurso
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar recursos por título ou tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="estudo">Estudo Semanal</SelectItem>
                <SelectItem value="quebra-gelo">Quebra-Gelo</SelectItem>
                <SelectItem value="video">Vídeo de Treino</SelectItem>
                <SelectItem value="dinamica">Dinâmica</SelectItem>
                <SelectItem value="devocional">Devocional</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="familia">Família</SelectItem>
                <SelectItem value="integracao">Integração</SelectItem>
                <SelectItem value="treinamento">Treinamento</SelectItem>
                <SelectItem value="discipulado">Discipulado</SelectItem>
              </SelectContent>
            </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Recursos */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">Carregando recursos...</div>
          </div>
        ) : recursosFiltrados.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">Nenhum recurso encontrado com os filtros aplicados</div>
          </div>
          ) : (
            recursosFiltrados.map((recurso) => (
          <Card key={recurso.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="p-2 bg-muted rounded-lg flex-shrink-0">
                    {getIconByType(recurso.tipo)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base sm:text-lg leading-tight">{recurso.titulo}</CardTitle>
                    <CardDescription className="mt-1 text-sm">
                      {recurso.descricao}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge className={getTypeColor(recurso.tipo)}>
                        {recurso.tipo}
                      </Badge>
                      <Badge variant="outline">
                        {recurso.categoria}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end text-right flex-shrink-0">
                  <div className="text-xs sm:text-sm text-muted-foreground mb-2">
                    {recurso.downloads} downloads
                  </div>
                  <Button 
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => handleDownload(recurso)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Baixar</span>
                    <span className="sm:hidden">Download</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs sm:text-sm text-muted-foreground mr-2">Público-alvo:</span>
                  {recurso.publico_alvo.map((publico, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {publico}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {recurso.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>

      {/* Estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas da Biblioteca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-3 sm:p-4 bg-muted/30 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{estatisticas?.total || 0}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Total de Recursos</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-muted/30 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-green-600">{estatisticas?.downloads || 0}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Downloads Totais</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-muted/30 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">{estatisticas?.novos || 0}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Recursos Novos (30d)</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-muted/30 rounded-lg cursor-pointer" onClick={() => setApprovalModalOpen(true)}>
              <div className="text-xl sm:text-2xl font-bold text-orange-600">{estatisticas?.pendentes || 0}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Aguardando Aprovação</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Aprovações */}
      <Dialog open={approvalModalOpen} onOpenChange={setApprovalModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Recursos Aguardando Aprovação ({recursosPendentes.length})</DialogTitle>
            <DialogDescription>
              Estes recursos foram enviados por líderes e aguardam aprovação para ficarem disponíveis na biblioteca.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {recursosPendentes.map((recurso) => (
              <Card key={recurso.id} className="border-orange-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{recurso.titulo}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{recurso.descricao}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{recurso.tipo}</Badge>
                        <Badge variant="secondary">{recurso.categoria}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Enviado em {format(new Date(recurso.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        {recurso.criador && ` por ${recurso.criador.nome_completo}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => aprovarRecurso.mutate(recurso.id)}
                        disabled={aprovarRecurso.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejeitarRecurso.mutate(recurso.id)}
                        disabled={rejeitarRecurso.isPending}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
            
            {recursosPendentes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>Não há recursos aguardando aprovação!</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Upload */}
      <UploadRecursoModal 
        open={uploadModalOpen} 
        onOpenChange={setUploadModalOpen}
        onSuccess={() => refetch()}
      />
    </div>
  );
};