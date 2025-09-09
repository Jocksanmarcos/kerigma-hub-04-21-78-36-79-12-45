import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Download, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';

interface BibleVersion {
  id: string;
  nome: string;
  abreviacao: string | null;
  idioma: string | null;
  pais?: string | null;
  livros_count?: number;
  capitulos_count?: number;
}

const BibliaGerenciadorPage: React.FC = () => {
  const { toast } = useToast();
  const [versions, setVersions] = useState<BibleVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    try {
      setLoading(true);
      
      // Buscar versões sincronizadas
      const { data: versionsData, error } = await supabase
        .from('biblia_versoes')
        .select(`
          *,
          biblia_livros(count),
          biblia_capitulos(count)
        `);
      
      if (error) throw error;
      
      // Processar dados para incluir contagens
      const processedVersions = await Promise.all(
        (versionsData || []).map(async (version) => {
          // Contar livros
          const { count: livrosCount } = await supabase
            .from('biblia_livros')
            .select('*', { count: 'exact', head: true })
            .eq('versao_id', version.id);
          
          // Contar capítulos
          const { count: capitulosCount } = await supabase
            .from('biblia_capitulos')
            .select('*', { count: 'exact', head: true })
            .eq('versao_id', version.id);
          
          return {
            ...version,
            livros_count: livrosCount || 0,
            capitulos_count: capitulosCount || 0
          };
        })
      );
      
      setVersions(processedVersions);
      
    } catch (error) {
      console.error('❌ Erro ao carregar versões:', error);
      toast({
        title: 'Erro ao carregar versões',
        description: error?.message || 'Não foi possível carregar as versões sincronizadas.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const syncBibleStructure = async () => {
    try {
      setSyncing(true);
      
      toast({
        title: 'Iniciando sincronização',
        description: 'Sincronizando estrutura da Bíblia. Isso pode levar alguns minutos...'
      });
      
      // Chamar edge function de sincronização
      const { data, error } = await supabase.functions.invoke('sync-bible-structure');
      
      if (error) throw error;
      
      if (data?.success) {
        toast({
          title: 'Sincronização concluída!',
          description: `${data.versions} versões foram sincronizadas com sucesso.`
        });
        
        // Recarregar lista
        await loadVersions();
      } else {
        throw new Error(data?.error || 'Erro na sincronização');
      }
      
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      toast({
        title: 'Erro na sincronização',
        description: error?.message || 'Não foi possível sincronizar a estrutura da Bíblia.',
        variant: 'destructive'
      });
    } finally {
      setSyncing(false);
    }
  };

  const getVersionStatus = (version: BibleVersion) => {
    const hasBooks = (version.livros_count || 0) > 0;
    const hasChapters = (version.capitulos_count || 0) > 0;
    
    if (hasBooks && hasChapters) {
      return { status: 'complete', label: 'Completa', variant: 'default' as const };
    } else if (hasBooks) {
      return { status: 'partial', label: 'Parcial', variant: 'secondary' as const };
    } else {
      return { status: 'empty', label: 'Vazia', variant: 'destructive' as const };
    }
  };

  return (
    <AppLayout>
      <Helmet>
        <title>Gerenciador de Versões Bíblicas | Kerigma</title>
        <meta name="description" content="Gerencie e sincronize versões da Bíblia disponíveis no sistema." />
        <link rel="canonical" href={`${window.location.origin}/ensino/biblia/gerenciador`} />
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gerenciador de Versões Bíblicas</h1>
            <p className="text-muted-foreground">Sincronize e gerencie as versões da Bíblia disponíveis</p>
          </div>
          
          <Button
            onClick={syncBibleStructure}
            disabled={syncing}
            className="flex items-center gap-2"
          >
            {syncing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {syncing ? 'Sincronizando...' : 'Sincronizar Estrutura'}
          </Button>
        </div>

        {/* Informações da sincronização */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <BookOpen className="h-5 w-5" />
              Sistema de Leitura em Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• <strong>Estrutura sincronizada:</strong> Apenas o índice de versões, livros e capítulos são armazenados localmente</p>
              <p>• <strong>Conteúdo sob demanda:</strong> O texto dos capítulos é buscado em tempo real quando solicitado</p>
              <p>• <strong>Consistência garantida:</strong> Todo conteúdo está sempre atualizado e em português brasileiro</p>
              <p>• <strong>Performance otimizada:</strong> Banco de dados leve e carregamento rápido</p>
            </div>
          </CardContent>
        </Card>

        {/* Lista de versões */}
        {loading ? (
          <Card>
            <CardContent className="py-8">
              <div className="flex items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2">Carregando versões...</span>
              </div>
            </CardContent>
          </Card>
        ) : versions.length > 0 ? (
          <div className="grid gap-4">
            {versions.map((version) => {
              const status = getVersionStatus(version);
              
              return (
                <Card key={version.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{version.nome}</h3>
                          <Badge variant={status.variant}>
                            {status.status === 'complete' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {status.status === 'partial' && <AlertCircle className="h-3 w-3 mr-1" />}
                            {status.status === 'empty' && <AlertCircle className="h-3 w-3 mr-1" />}
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {version.abreviacao || 'N/A'} • {version.idioma || 'Português'} • {version.pais || 'Brasil'}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{version.livros_count || 0} livros</span>
                          <span>{version.capitulos_count || 0} capítulos</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/ensino/biblia/livros?version=${version.id}`, '_blank')}
                          disabled={!version.livros_count}
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          Abrir Leitor
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma versão sincronizada</h3>
              <p className="text-muted-foreground mb-4">
                Clique em "Sincronizar Estrutura" para baixar o índice das versões bíblicas
              </p>
              <Button onClick={syncBibleStructure} disabled={syncing}>
                <Download className="h-4 w-4 mr-2" />
                Sincronizar Agora
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default BibliaGerenciadorPage;