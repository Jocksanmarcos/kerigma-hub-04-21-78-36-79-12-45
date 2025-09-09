import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { Helmet } from 'react-helmet-async';

export default function BibliaTestePage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testarImportacao = async () => {
    setLoading(true);
    toast.info("Testando importação das versões bíblicas...");

    try {
      // Testar importação da versão ARC
      const { data, error } = await supabase.functions.invoke('bible-import-enhanced', {
        body: { 
          action: 'importVersion',
          versionId: 'arc'
        }
      });

      if (error) {
        throw error;
      }

      setResults(data);
      toast.success("Teste de importação concluído!");
    } catch (error: any) {
      console.error('Erro no teste:', error);
      toast.error(`Erro no teste: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testarListagemLivros = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('bible-import-enhanced', {
        body: { 
          action: 'getBooks',
          versionId: 'arc'
        }
      });

      if (error) throw error;
      
      console.log('Livros encontrados:', data);
      toast.success(`Encontrados ${data?.books?.length || 0} livros`);
      setResults(data);
    } catch (error: any) {
      toast.error(`Erro ao listar livros: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testarCapitulos = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('bible-import-enhanced', {
        body: { 
          action: 'getChapters',
          bookId: 'genesis',
          versionId: 'arc'
        }
      });

      if (error) throw error;
      
      console.log('Capítulos encontrados:', data);
      toast.success(`Encontrados ${data?.chapters?.length || 0} capítulos`);
      setResults(data);
    } catch (error: any) {
      toast.error(`Erro ao listar capítulos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <Helmet>
        <title>Teste de Importação da Bíblia | Kerigma</title>
        <meta name="description" content="Teste a importação e listagem de livros e capítulos da Bíblia (versão ARC)." />
        <link rel="canonical" href={`${window.location.origin}/ensino/biblia/teste`} />
      </Helmet>
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Teste de Importação da Bíblia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={testarImportacao} 
                disabled={loading}
                className="w-full"
              >
                {loading ? "Testando..." : "Testar Importação ARC"}
              </Button>
              
              <Button 
                onClick={testarListagemLivros} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? "Carregando..." : "Listar Livros"}
              </Button>

              <Button 
                onClick={testarCapitulos} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? "Carregando..." : "Testar Capítulos"}
              </Button>
            </div>

            {results && (
              <Card>
                <CardHeader>
                  <CardTitle>Resultados do Teste</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded text-sm overflow-auto max-h-96">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}