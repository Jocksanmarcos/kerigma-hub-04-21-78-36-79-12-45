import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Target, 
  FileText, 
  Send, 
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

interface Ferramenta {
  id: string;
  nome: string;
  descricao: string;
  icone: React.ReactNode;
  categoria: 'comunicacao' | 'planejamento' | 'relatorios' | 'recursos';
  ativa: boolean;
}

interface NovaAtividade {
  titulo: string;
  tipo: string;
  data: string;
  celula: string;
  descricao: string;
}

export const FerramentasGestao: React.FC = () => {
  const [showNovaAtividade, setShowNovaAtividade] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [novaAtividade, setNovaAtividade] = useState<NovaAtividade>({
    titulo: '',
    tipo: '',
    data: '',
    celula: '',
    descricao: ''
  });

  const ferramentas: Ferramenta[] = [
    {
      id: '1',
      nome: 'Agenda Unificada',
      descricao: 'Visualize e gerencie todas as reuniões de células em um só lugar',
      icone: <Calendar className="h-6 w-6" />,
      categoria: 'planejamento',
      ativa: true
    },
    {
      id: '2',
      nome: 'Mapa de Localização',
      descricao: 'Visualize a distribuição geográfica das células',
      icone: <MapPin className="h-6 w-6" />,
      categoria: 'planejamento',
      ativa: true
    },
    {
      id: '3',
      nome: 'Comunicação em Massa',
      descricao: 'Envie mensagens para líderes e membros simultaneamente',
      icone: <Send className="h-6 w-6" />,
      categoria: 'comunicacao',
      ativa: true
    },
    {
      id: '4',
      nome: 'Relatórios Automáticos',
      descricao: 'Gere relatórios detalhados de performance das células',
      icone: <FileText className="h-6 w-6" />,
      categoria: 'relatorios',
      ativa: true
    },
    {
      id: '5',
      nome: 'Banco de Recursos',
      descricao: 'Acesse materiais de estudo e recursos para líderes',
      icone: <Target className="h-6 w-6" />,
      categoria: 'recursos',
      ativa: true
    },
    {
      id: '6',
      nome: 'Controle de Frequência',
      descricao: 'Sistema inteligente de controle de presença',
      icone: <Users className="h-6 w-6" />,
      categoria: 'planejamento',
      ativa: true
    }
  ];

  const categorias = [
    { value: 'todas', label: 'Todas as Categorias' },
    { value: 'comunicacao', label: 'Comunicação' },
    { value: 'planejamento', label: 'Planejamento' },
    { value: 'relatorios', label: 'Relatórios' },
    { value: 'recursos', label: 'Recursos' }
  ];

  const ferramentasFiltradas = filtroCategoria === 'todas' 
    ? ferramentas 
    : ferramentas.filter(f => f.categoria === filtroCategoria);

  const handleUsarFerramenta = (ferramenta: Ferramenta) => {
    switch (ferramenta.id) {
      case '1':
        // Agenda Unificada
        toast.success('📅 Abrindo agenda unificada das células...');
        break;
      case '2':
        // Mapa de Localização
        window.open('https://maps.google.com', '_blank');
        toast.success('🗺️ Mapa de localização das células aberto!');
        break;
      case '3':
        // Comunicação em Massa
        toast.success('📢 Sistema de comunicação em massa ativado!');
        break;
      case '4':
        // Relatórios
        toast.success('📊 Gerando relatórios automáticos...');
        break;
      case '5':
        // Recursos
        toast.success('📚 Acessando banco de recursos...');
        break;
      case '6':
        // Frequência
        toast.success('✅ Sistema de controle de frequência ativo!');
        break;
      default:
        toast.info(`Abrindo ${ferramenta.nome}...`);
    }
  };

  const handleCriarAtividade = () => {
    if (!novaAtividade.titulo || !novaAtividade.tipo || !novaAtividade.data) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    // Simular criação da atividade
    toast.success(`✅ Atividade "${novaAtividade.titulo}" criada com sucesso!`);
    
    // Resetar formulário
    setNovaAtividade({
      titulo: '',
      tipo: '',
      data: '',
      celula: '',
      descricao: ''
    });
    setShowNovaAtividade(false);
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'comunicacao':
        return 'bg-blue-500';
      case 'planejamento':
        return 'bg-green-500';
      case 'relatorios':
        return 'bg-purple-500';
      case 'recursos':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoriaLabel = (categoria: string) => {
    switch (categoria) {
      case 'comunicacao':
        return 'Comunicação';
      case 'planejamento':
        return 'Planejamento';
      case 'relatorios':
        return 'Relatórios';
      case 'recursos':
        return 'Recursos';
      default:
        return categoria;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros e Ações */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ferramentas de Gestão</CardTitle>
            <div className="flex space-x-2">
              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Dialog open={showNovaAtividade} onOpenChange={setShowNovaAtividade}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Atividade
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Nova Atividade</DialogTitle>
                    <DialogDescription>
                      Crie uma nova atividade ou evento para as células
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="titulo">Título *</Label>
                      <Input
                        id="titulo"
                        value={novaAtividade.titulo}
                        onChange={(e) => setNovaAtividade(prev => ({ ...prev, titulo: e.target.value }))}
                        placeholder="Ex: Reunião de Líderes"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="tipo">Tipo *</Label>
                      <Select 
                        value={novaAtividade.tipo} 
                        onValueChange={(value) => setNovaAtividade(prev => ({ ...prev, tipo: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reuniao">Reunião</SelectItem>
                          <SelectItem value="treinamento">Treinamento</SelectItem>
                          <SelectItem value="evento">Evento Especial</SelectItem>
                          <SelectItem value="multiplicacao">Multiplicação</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="data">Data *</Label>
                      <Input
                        id="data"
                        type="datetime-local"
                        value={novaAtividade.data}
                        onChange={(e) => setNovaAtividade(prev => ({ ...prev, data: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="celula">Célula</Label>
                      <Select 
                        value={novaAtividade.celula} 
                        onValueChange={(value) => setNovaAtividade(prev => ({ ...prev, celula: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a célula (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todas">Todas as Células</SelectItem>
                          <SelectItem value="celula1">Célula Central</SelectItem>
                          <SelectItem value="celula2">Célula Zona Sul</SelectItem>
                          <SelectItem value="celula3">Célula Jovem</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea
                        id="descricao"
                        value={novaAtividade.descricao}
                        onChange={(e) => setNovaAtividade(prev => ({ ...prev, descricao: e.target.value }))}
                        placeholder="Descreva os detalhes da atividade..."
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button onClick={handleCriarAtividade} className="flex-1">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Criar Atividade
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowNovaAtividade(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Grid de Ferramentas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ferramentasFiltradas.map((ferramenta) => (
          <Card key={ferramenta.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-muted rounded-lg">
                    {ferramenta.icone}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{ferramenta.nome}</CardTitle>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={`text-white ${getCategoriaColor(ferramenta.categoria)}`}>
                    {getCategoriaLabel(ferramenta.categoria)}
                  </Badge>
                  {ferramenta.ativa && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ativa
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {ferramenta.descricao}
              </p>
              <div className="flex space-x-2">
                <Button 
                  className="flex-1" 
                  onClick={() => handleUsarFerramenta(ferramenta)}
                  disabled={!ferramenta.ativa}
                >
                  {ferramenta.ativa ? 'Usar Ferramenta' : 'Indisponível'}
                </Button>
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status e Notificações */}
      <Card>
        <CardHeader>
          <CardTitle>Status do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Todas as ferramentas operacionais</span>
              </div>
              <Badge className="bg-green-500 text-white">100%</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Sincronização automática ativa</span>
              </div>
              <span className="text-sm text-muted-foreground">Última: há 5 min</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="font-medium">2 atualizações disponíveis</span>
              </div>
              <Button variant="outline" size="sm">
                Atualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};