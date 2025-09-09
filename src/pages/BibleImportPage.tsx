import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function BibleImportPage() {
  const [isImporting, setIsImporting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const importAllVersions = async () => {
    setIsImporting(true);
    toast.info("Iniciando importação das versões bíblicas...");

    try {
      const { data, error } = await supabase.functions.invoke('bible-import-enhanced', {
        body: { action: 'importAllVersions' }
      });

      if (error) {
        throw error;
      }

      setResults(data);
      toast.success("Versões bíblicas importadas com sucesso!");
    } catch (error: any) {
      console.error('Erro na importação:', error);
      toast.error(`Erro na importação: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const syncAvailableBibles = async () => {
    setIsImporting(true);
    toast.info("Sincronizando versões da Bíblia disponíveis...");

    try {
      const { data, error } = await supabase.functions.invoke('bible-import-enhanced', {
        body: { action: 'getAvailableBibles' }
      });

      if (error) throw error;
      
      console.log('Resultado da sincronização:', data);
      toast.success(`${data.synced_count} versões sincronizadas com sucesso!`);
      setResults(data);
    } catch (error: any) {
      console.error('Erro na sincronização:', error);
      toast.error(`Erro na sincronização: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const checkVersions = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('bible-import-enhanced', {
        body: { action: 'getVersions' }
      });

      if (error) throw error;
      
      console.log('Versões disponíveis:', data);
      toast.info("Verificação concluída. Veja o console.");
    } catch (error: any) {
      toast.error(`Erro na verificação: ${error.message}`);
    }
  };

  const syncBooksFromVersicles = async (versionId: string) => {
    setIsImporting(true);
    toast.info(`Sincronizando estrutura de livros para versão ${versionId}...`);

    try {
      const { data, error } = await supabase.functions.invoke('bible-import-enhanced', {
        body: { action: 'syncBooksFromVersicles', versionId }
      });

      if (error) throw error;
      
      console.log('Resultado da sincronização de livros:', data);
      toast.success(`${data.synced_books} livros sincronizados para versão ${versionId}!`);
    } catch (error: any) {
      console.error('Erro na sincronização de livros:', error);
      toast.error(`Erro na sincronização: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Importação de Versões Bíblicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              onClick={syncAvailableBibles} 
              disabled={isImporting}
              className="w-full"
              variant="default"
            >
              {isImporting ? "Sincronizando..." : "Sincronizar Versões Disponíveis"}
            </Button>

            <Button 
              onClick={() => syncBooksFromVersicles('arc')} 
              disabled={isImporting}
              className="w-full"
              variant="outline"
            >
              {isImporting ? "Sincronizando..." : "Sincronizar Dados"}
            </Button>

            <Button 
              onClick={importAllVersions} 
              disabled={isImporting}
              className="w-full"
              variant="secondary"
            >
              {isImporting ? "Importando..." : "Importar Todas as Versões"}
            </Button>
            
            <Button 
              onClick={checkVersions} 
              variant="outline"
              className="w-full"
            >
              Verificar Versões
            </Button>
          </div>

          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">Passos para corrigir o problema:</h3>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Clique em "Sincronizar Livros ARC" para criar a estrutura de livros baseada nos versículos existentes</li>
              <li>Mude a versão selecionada no leitor para "ARC" que tem mais conteúdo</li>
              <li>Se necessário, use "Sincronizar Versões Disponíveis" para atualizar as versões da API Bible</li>
            </ol>
          </div>

          {results && (
            <Card>
              <CardHeader>
                <CardTitle>Resultados da Importação</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}