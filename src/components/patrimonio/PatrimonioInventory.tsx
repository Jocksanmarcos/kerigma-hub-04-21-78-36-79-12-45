import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Edit,
  Download,
  FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface PatrimonioItem {
  id: string;
  codigo_patrimonio: string;
  nome: string;
  descricao: string;
  categoria: string;
  valor_aquisicao: number;
  status: string;
  localizacao_atual: string;
  created_at: string;
}

export const PatrimonioInventory: React.FC = () => {
  const [patrimonios, setPatrimonios] = useState<PatrimonioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchPatrimonios();
  }, []);

  const fetchPatrimonios = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration - will be replaced with real DB calls
      const mockData: PatrimonioItem[] = [
        {
          id: '1',
          codigo_patrimonio: 'PAT001234',
          nome: 'Projetor Samsung',
          descricao: 'Projetor para apresentações',
          categoria: 'Eletrônicos',
          valor_aquisicao: 2500,
          status: 'ativo',
          localizacao_atual: 'Sala Principal',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          codigo_patrimonio: 'PAT002345',
          nome: 'Mesa de Som',
          descricao: 'Mesa de som Behringer',
          categoria: 'Instrumentos',
          valor_aquisicao: 3500,
          status: 'ativo',
          localizacao_atual: 'Sala de Som',
          created_at: new Date().toISOString()
        }
      ];
      setPatrimonios(mockData);
    } catch (error) {
      console.error('Erro ao carregar patrimônios:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar lista de patrimônios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return <Badge variant="default" className="bg-success text-success-foreground"><CheckCircle className="w-3 h-3 mr-1" />Ativo</Badge>;
      case 'manutencao':
        return <Badge variant="secondary" className="bg-warning text-warning-foreground"><AlertTriangle className="w-3 h-3 mr-1" />Manutenção</Badge>;
      case 'inativo':
        return <Badge variant="outline"><Package className="w-3 h-3 mr-1" />Inativo</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredPatrimonios = patrimonios.filter(item =>
    item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.codigo_patrimonio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToPDF = () => {
    toast({ title: "Exportando PDF", description: "Funcionalidade será implementada em breve" });
  };

  const exportToExcel = () => {
    toast({ title: "Exportando Excel", description: "Funcionalidade será implementada em breve" });
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Inventário de Patrimônio</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button onClick={exportToPDF} variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Gerar PDF
          </Button>
          <Button onClick={exportToExcel} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar XLSX
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Novo Item
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nome, código ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Itens</p>
                <p className="text-2xl font-bold">{patrimonios.length}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold text-success">
                  {patrimonios.filter(p => p.status === 'ativo').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Manutenção</p>
                <p className="text-2xl font-bold text-warning">
                  {patrimonios.filter(p => p.status === 'manutencao').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">
                  R$ {patrimonios.reduce((sum, p) => sum + (p.valor_aquisicao || 0), 0).toLocaleString('pt-BR')}
                </p>
              </div>
              <Package className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Patrimônio</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatrimonios.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.codigo_patrimonio}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.nome}</p>
                          <p className="text-sm text-muted-foreground">{item.descricao}</p>
                        </div>
                      </TableCell>
                      <TableCell>{item.categoria}</TableCell>
                      <TableCell>R$ {item.valor_aquisicao?.toLocaleString('pt-BR') || '0,00'}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>{item.localizacao_atual || 'Não informado'}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredPatrimonios.length === 0 && !loading && (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">Nenhum item encontrado</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Começe adicionando um novo item ao patrimônio.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};