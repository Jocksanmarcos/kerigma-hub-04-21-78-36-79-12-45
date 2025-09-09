import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MapPin, Search, Filter, Eye, Phone, MessageCircle, Navigation } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Pessoa {
  id: string;
  nome_completo: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  foto_url?: string;
  tipo_pessoa: string;
  situacao: string;
}

interface RegiaoEstatistica {
  regiao: string;
  total_pessoas: number;
  membros: number;
  visitantes: number;
  porcentagem: number;
}

const MapaLocalizacao: React.FC = () => {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [regioes, setRegioes] = useState<RegiaoEstatistica[]>([]);
  const [filtroRegiao, setFiltroRegiao] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPessoa, setSelectedPessoa] = useState<Pessoa | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPessoas();
  }, []);

  const loadPessoas = async () => {
    try {
      const { data, error } = await supabase
        .from('pessoas')
        .select(`
          id,
          nome_completo,
          email,
          telefone,
          endereco,
          foto_url,
          tipo_pessoa,
          situacao
        `)
        .eq('situacao', 'ativo')
        .not('endereco', 'is', null)
        .order('nome_completo');

      if (error) throw error;

      const pessoasData = data || [];
      setPessoas(pessoasData);
      
      // Calcular estatísticas por região
      const estatisticasPorRegiao = calcularEstatisticasPorRegiao(pessoasData);
      setRegioes(estatisticasPorRegiao);
    } catch (error) {
      console.error('Erro ao carregar pessoas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados de localização.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calcularEstatisticasPorRegiao = (pessoas: Pessoa[]): RegiaoEstatistica[] => {
    const regioesMapa = new Map<string, { total: number; membros: number; visitantes: number }>();

    pessoas.forEach(pessoa => {
      // Extrair região do endereço (usar cidade ou endereço)
      let regiao = 'Não informado';
      if (pessoa.endereco) {
        // Tentar extrair cidade/bairro do endereço
        const partes = pessoa.endereco.split(',');
        if (partes.length > 1) {
          regiao = partes[partes.length - 2].trim(); // Segunda última parte costuma ser a cidade
        } else {
          regiao = pessoa.endereco.split(' ')[0]; // Primeira palavra do endereço
        }
      }
      
      const atual = regioesMapa.get(regiao) || { total: 0, membros: 0, visitantes: 0 };
      
      atual.total += 1;
      if (pessoa.tipo_pessoa === 'membro') {
        atual.membros += 1;
      } else {
        atual.visitantes += 1;
      }
      
      regioesMapa.set(regiao, atual);
    });

    const totalPessoas = pessoas.length;
    
    return Array.from(regioesMapa.entries())
      .map(([regiao, stats]) => ({
        regiao,
        total_pessoas: stats.total,
        membros: stats.membros,
        visitantes: stats.visitantes,
        porcentagem: totalPessoas > 0 ? (stats.total / totalPessoas) * 100 : 0
      }))
      .sort((a, b) => b.total_pessoas - a.total_pessoas);
  };

  const pessoasFiltradas = pessoas.filter(pessoa => {
    const matchSearch = pessoa.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       pessoa.endereco?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Extrair região para filtro
    let regiaoAtual = 'Não informado';
    if (pessoa.endereco) {
      const partes = pessoa.endereco.split(',');
      if (partes.length > 1) {
        regiaoAtual = partes[partes.length - 2].trim();
      } else {
        regiaoAtual = pessoa.endereco.split(' ')[0];
      }
    }
    
    const matchRegiao = filtroRegiao === 'all' || regiaoAtual === filtroRegiao;

    return matchSearch && matchRegiao;
  });

  const abrirMapa = (endereco: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;
    window.open(url, '_blank');
  };

  const obterCoordenadas = async (endereco: string) => {
    // Esta seria uma implementação real de geocoding
    // Por enquanto, apenas abre o Google Maps
    abrirMapa(endereco);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nome, endereço ou bairro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={filtroRegiao} onValueChange={setFiltroRegiao}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por região" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as regiões</SelectItem>
            {regioes.map((regiao) => (
              <SelectItem key={regiao.regiao} value={regiao.regiao}>
                {regiao.regiao} ({regiao.total_pessoas})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Estatísticas por região */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {regioes.slice(0, 6).map((regiao) => (
          <Card key={regiao.regiao} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold truncate">{regiao.regiao}</h3>
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total de pessoas:</span>
                  <span className="font-medium">{regiao.total_pessoas}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Membros:</span>
                  <span className="text-green-600">{regiao.membros}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Visitantes:</span>
                  <span className="text-blue-600">{regiao.visitantes}</span>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Representatividade</span>
                    <span>{regiao.porcentagem.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${regiao.porcentagem}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lista de pessoas com localização */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Membros por Localização ({pessoasFiltradas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pessoasFiltradas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma pessoa encontrada com os filtros aplicados
            </div>
          ) : (
            <div className="space-y-3">
              {pessoasFiltradas.map((pessoa) => (
                <PessoaCard
                  key={pessoa.id}
                  pessoa={pessoa}
                  onVerMapa={() => pessoa.endereco && abrirMapa(pessoa.endereco)}
                  onVerDetalhes={() => setSelectedPessoa(pessoa)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalhes da pessoa */}
      <Dialog open={!!selectedPessoa} onOpenChange={() => setSelectedPessoa(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes de Localização</DialogTitle>
          </DialogHeader>
          {selectedPessoa && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedPessoa.foto_url} alt={selectedPessoa.nome_completo} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {selectedPessoa.nome_completo.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedPessoa.nome_completo}</h3>
                  <Badge variant="outline">{selectedPessoa.tipo_pessoa}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Contato</h4>
                  <div className="space-y-2 text-sm">
                    {selectedPessoa.email && (
                      <p><span className="text-muted-foreground">Email:</span> {selectedPessoa.email}</p>
                    )}
                    {selectedPessoa.telefone && (
                      <p><span className="text-muted-foreground">Telefone:</span> {selectedPessoa.telefone}</p>
                    )}
                  </div>
                </div>

                  <div>
                    <h4 className="font-medium mb-2">Localização</h4>
                    <div className="space-y-2 text-sm">
                      {selectedPessoa.endereco && (
                        <p><span className="text-muted-foreground">Endereço:</span> {selectedPessoa.endereco}</p>
                      )}
                    </div>
                  </div>
              </div>

              <div className="flex gap-2 pt-4">
                {selectedPessoa.endereco && (
                  <Button onClick={() => abrirMapa(selectedPessoa.endereco!)}>
                    <Navigation className="h-4 w-4 mr-2" />
                    Ver no Mapa
                  </Button>
                )}
                {selectedPessoa.telefone && (
                  <Button variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Componente para card de pessoa
interface PessoaCardProps {
  pessoa: Pessoa;
  onVerMapa: () => void;
  onVerDetalhes: () => void;
}

const PessoaCard: React.FC<PessoaCardProps> = ({ pessoa, onVerMapa, onVerDetalhes }) => {
  const formatarEndereco = (pessoa: Pessoa) => {
    return pessoa.endereco || 'Endereço não informado';
  };

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
      <Avatar className="h-12 w-12">
        <AvatarImage src={pessoa.foto_url} alt={pessoa.nome_completo} />
        <AvatarFallback className="bg-primary/10 text-primary">
          {pessoa.nome_completo.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold truncate">{pessoa.nome_completo}</h3>
          <Badge variant="outline" className="text-xs">
            {pessoa.tipo_pessoa}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {formatarEndereco(pessoa)}
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onVerDetalhes}>
          <Eye className="h-4 w-4" />
        </Button>
        {pessoa.endereco && (
          <Button variant="outline" size="sm" onClick={onVerMapa}>
            <MapPin className="h-4 w-4" />
          </Button>
        )}
        {pessoa.telefone && (
          <Button variant="outline" size="sm">
            <Phone className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default MapaLocalizacao;