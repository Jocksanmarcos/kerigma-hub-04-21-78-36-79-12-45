import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Brain, Calendar, BookOpen, Target, User } from 'lucide-react';

export const AssistenteDiscipulado: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pessoaSelecionada, setPessoaSelecionada] = useState<string>('');
  const [tipoAnalise, setTipoAnalise] = useState<string>('analise_perfil');
  const [contextoAdicional, setContextoAdicional] = useState('');
  const [resultadoAnalise, setResultadoAnalise] = useState<string>('');
  const [carregando, setCarregando] = useState(false);

  // Buscar pessoas
  const { data: pessoas } = useQuery({
    queryKey: ['pessoas-para-ia'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pessoas')
        .select('id, nome_completo, tipo_pessoa, situacao')
        .eq('situacao', 'ativo')
        .order('nome_completo');
      
      if (error) throw error;
      return data;
    }
  });

  // Buscar histórico de análises (temporariamente desabilitado até types serem atualizados)
  const { data: historico } = useQuery({
    queryKey: ['historico-ia-pastoral', pessoaSelecionada],
    queryFn: async () => {
      if (!pessoaSelecionada) return [];
      return []; // Temporariamente retorna array vazio
    },
    enabled: !!pessoaSelecionada
  });

  const realizarAnalise = async () => {
    if (!pessoaSelecionada) {
      toast({
        title: 'Erro',
        description: 'Selecione uma pessoa para análise',
        variant: 'destructive'
      });
      return;
    }

    setCarregando(true);
    try {
      const { data, error } = await supabase.functions.invoke('ia-pastoral', {
        body: {
          type: tipoAnalise,
          pessoaId: pessoaSelecionada,
          dados: {
            contexto: contextoAdicional
          }
        }
      });

      if (error) throw error;

      setResultadoAnalise(data.analise);
      // queryClient.invalidateQueries({ queryKey: ['historico-ia-pastoral'] });
      
      toast({
        title: 'Análise Concluída',
        description: `Análise gerada com sucesso para ${data.pessoa}`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro na Análise',
        description: error.message || 'Erro ao gerar análise',
        variant: 'destructive'
      });
    } finally {
      setCarregando(false);
    }
  };

  const getTipoAnaliseLabel = (tipo: string) => {
    switch (tipo) {
      case 'analise_perfil': return 'Análise de Perfil';
      case 'sugestoes_discipulado': return 'Sugestões de Discipulado';
      case 'match_ministerio': return 'Match de Ministério';
      default: return tipo;
    }
  };

  const formatarAnalise = (texto: string) => {
    return texto.split('\n').map((linha, index) => (
      <p key={index} className="mb-2 leading-relaxed">
        {linha}
      </p>
    ));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Formulário de Análise */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>Nova Análise</span>
            </CardTitle>
            <CardDescription>
              Configure os parâmetros para análise pastoral com IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pessoa">Pessoa</Label>
              <Select value={pessoaSelecionada} onValueChange={setPessoaSelecionada}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma pessoa" />
                </SelectTrigger>
                <SelectContent>
                  {pessoas?.map((pessoa) => (
                    <SelectItem key={pessoa.id} value={pessoa.id}>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{pessoa.nome_completo}</span>
                        <Badge variant="outline" className="text-xs">
                          {pessoa.tipo_pessoa}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Análise</Label>
              <Select value={tipoAnalise} onValueChange={setTipoAnalise}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="analise_perfil">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4" />
                      <span>Análise de Perfil Espiritual</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="sugestoes_discipulado">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Sugestões de Discipulado</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="match_ministerio">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Match de Ministério</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contexto">Contexto Adicional</Label>
              <Textarea
                id="contexto"
                placeholder="Informações adicionais sobre a pessoa ou situação específica..."
                value={contextoAdicional}
                onChange={(e) => setContextoAdicional(e.target.value)}
                rows={3}
              />
            </div>

            <Button 
              onClick={realizarAnalise} 
              disabled={carregando || !pessoaSelecionada}
              className="w-full"
            >
              {carregando ? 'Analisando...' : 'Gerar Análise com IA'}
            </Button>
          </CardContent>
        </Card>

        {/* Histórico */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Histórico</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historico && historico.length > 0 ? (
              <div className="space-y-3">
                {historico.map((item) => (
                  <div key={item.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">
                        {getTipoAnaliseLabel(item.tipo_analise)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.resultado.substring(0, 100)}...
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma análise encontrada
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resultado */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Resultado da Análise</span>
            </CardTitle>
            <CardDescription>
              Análise pastoral gerada pela inteligência artificial
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resultadoAnalise ? (
              <div className="prose prose-sm max-w-none">
                {formatarAnalise(resultadoAnalise)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Análise Pastoral com IA</h3>
                <p className="text-muted-foreground max-w-md">
                  Selecione uma pessoa e tipo de análise para gerar insights 
                  pastorais personalizados com inteligência artificial.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};