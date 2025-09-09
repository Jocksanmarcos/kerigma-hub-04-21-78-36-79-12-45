import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Calendar, DollarSign, Tag, User, Building2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logTransacaoFinanceira } from '@/utils/auditFinanceiro';
import { uploadFileWithRetry } from '@/utils/uploadManager';

interface FormularioLancamentoProps {
  trigger?: React.ReactNode;
}

export const FormularioLancamento: React.FC<FormularioLancamentoProps> = ({ trigger }) => {
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('receita');
  const [categorias, setCategorias] = useState<any[]>([]);
  const [contas, setContas] = useState<any[]>([]);
  const [fundos, setFundos] = useState<any[]>([]);
  const [pessoas, setPessoas] = useState<any[]>([]);
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    dataLancamento: new Date().toISOString().split('T')[0],
    categoria: '',
    conta: '',
    formaPagamento: 'dinheiro',
    pessoa: '',
    fundo: '',
    observacoes: '',
    recorrente: false,
    recorrenciaTipo: 'mensal',
    numeroDocumento: '',
    comprovante: null as File | null
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Carregar categorias
      const { data: categoriasData } = await supabase
        .from('categorias_financeiras')
        .select('*')
        .eq('ativa', true)
        .order('nome');

      if (categoriasData) setCategorias(categoriasData);

      // Carregar contas
      const { data: contasData } = await supabase
        .from('contas_bancarias')
        .select('*')
        .eq('ativa', true)
        .order('nome');

      if (contasData) setContas(contasData);

      // Carregar fundos
      const { data: fundosData } = await supabase
        .from('fundos_contabeis')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (fundosData) setFundos(fundosData);

      // Carregar pessoas (apenas algumas para exemplo)
      const { data: pessoasData } = await supabase
        .from('pessoas')
        .select('id, nome_completo')
        .limit(50)
        .order('nome_completo');

      if (pessoasData) setPessoas(pessoasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const formasPagamento = [
    'dinheiro', 'pix', 'cartao_debito', 'cartao_credito', 'ted', 'boleto', 'cheque'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('lancamentos_financeiros_v2')
        .insert({
          tipo,
          descricao: formData.descricao,
          valor: parseFloat(formData.valor),
          data_lancamento: formData.dataLancamento,
          categoria_id: formData.categoria,
          conta_id: formData.conta,
          forma_pagamento: formData.formaPagamento,
          pessoa_id: formData.pessoa || null,
          fundo_id: formData.fundo || null,
          observacoes: formData.observacoes,
          numero_documento: formData.numeroDocumento,
          status: 'confirmado',
          comprovante_url: null
        })
        .select('id')
        .single();

      if (error) throw error;

      // Log de auditoria
      await logTransacaoFinanceira('CREATE', data.id, null, {
        tipo,
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        data_lancamento: formData.dataLancamento,
        categoria_id: formData.categoria,
        conta_id: formData.conta
      });

      // Upload de comprovante (se houver) com retry
      if (data?.id && formData.comprovante) {
        const path = `${data.id}/${Date.now()}_${formData.comprovante.name}`;
        
        const uploadResult = await uploadFileWithRetry(
          formData.comprovante, 
          path, 
          {
            bucket: 'financeiro-comprovantes',
            maxRetries: 3,
            onProgress: setUploadProgress,
            validateFile: (file) => file.size <= 10 * 1024 * 1024 // 10MB
          }
        );

        if (uploadResult.success) {
          // Atualizar lançamento com URL do comprovante
          await supabase
            .from('lancamentos_financeiros_v2')
            .update({ comprovante_url: uploadResult.url })
            .eq('id', data.id);
            
          // Log de auditoria com informações do comprovante
          await logTransacaoFinanceira('UPDATE', data.id, { comprovante_url: null }, { 
            comprovante_url: uploadResult.url,
            comprovante_path: path,
            upload_status: 'success'
          });
        } else {
          toast({
            title: "Aviso",
            description: `Lançamento salvo, mas falha no upload: ${uploadResult.error}`,
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Sucesso!",
        description: "Lançamento financeiro criado com sucesso.",
      });

      // Reset form
      setFormData({
        descricao: '',
        valor: '',
        dataLancamento: new Date().toISOString().split('T')[0],
        categoria: '',
        conta: '',
        formaPagamento: 'dinheiro',
        pessoa: '',
        fundo: '',
        observacoes: '',
        recorrente: false,
        recorrenciaTipo: 'mensal',
        numeroDocumento: '',
        comprovante: null
      });

      window.location.reload(); // Recarregar para atualizar dados
    } catch (error) {
      console.error('Erro ao salvar lançamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o lançamento.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, comprovante: file }));
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 bg-gradient-to-r from-primary to-blue-600">
            <Plus className="h-4 w-4" />
            Novo Lançamento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Novo Lançamento Financeiro
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Lançamento */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant={tipo === 'receita' ? 'default' : 'outline'}
              onClick={() => setTipo('receita')}
              className="flex-1 h-12 gap-2"
            >
              <DollarSign className="h-4 w-4" />
              Receita
            </Button>
            <Button
              type="button"
              variant={tipo === 'despesa' ? 'default' : 'outline'}
              onClick={() => setTipo('despesa')}
              className="flex-1 h-12 gap-2"
            >
              <DollarSign className="h-4 w-4" />
              Despesa
            </Button>
          </div>

          <Tabs defaultValue="dados-basicos" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dados-basicos">Dados Básicos</TabsTrigger>
              <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
              <TabsTrigger value="anexos">Anexos</TabsTrigger>
            </TabsList>

            <TabsContent value="dados-basicos" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Input
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Ex: Dízimos do domingo, Conta de luz..."
                    required
                  />
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
                  <Label htmlFor="dataLancamento">Data do Lançamento *</Label>
                  <Input
                    id="dataLancamento"
                    type="date"
                    value={formData.dataLancamento}
                    onChange={(e) => setFormData(prev => ({ ...prev, dataLancamento: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias
                        .filter(cat => cat.tipo === tipo)
                        .map((categoria) => (
                        <SelectItem key={categoria.id} value={categoria.id}>
                          {categoria.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="conta">Conta *</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, conta: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {contas.map((conta) => (
                        <SelectItem key={conta.id} value={conta.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{conta.nome}</span>
                            <Badge variant="outline" className="text-xs">
                              {conta.tipo_conta}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, formaPagamento: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Dinheiro" />
                    </SelectTrigger>
                    <SelectContent>
                      {formasPagamento.map((forma) => (
                        <SelectItem key={forma} value={forma}>
                          {forma.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="detalhes" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pessoa">Pessoa Relacionada</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, pessoa: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Buscar membro..." />
                    </SelectTrigger>
                    <SelectContent>
                      {pessoas.map((pessoa) => (
                        <SelectItem key={pessoa.id} value={pessoa.id}>
                          {pessoa.nome_completo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="numeroDocumento">Número do Documento</Label>
                  <Input
                    id="numeroDocumento"
                    value={formData.numeroDocumento}
                    onChange={(e) => setFormData(prev => ({ ...prev, numeroDocumento: e.target.value }))}
                    placeholder="Ex: 001, NF-123..."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="fundo">Fundo Contábil</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, fundo: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um fundo" />
                  </SelectTrigger>
                  <SelectContent>
                    {fundos.map((fundo) => (
                      <SelectItem key={fundo.id} value={fundo.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: fundo.cor }}
                          ></div>
                          {fundo.nome}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Informações adicionais sobre o lançamento..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="recorrente"
                  checked={formData.recorrente}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, recorrente: checked }))}
                />
                <Label htmlFor="recorrente">Lançamento recorrente</Label>
              </div>

              {formData.recorrente && (
                <div>
                  <Label htmlFor="recorrenciaTipo">Frequência</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, recorrenciaTipo: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Mensal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mensal">Mensal</SelectItem>
                      <SelectItem value="trimestral">Trimestral</SelectItem>
                      <SelectItem value="semestral">Semestral</SelectItem>
                      <SelectItem value="anual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </TabsContent>

            <TabsContent value="anexos" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Comprovante
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Clique para fazer upload ou arraste o arquivo aqui
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, JPG, PNG até 10MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  {formData.comprovante && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Arquivo selecionado:</p>
                      <p className="text-sm text-muted-foreground">{formData.comprovante.name}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-primary to-blue-600">
              Salvar Lançamento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};