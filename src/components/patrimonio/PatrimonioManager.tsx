import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UniversalExport } from '@/components/exports/UniversalExport';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PatrimonioItem {
  id: string;
  codigo_patrimonio: string;
  nome: string;
  categoria: string;
  status: string;
  valor_aquisicao: number;
  localizacao_atual: string;
  created_at: string;
}

export const PatrimonioManager: React.FC = () => {
  const [items, setItems] = useState<PatrimonioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchPatrimonio();
  }, []);

  const fetchPatrimonio = async () => {
    try {
      // Mock data for now since patrimonio table might not exist yet
      const mockData: PatrimonioItem[] = [
        {
          id: '1',
          codigo_patrimonio: 'PAT001',
          nome: 'Computador Dell Inspiron',
          categoria: 'Informática',
          status: 'ativo',
          valor_aquisicao: 2500.00,
          localizacao_atual: 'Secretaria',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          codigo_patrimonio: 'PAT002',
          nome: 'Projetor Epson',
          categoria: 'Audiovisual',
          status: 'em_manutencao',
          valor_aquisicao: 1800.00,
          localizacao_atual: 'Auditório',
          created_at: new Date().toISOString(),
        },
      ];
      
      setItems(mockData);

    } catch (error) {
      toast({
        title: 'Erro ao carregar patrimônio',
        description: 'Não foi possível carregar os itens do patrimônio.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.codigo_patrimonio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportColumns = [
    { key: 'codigo_patrimonio', header: 'Código', width: 15 },
    { key: 'nome', header: 'Nome', width: 25 },
    { key: 'categoria', header: 'Categoria', width: 15 },
    { key: 'status', header: 'Status', width: 12 },
    { key: 'valor_aquisicao', header: 'Valor', width: 12 },
    { key: 'localizacao_atual', header: 'Localização', width: 20 },
    { key: 'created_at', header: 'Data Cadastro', width: 15 },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'em_manutencao': return 'bg-yellow-100 text-yellow-800';
      case 'inativo': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar patrimônio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <UniversalExport
            data={filteredItems}
            filename="patrimonio"
            title="Relatório de Patrimônio"
            columns={exportColumns}
          />
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Item
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{items.length}</div>
            <p className="text-xs text-muted-foreground">Total de Itens</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {items.filter(i => i.status === 'ativo').length}
            </div>
            <p className="text-xs text-muted-foreground">Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {items.filter(i => i.status === 'em_manutencao').length}
            </div>
            <p className="text-xs text-muted-foreground">Em Manutenção</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">
              R$ {items.reduce((total, item) => total + (item.valor_aquisicao || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Valor Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{item.nome}</CardTitle>
                  <CardDescription className="text-sm">
                    {item.codigo_patrimonio}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(item.status)}>
                  {item.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Categoria:</span>
                  <span>{item.categoria}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Valor:</span>
                  <span className="font-medium">
                    R$ {(item.valor_aquisicao || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Local:</span>
                  <span className="text-right">{item.localizacao_atual}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground">
              {searchTerm ? 'Nenhum item encontrado para sua busca.' : 'Nenhum item de patrimônio cadastrado.'}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};