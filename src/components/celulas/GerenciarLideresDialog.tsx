import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, UserCheck, Crown } from 'lucide-react';

interface Celula {
  id: string;
  nome: string;
  lider_id: string | null;
  lider_nome?: string;
}

interface Pessoa {
  id: string;
  nome_completo: string;
  telefone: string | null;
}

export const GerenciarLideresDialog: React.FC = () => {
  const [selectedCelula, setSelectedCelula] = useState<string>('');
  const [selectedPessoa, setSelectedPessoa] = useState<string>('');
  const [celulas, setCelulas] = useState<Celula[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Buscar dados quando o dialog abre
  React.useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar células
      const { data: celulasData, error: celulasError } = await supabase
        .from('celulas')
        .select('id, nome, lider_id')
        .eq('ativa', true)
        .order('nome');

      if (celulasError) throw celulasError;
      setCelulas(celulasData || []);

      // Buscar pessoas com tipagem explícita
      const pessoasResponse = await supabase
        .from('pessoas')
        .select('id, nome_completo, telefone');
      
      if (pessoasResponse.error) throw pessoasResponse.error;
      
      const filteredPessoas = (pessoasResponse.data || []).filter((p): p is Pessoa => {
        return p.id && p.nome_completo && typeof p.id === 'string' && typeof p.nome_completo === 'string';
      });
      
      setPessoas(filteredPessoas);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDesignarLider = async () => {
    console.log('Designando líder:', { selectedCelula, selectedPessoa });
    
    if (!selectedCelula || !selectedPessoa) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione uma célula e uma pessoa.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      console.log('Enviando update para Supabase...');
      
      const { error, data } = await supabase
        .from('celulas')
        .update({ lider_id: selectedPessoa })
        .eq('id', selectedCelula)
        .select();

      console.log('Resposta do Supabase:', { error, data });

      if (error) {
        console.error('Erro na atualização:', error);
        throw error;
      }

      toast({
        title: "Líder designado!",
        description: "Líder da célula foi atualizado com sucesso.",
      });
      
      setSelectedCelula('');
      setSelectedPessoa('');
      await fetchData();
    } catch (error) {
      console.error('Erro ao designar líder:', error);
      toast({
        title: "Erro",
        description: `Erro ao designar líder da célula: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoverLider = async (celulaId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('celulas')
        .update({ lider_id: null })
        .eq('id', celulaId);

      if (error) throw error;

      toast({
        title: "Líder removido!",
        description: "Líder da célula foi removido com sucesso.",
      });
      
      await fetchData();
    } catch (error) {
      console.error('Erro ao remover líder:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover líder da célula.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <Crown className="h-4 w-4" />
          <span>Gerenciar Líderes</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Crown className="h-5 w-5" />
            <span>Gerenciar Líderes de Células</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Designar Novo Líder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4" />
                <span>Designar Líder</span>
              </CardTitle>
              <CardDescription>
                Selecione uma célula e uma pessoa para designar como líder
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Célula</label>
                  <Select value={selectedCelula} onValueChange={setSelectedCelula}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma célula" />
                    </SelectTrigger>
                    <SelectContent>
                      {celulas.map((celula) => (
                        <SelectItem key={celula.id} value={celula.id}>
                          {celula.nome}
                          {celula.lider_nome && (
                            <span className="text-muted-foreground ml-2">
                              (Líder: {celula.lider_nome})
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Pessoa</label>
                  <Select value={selectedPessoa} onValueChange={setSelectedPessoa}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma pessoa" />
                    </SelectTrigger>
                    <SelectContent>
                      {pessoas.map((pessoa) => (
                        <SelectItem key={pessoa.id} value={pessoa.id}>
                          {pessoa.nome_completo}
                          {pessoa.telefone && (
                            <span className="text-muted-foreground ml-2">
                              ({pessoa.telefone})
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleDesignarLider}
                disabled={loading || !selectedCelula || !selectedPessoa}
                className="w-full"
              >
                {loading ? 'Designando...' : 'Designar Líder'}
              </Button>
            </CardContent>
          </Card>

          {/* Lista de Células com Líderes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Células e seus Líderes</span>
              </CardTitle>
              <CardDescription>
                Lista de todas as células e seus respectivos líderes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {celulas.map((celula) => (
                  <div 
                    key={celula.id} 
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{celula.nome}</h4>
                      <p className="text-sm text-muted-foreground">
                        {celula.lider_nome ? (
                          <>Líder: {celula.lider_nome}</>
                        ) : (
                          <span className="text-orange-600">Sem líder designado</span>
                        )}
                      </p>
                    </div>
                    
                    {celula.lider_id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoverLider(celula.id)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remover Líder
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};