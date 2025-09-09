import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Phone, Calendar, MessageSquare, User, Clock, CheckCircle, XCircle } from 'lucide-react';

export const GestaoVisitantes: React.FC = () => {
  const [novoVisitante, setNovoVisitante] = useState(false);

  const visitantes = [
    {
      id: 1,
      nome: 'Roberto Silva',
      telefone: '(11) 99999-1111',
      email: 'roberto@email.com',
      idade: 32,
      dataVisita: '2024-01-10',
      retornou: false,
      status: 'Pendente',
      celula: 'Célula Jardim Europa',
      comoConheceu: 'Convite de um amigo',
      observacoes: 'Interessado em conhecer mais sobre a fé',
      proximoContato: '2024-01-15'
    },
    {
      id: 2,
      nome: 'Ana Oliveira',
      telefone: '(11) 99999-2222',
      email: 'ana@email.com',
      idade: 28,
      dataVisita: '2024-01-08',
      retornou: true,
      status: 'Contatado',
      celula: 'Célula Centro',
      comoConheceu: 'Evento da igreja',
      observacoes: 'Muito receptiva, já voltou na segunda visita',
      proximoContato: '2024-01-16'
    },
    {
      id: 3,
      nome: 'Carlos Mendes',
      telefone: '(11) 99999-3333',
      email: 'carlos@email.com',
      idade: 45,
      dataVisita: '2024-01-05',
      retornou: false,
      status: 'Agendado',
      celula: 'Célula Vila Nova',
      comoConheceu: 'Campanha evangelística',
      observacoes: 'Agendada visita pastoral para quinta-feira',
      proximoContato: '2024-01-18'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Contatado':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Agendado':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Convertido':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'Sem interesse':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Visitantes</h2>
          <p className="text-muted-foreground">
            Acompanhamento automatizado do processo de integração
          </p>
        </div>
        <Button 
          onClick={() => setNovoVisitante(!novoVisitante)}
          className="shrink-0"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Visitante
        </Button>
      </div>

      {/* Formulário Novo Visitante */}
      {novoVisitante && (
        <Card>
          <CardHeader>
            <CardTitle>Cadastrar Novo Visitante</CardTitle>
            <CardDescription>
              Registre um novo visitante para acompanhamento automático
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Nome Completo</label>
                <Input placeholder="Nome do visitante" />
              </div>
              <div>
                <label className="text-sm font-medium">Telefone</label>
                <Input placeholder="(11) 99999-9999" />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input placeholder="email@exemplo.com" />
              </div>
              <div>
                <label className="text-sm font-medium">Idade</label>
                <Input type="number" placeholder="Idade" />
              </div>
              <div>
                <label className="text-sm font-medium">Célula Visitada</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a célula" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jardim-europa">Célula Jardim Europa</SelectItem>
                    <SelectItem value="centro">Célula Centro</SelectItem>
                    <SelectItem value="vila-nova">Célula Vila Nova</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Como Conheceu</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Como conheceu a igreja" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amigo">Convite de um amigo</SelectItem>
                    <SelectItem value="evento">Evento da igreja</SelectItem>
                    <SelectItem value="campanha">Campanha evangelística</SelectItem>
                    <SelectItem value="site">Site da igreja</SelectItem>
                    <SelectItem value="redes">Redes sociais</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Observações</label>
                <Textarea placeholder="Observações sobre o visitante..." />
              </div>
            </div>
            <div className="flex space-x-2 mt-4">
              <Button>Cadastrar Visitante</Button>
              <Button variant="outline" onClick={() => setNovoVisitante(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitantes Este Mês</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">+8 vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Retorno</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">64%</div>
            <p className="text-xs text-muted-foreground">14 de 23 retornaram</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversões</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">8</div>
            <p className="text-xs text-muted-foreground">Novos membros integrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">5</div>
            <p className="text-xs text-muted-foreground">Aguardando contato</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Visitantes */}
      <Card>
        <CardHeader>
          <CardTitle>Visitantes em Acompanhamento</CardTitle>
          <CardDescription>
            Lista de visitantes com status do acompanhamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {visitantes.map((visitante) => (
              <div key={visitante.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-muted rounded-full">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">{visitante.nome}</h4>
                      <p className="text-sm text-muted-foreground">{visitante.celula}</p>
                      <p className="text-xs text-muted-foreground">
                        Visitou em {new Date(visitante.dataVisita).toLocaleDateString('pt-BR')} • {visitante.idade} anos
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(visitante.status)}>
                      {visitante.status}
                    </Badge>
                    {visitante.retornou && (
                      <Badge variant="outline" className="text-emerald-600">
                        Retornou
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <div className="text-sm">
                    <span className="font-medium">Contato:</span> {visitante.telefone}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Como conheceu:</span> {visitante.comoConheceu}
                  </div>
                  <div className="text-sm md:col-span-2">
                    <span className="font-medium">Observações:</span> {visitante.observacoes}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Próximo contato:</span> {new Date(visitante.proximoContato).toLocaleDateString('pt-BR')}
                  </div>
                </div>

                <div className="flex space-x-2 mt-4">
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Ligar
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button size="sm" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar
                  </Button>
                  <Select>
                    <SelectTrigger className="w-[140px] h-8">
                      <SelectValue placeholder="Atualizar status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="contatado">Contatado</SelectItem>
                      <SelectItem value="agendado">Agendado</SelectItem>
                      <SelectItem value="convertido">Convertido</SelectItem>
                      <SelectItem value="sem-interesse">Sem interesse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fluxo Automatizado */}
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Acompanhamento Automatizado</CardTitle>
          <CardDescription>
            Como o sistema automaticamente acompanha novos visitantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <h4 className="font-medium">Cadastro Automático</h4>
                <p className="text-sm text-muted-foreground">
                  Quando um líder reporta um visitante, o sistema cria automaticamente uma tarefa de acompanhamento
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <h4 className="font-medium">Atribuição ao Supervisor</h4>
                <p className="text-sm text-muted-foreground">
                  A tarefa é automaticamente atribuída ao supervisor da célula com prazo de 48h para primeiro contato
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
              <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <h4 className="font-medium">Lembretes Inteligentes</h4>
                <p className="text-sm text-muted-foreground">
                  Sistema envia lembretes e sugere próximas ações baseadas no status do visitante
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
              <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
              <div>
                <h4 className="font-medium">Integração na Jornada do Membro</h4>
                <p className="text-sm text-muted-foreground">
                  Visitantes convertidos são automaticamente inseridos na jornada de crescimento da igreja
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};