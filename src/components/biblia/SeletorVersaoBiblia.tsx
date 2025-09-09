import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Download, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BibleVersion {
  id: string;
  nome: string;
  abreviacao: string;
  codigo_versao: string;
  descricao: string;
  editora: string;
  ano_publicacao: number;
  ativa: boolean;
}

interface SeletorVersaoBibliaProps {
  versaoSelecionada: string;
  onVersaoChange: (versaoId: string) => void;
  showVersionManager?: boolean;
}

export const SeletorVersaoBiblia: React.FC<SeletorVersaoBibliaProps> = ({
  versaoSelecionada,
  onVersaoChange,
  showVersionManager = false
}) => {
  const { toast } = useToast();
  const [versoes, setVersoes] = useState<BibleVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState<string | null>(null);
  const [showManager, setShowManager] = useState(false);

  useEffect(() => {
    carregarVersoes();
  }, []);

  const carregarVersoes = async () => {
    try {
      const { data, error } = await supabase
        .from('biblia_versoes')
        .select('*')
        .eq('ativa', true)
        .order('ordem_exibicao');

      if (error) throw error;
      
      setVersoes(data || []);
      
      // Se não há versão selecionada, usar a primeira
      if (!versaoSelecionada && data && data.length > 0) {
        onVersaoChange(data[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar versões:', error);
      toast({
        title: 'Erro ao carregar versões',
        description: 'Não foi possível carregar as versões da Bíblia.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const verificarVersaoImportada = async (versaoId: string) => {
    try {
      const { count } = await supabase
        .from('biblia_versiculos')
        .select('*', { count: 'exact', head: true })
        .eq('versao_id', versaoId);
      
      return count && count > 0;
    } catch {
      return false;
    }
  };

  const importarVersao = async (versaoId: string) => {
    setImporting(versaoId);
    
    try {
      toast({
        title: 'Iniciando importação...',
        description: `Importando versão ${versaoId}. Isso pode levar alguns minutos.`
      });

      let action = 'importVersion';
      if (versaoId === 'all') {
        action = 'importAllVersions';
      }

      const { data, error } = await supabase.functions.invoke('bible-import-enhanced', {
        body: {
          action: action,
          versionId: versaoId
        }
      });

      if (error) throw error;

      toast({
        title: 'Importação concluída!',
        description: versaoId === 'all' ? 'Todas as versões foram importadas com sucesso.' : `Versão ${versaoId} importada com sucesso.`
      });

      // Atualizar o status da versão
      await carregarVersoes();

    } catch (error) {
      console.error('Erro na importação:', error);
      toast({
        title: 'Erro na importação',
        description: 'Não foi possível importar a versão. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setImporting(null);
    }
  };

  const VersionCard: React.FC<{ versao: BibleVersion }> = ({ versao }) => {
    const [isImported, setIsImported] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
      verificarVersaoImportada(versao.id).then(imported => {
        setIsImported(imported);
        setChecking(false);
      });
    }, [versao.id, importing]); // Re-check when importing state changes

    const isCurrentlyImporting = importing === versao.id || importing === 'all';

    return (
      <Card className={`transition-all ${versaoSelecionada === versao.id ? 'ring-2 ring-primary' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{versao.nome}</CardTitle>
            <Badge variant={isImported ? 'default' : 'secondary'}>
              {isImported ? (
                <><Check className="h-3 w-3 mr-1" /> Disponível</>
              ) : (
                <><AlertCircle className="h-3 w-3 mr-1" /> Não importada</>
              )}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{versao.abreviacao}</Badge>
            <span className="text-sm text-muted-foreground">{versao.editora}</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{versao.descricao}</p>
          
          <div className="flex items-center justify-between">
            <Button
              variant={versaoSelecionada === versao.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => onVersaoChange(versao.id)}
              disabled={!isImported || isCurrentlyImporting}
            >
              {versaoSelecionada === versao.id ? 'Selecionada' : 'Selecionar'}
            </Button>
            
            {!isImported && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => importarVersao(versao.id)}
                disabled={importing !== null || checking}
              >
                {isCurrentlyImporting ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                    Importando...
                  </>
                ) : (
                  <>
                    <Download className="h-3 w-3 mr-1" />
                    Importar
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Carregando versões..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={versaoSelecionada} onValueChange={onVersaoChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Selecionar versão">
            {versoes.find(v => v.id === versaoSelecionada)?.abreviacao}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {versoes.map((versao) => (
            <SelectItem key={versao.id} value={versao.id}>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{versao.abreviacao}</Badge>
                <span>{versao.nome}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showVersionManager && (
        <Dialog open={showManager} onOpenChange={setShowManager}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <BookOpen className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gerenciar Versões da Bíblia</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {versoes.map((versao) => (
                  <VersionCard key={versao.id} versao={versao} />
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Importação em Lote</h3>
                    <p className="text-sm text-muted-foreground">
                      Importe todas as versões disponíveis de uma vez
                    </p>
                  </div>
                  <Button
                    onClick={() => importarVersao('all')}
                    disabled={importing !== null}
                  >
                    {importing === 'all' ? 'Importando...' : 'Importar Todas'}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};