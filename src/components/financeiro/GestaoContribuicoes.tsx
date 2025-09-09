import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, Gift, Star, Search, Plus, Calendar, DollarSign, User, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const GestaoContribuicoes: React.FC = () => {
  const [buscarMembro, setBuscarMembro] = useState('');
  const [contribuicaoSelecionada, setContribuicaoSelecionada] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [membros, setMembros] = useState<any[]>([]);
  const [fundos, setFundos] = useState<any[]>([]);
  const [contribuicoesRecentes, setContribuicoesRecentes] = useState<any[]>([]);
  const [estatisticasContribuicoes, setEstatisticasContribuicoes] = useState<any>({
    totalMes: 0,
    dizimos: 0,
    ofertas: 0,
    ofertasEspeciais: 0,
    crescimentoMes: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar membros/pessoas
      const { data: pessoasData } = await supabase
        .from('pessoas')
        .select('id, nome_completo, telefone, email')
        .eq('situacao', 'ativo')
        .order('nome_completo')
        .limit(100);

      if (pessoasData) setMembros(pessoasData);

      // Carregar fundos contábeis
      const { data: fundosData } = await supabase
        .from('fundos_contabeis')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (fundosData) setFundos(fundosData);

      // Carregar contribuições recentes
      const { data: contribuicoes } = await supabase
        .from('lancamentos_financeiros_v2')
        .select(`
          *,
          categorias_financeiras(nome),
          pessoas(nome_completo),
          fundos_contabeis(nome, cor)
        `)
        .eq('tipo', 'receita')
        .order('created_at', { ascending: false })
        .limit(20);

      if (contribuicoes) {
        setContribuicoesRecentes(contribuicoes);
      }

      // Calcular estatísticas do mês atual
      const mesAtual = new Date();
      const primeiroDiaMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
      const ultimoDiaMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);

      const { data: receitasMes } = await supabase
        .from('lancamentos_financeiros_v2')
        .select('valor, categorias_financeiras(nome)')
        .eq('tipo', 'receita')
        .eq('status', 'confirmado')
        .gte('data_lancamento', primeiroDiaMes.toISOString().split('T')[0])
        .lte('data_lancamento', ultimoDiaMes.toISOString().split('T')[0]);

      if (receitasMes) {
        const totalMes = receitasMes.reduce((sum, r) => sum + r.valor, 0);
        const dizimos = receitasMes
          .filter(r => (r.categorias_financeiras as any)?.nome === 'Dízimos')
          .reduce((sum, r) => sum + r.valor, 0);
        const ofertas = receitasMes
          .filter(r => (r.categorias_financeiras as any)?.nome === 'Ofertas')
          .reduce((sum, r) => sum + r.valor, 0);
        const ofertasEspeciais = receitasMes
          .filter(r => (r.categorias_financeiras as any)?.nome === 'Ofertas Especiais')
          .reduce((sum, r) => sum + r.valor, 0);

        setEstatisticasContribuicoes({
          totalMes,
          dizimos,
          ofertas,
          ofertasEspeciais,
          crescimentoMes: 0 // Pode ser calculado comparando com mês anterior
        });
      }

    } catch (error) {
      console.error('Erro ao carregar dados de contribuições:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de contribuições.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const membrosFiltrados = membros.filter(membro =>
    membro.nome_completo?.toLowerCase().includes(buscarMembro.toLowerCase()) ||
    membro.telefone?.includes(buscarMembro) ||
    membro.email?.toLowerCase().includes(buscarMembro.toLowerCase())
  );

  const getTipoIcon = (categoria: string) => {
    if (categoria?.toLowerCase().includes('dízimo')) return <Heart className="h-4 w-4" />;
    if (categoria?.toLowerCase().includes('oferta')) return <Gift className="h-4 w-4" />;
    if (categoria?.toLowerCase().includes('especial')) return <Star className="h-4 w-4" />;
    return <DollarSign className="h-4 w-4" />;
  };

  const getTipoLabel = (categoria: string) => {
    if (categoria?.toLowerCase().includes('dízimo')) return 'Dízimo';
    if (categoria?.toLowerCase().includes('oferta especial')) return 'Oferta Especial';
    if (categoria?.toLowerCase().includes('oferta')) return 'Oferta';
    return categoria || 'Contribuição';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const FormularioContribuicao = () => {
    const [formData, setFormData] = useState({
      tipo: 'dizimo',
      membro: '',
      valor: '',
      fundo: '1',
      metodo: 'dinheiro',
      observacoes: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!formData.membro || !formData.valor) {
        toast({
          title: "Erro",
          description: "Membro e valor são obrigatórios.",
          variant: "destructive",
        });
        return;
      }

      try {
        // Buscar categoria baseada no tipo
        const { data: categorias } = await supabase
          .from('categorias_financeiras')
          .select('id')
          .eq('tipo', 'receita')
          .ilike('nome', `%${formData.tipo === 'dizimo' ? 'dízimo' : formData.tipo === 'oferta_especial' ? 'oferta especial' : 'oferta'}%`)
          .limit(1);

        const categoriaId = categorias?.[0]?.id;

        // Buscar primeira conta ativa
        const { data: contas } = await supabase
          .from('contas_bancarias')
          .select('id')
          .eq('ativa', true)
          .limit(1);

        const contaId = contas?.[0]?.id;

        const { data, error } = await supabase
          .from('lancamentos_financeiros_v2')
          .insert({
            tipo: 'receita',
            descricao: `${getTipoLabel(formData.tipo)} - ${membros.find(m => m.id === formData.membro)?.nome_completo}`,
            valor: parseFloat(formData.valor),
            data_lancamento: new Date().toISOString().split('T')[0],
            categoria_id: categoriaId,
            conta_id: contaId,
            forma_pagamento: formData.metodo,
            pessoa_id: formData.membro,
            fundo_id: formData.fundo || null,
            observacoes: formData.observacoes || `${getTipoLabel(formData.tipo)} registrado via sistema`,
            status: 'confirmado'
          });

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Contribuição registrada com sucesso.",
        });

        // Reset form
        setFormData({
          tipo: 'dizimo',
          membro: '',
          valor: '',
          fundo: '1',
          metodo: 'dinheiro',
          observacoes: ''
        });

        // Recarregar dados
        loadData();

      } catch (error) {
        console.error('Erro ao salvar contribuição:', error);
        toast({
          title: "Erro",
          description: "Não foi possível registrar a contribuição.",
          variant: "destructive",
        });
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant={formData.tipo === 'dizimo' ? 'default' : 'outline'}
            onClick={() => setFormData(prev => ({ ...prev, tipo: 'dizimo' }))}
            className="gap-2"
          >
            <Heart className="h-4 w-4" />
            Dízimo
          </Button>
          <Button
            type="button"
            variant={formData.tipo === 'oferta' ? 'default' : 'outline'}
            onClick={() => setFormData(prev => ({ ...prev, tipo: 'oferta' }))}
            className="gap-2"
          >
            <Gift className="h-4 w-4" />
            Oferta
          </Button>
          <Button
            type="button"
            variant={formData.tipo === 'oferta_especial' ? 'default' : 'outline'}
            onClick={() => setFormData(prev => ({ ...prev, tipo: 'oferta_especial' }))}
            className="gap-2"
          >
            <Star className="h-4 w-4" />
            Especial
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="membro">Membro *</Label>
            <Select onValueChange={(value) => setFormData(prev => ({ ...prev, membro: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Buscar membro..." />
              </SelectTrigger>
              <SelectContent>
                {membros.map((membro) => (
                  <SelectItem key={membro.id} value={membro.id}>
                    <div>
                      <p className="font-medium">{membro.nome_completo}</p>
                      <p className="text-xs text-muted-foreground">{membro.telefone}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="valor">Valor *</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              value={formData.valor}
              onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
              placeholder="0,00"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fundo">Fundo Contábil</Label>
            <Select onValueChange={(value) => setFormData(prev => ({ ...prev, fundo: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fundos.map((fundo) => (
                  <SelectItem key={fundo.id} value={fundo.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: fundo.cor }}
                      ></div>
                      <div>
                        <p className="font-medium">{fundo.nome}</p>
                        <p className="text-xs text-muted-foreground">{fundo.descricao}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="metodo">Método de Pagamento</Label>
            <Select onValueChange={(value) => setFormData(prev => ({ ...prev, metodo: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Dinheiro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
                <SelectItem value="cartao_debito">Cartão Débito</SelectItem>
                <SelectItem value="cartao_credito">Cartão Crédito</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline">
            Cancelar
          </Button>
          <Button type="submit" className="bg-gradient-to-r from-primary to-blue-600">
            Registrar Contribuição
          </Button>
        </div>
      </form>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total do Mês</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(estatisticasContribuicoes.totalMes)}</p>
                {estatisticasContribuicoes.crescimentoMes > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-emerald-600" />
                    <span className="text-xs text-emerald-600">+{estatisticasContribuicoes.crescimentoMes}%</span>
                  </div>
                )}
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dízimos</p>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(estatisticasContribuicoes.dizimos)}</p>
              </div>
              <Heart className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ofertas</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(estatisticasContribuicoes.ofertas)}</p>
              </div>
              <Gift className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Especiais</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(estatisticasContribuicoes.ofertasEspeciais)}</p>
              </div>
              <Star className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="registrar" className="w-full">
        <TabsList>
          <TabsTrigger value="registrar">Registrar Contribuição</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="fundos">Fundos Contábeis</TabsTrigger>
        </TabsList>

        <TabsContent value="registrar" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Formulário */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Nova Contribuição
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormularioContribuicao />
              </CardContent>
            </Card>

            {/* Busca rápida de membros */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Busca Rápida de Membros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    placeholder="Digite nome, telefone ou email..."
                    value={buscarMembro}
                    onChange={(e) => setBuscarMembro(e.target.value)}
                    className="w-full"
                  />
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {membrosFiltrados.length > 0 ? membrosFiltrados.map((membro) => (
                      <div key={membro.id} className="p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">{membro.nome_completo}</p>
                            <p className="text-sm text-muted-foreground">{membro.telefone}</p>
                            <p className="text-xs text-muted-foreground">{membro.email}</p>
                          </div>
                          <Button size="sm" variant="outline">
                            <User className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <p className="text-sm">Nenhum membro encontrado</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="historico" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Contribuições Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contribuicoesRecentes.length > 0 ? (
                  contribuicoesRecentes.map((contribuicao) => (
                    <div key={contribuicao.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                          {getTipoIcon(contribuicao.categorias_financeiras?.nome)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{contribuicao.pessoas?.nome_completo || 'Contribuinte anônimo'}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {getTipoLabel(contribuicao.categorias_financeiras?.nome)}
                            </Badge>
                            <span>•</span>
                            <span>{contribuicao.fundos_contabeis?.nome || 'Geral'}</span>
                            <span>•</span>
                            <span>{new Date(contribuicao.data_lancamento).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">{formatCurrency(contribuicao.valor)}</p>
                        <p className="text-xs text-muted-foreground">{contribuicao.forma_pagamento}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma contribuição encontrada</p>
                    <p className="text-xs mt-2">Registre a primeira contribuição usando o formulário acima</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fundos" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {fundos.length > 0 ? (
              fundos.map((fundo) => (
                <Card key={fundo.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: fundo.cor }}
                          ></div>
                          <p className="text-sm font-medium text-muted-foreground">{fundo.nome}</p>
                        </div>
                        <p className="text-2xl font-bold text-foreground">R$ 0,00</p>
                        <p className="text-xs text-muted-foreground mt-1">{fundo.descricao}</p>
                      </div>
                      <DollarSign className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum fundo contábil encontrado</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};