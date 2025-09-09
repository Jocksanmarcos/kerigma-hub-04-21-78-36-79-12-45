import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  User, 
  BookOpen, 
  Calendar,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EmprestimoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Pessoa {
  id: string;
  nome_completo: string;
  email: string;
  telefone?: string;
}

interface Livro {
  id: string;
  titulo: string;
  autor: string;
  isbn?: string;
  imagem_capa_url?: string;
  status: string;
  qr_code_interno: string;
}

export const EmprestimoDialog: React.FC<EmprestimoDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [step, setStep] = useState<'pessoa' | 'livro' | 'confirmacao'>('pessoa');
  const [loading, setLoading] = useState(false);
  const [searchPessoa, setSearchPessoa] = useState('');
  const [searchLivro, setSearchLivro] = useState('');
  const [pessoasSugestoes, setPessoasSugestoes] = useState<Pessoa[]>([]);
  const [livrosSugestoes, setLivrosSugestoes] = useState<Livro[]>([]);
  const [pessoaSelecionada, setPessoaSelecionada] = useState<Pessoa | null>(null);
  const [livroSelecionado, setLivroSelecionado] = useState<Livro | null>(null);
  const [observacoes, setObservacoes] = useState('');
  const { toast } = useToast();

  const dataDevolucao = addDays(new Date(), 15); // 15 dias padrão

  useEffect(() => {
    if (searchPessoa.length >= 2) {
      searchPessoas();
    } else {
      setPessoasSugestoes([]);
    }
  }, [searchPessoa]);

  useEffect(() => {
    if (searchLivro.length >= 2) {
      searchLivros();
    } else {
      setLivrosSugestoes([]);
    }
  }, [searchLivro]);

  const searchPessoas = async () => {
    try {
      const { data, error } = await supabase
        .from('pessoas')
        .select('id, nome_completo, email, telefone')
        .ilike('nome_completo', `%${searchPessoa}%`)
        .eq('situacao', 'ativo')
        .limit(5);

      if (error) throw error;
      setPessoasSugestoes(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar pessoas:', error);
    }
  };

  const searchLivros = async () => {
    try {
      const { data, error } = await supabase
        .from('biblioteca_livros')
        .select('*')
        .or(`titulo.ilike.%${searchLivro}%,autor.ilike.%${searchLivro}%,isbn.ilike.%${searchLivro}%`)
        .eq('status', 'Disponível')
        .eq('ativo', true)
        .limit(5);

      if (error) throw error;
      setLivrosSugestoes(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar livros:', error);
    }
  };

  const handleEmprestimo = async () => {
    if (!pessoaSelecionada || !livroSelecionado) return;

    setLoading(true);
    try {
      // Criar empréstimo
      const { error: emprestimoError } = await supabase
        .from('biblioteca_emprestimos')
        .insert([{
          livro_id: livroSelecionado.id,
          pessoa_id: pessoaSelecionada.id,
          data_devolucao_prevista: format(dataDevolucao, 'yyyy-MM-dd'),
          observacoes
        }]);

      if (emprestimoError) throw emprestimoError;

      // Atualizar status do livro
      const { error: livroError } = await supabase
        .from('biblioteca_livros')
        .update({ status: 'Emprestado' })
        .eq('id', livroSelecionado.id);

      if (livroError) throw livroError;

      toast({
        title: 'Empréstimo realizado!',
        description: `Livro "${livroSelecionado.titulo}" emprestado para ${pessoaSelecionada.nome_completo}`
      });

      // Reset form
      setStep('pessoa');
      setPessoaSelecionada(null);
      setLivroSelecionado(null);
      setObservacoes('');
      setSearchPessoa('');
      setSearchLivro('');
      
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro ao realizar empréstimo',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetDialog = () => {
    setStep('pessoa');
    setPessoaSelecionada(null);
    setLivroSelecionado(null);
    setObservacoes('');
    setSearchPessoa('');
    setSearchLivro('');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetDialog();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo Empréstimo</DialogTitle>
          <DialogDescription>
            Registre um novo empréstimo de livro
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="flex justify-center space-x-2">
            {['pessoa', 'livro', 'confirmacao'].map((s, index) => (
              <div
                key={s}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === s ? 'bg-primary text-primary-foreground' :
                  ['pessoa', 'livro', 'confirmacao'].indexOf(step) > index ? 'bg-green-500 text-white' :
                  'bg-muted text-muted-foreground'
                }`}
              >
                {['pessoa', 'livro', 'confirmacao'].indexOf(step) > index ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
            ))}
          </div>

          {step === 'pessoa' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Selecionar Pessoa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="search-pessoa">Buscar por nome</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search-pessoa"
                      placeholder="Digite o nome da pessoa..."
                      value={searchPessoa}
                      onChange={(e) => setSearchPessoa(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {pessoasSugestoes.length > 0 && (
                  <div className="space-y-2">
                    <Label>Pessoas encontradas:</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {pessoasSugestoes.map((pessoa) => (
                        <div
                          key={pessoa.id}
                          className={`p-3 border rounded-lg cursor-pointer hover:bg-muted ${
                            pessoaSelecionada?.id === pessoa.id ? 'bg-primary/10 border-primary' : ''
                          }`}
                          onClick={() => setPessoaSelecionada(pessoa)}
                        >
                          <p className="font-medium">{pessoa.nome_completo}</p>
                          <p className="text-sm text-muted-foreground">{pessoa.email}</p>
                          {pessoa.telefone && (
                            <p className="text-sm text-muted-foreground">{pessoa.telefone}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {pessoaSelecionada && (
                  <div className="flex justify-end">
                    <Button onClick={() => setStep('livro')}>
                      Próximo: Selecionar Livro
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {step === 'livro' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Selecionar Livro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="search-livro">Buscar por título, autor ou ISBN</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search-livro"
                      placeholder="Digite o título, autor ou ISBN..."
                      value={searchLivro}
                      onChange={(e) => setSearchLivro(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {livrosSugestoes.length > 0 && (
                  <div className="space-y-2">
                    <Label>Livros disponíveis:</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {livrosSugestoes.map((livro) => (
                        <div
                          key={livro.id}
                          className={`p-3 border rounded-lg cursor-pointer hover:bg-muted flex items-center gap-3 ${
                            livroSelecionado?.id === livro.id ? 'bg-primary/10 border-primary' : ''
                          }`}
                          onClick={() => setLivroSelecionado(livro)}
                        >
                          <div className="w-12 h-16 bg-muted rounded-sm flex items-center justify-center overflow-hidden">
                            {livro.imagem_capa_url ? (
                              <img 
                                src={livro.imagem_capa_url} 
                                alt={livro.titulo}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <BookOpen className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{livro.titulo}</p>
                            <p className="text-sm text-muted-foreground">{livro.autor}</p>
                            {livro.isbn && (
                              <p className="text-xs text-muted-foreground">ISBN: {livro.isbn}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep('pessoa')}>
                    Voltar
                  </Button>
                  {livroSelecionado && (
                    <Button onClick={() => setStep('confirmacao')}>
                      Próximo: Confirmar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'confirmacao' && pessoaSelecionada && livroSelecionado && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Confirmar Empréstimo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Pessoa</Label>
                    <p className="font-medium">{pessoaSelecionada.nome_completo}</p>
                    <p className="text-sm text-muted-foreground">{pessoaSelecionada.email}</p>
                  </div>
                  <div>
                    <Label>Livro</Label>
                    <p className="font-medium">{livroSelecionado.titulo}</p>
                    <p className="text-sm text-muted-foreground">{livroSelecionado.autor}</p>
                  </div>
                </div>

                <div>
                  <Label>Data de Devolução</Label>
                  <p className="font-medium">
                    {format(dataDevolucao, 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                  <p className="text-sm text-muted-foreground">15 dias a partir de hoje</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações (opcional)</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Alguma observação sobre este empréstimo..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep('livro')}>
                    Voltar
                  </Button>
                  <Button onClick={handleEmprestimo} disabled={loading}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Confirmar Empréstimo
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};