import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarIcon, Clock, User, MapPin, Plus, Filter, Search, Edit, Trash2 } from 'lucide-react';

const CalendarioPage: React.FC = () => {
  const [filtro, setFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editandoEvento, setEditandoEvento] = useState<any>(null);
  const [eventos, setEventos] = useState([
    { id: 1, titulo: "Culto Domingo", data: "2024-01-21", horario: "09:00", local: "Santuário Principal", tipo: "culto", descricao: "Culto dominical" },
    { id: 2, titulo: "Reunião de Células", data: "2024-01-22", horario: "19:30", local: "Diversos", tipo: "celula", descricao: "Reuniões semanais das células" },
    { id: 3, titulo: "Escola Bíblica", data: "2024-01-24", horario: "19:00", local: "Sala 1", tipo: "ensino", descricao: "Aula de formação bíblica" },
    { id: 4, titulo: "Ensaio Ministério", data: "2024-01-25", horario: "20:00", local: "Santuário", tipo: "ministerio", descricao: "Ensaio do ministério de louvor" },
  ]);
  
  const [formData, setFormData] = useState({
    titulo: '',
    data: '',
    horario: '',
    local: '',
    tipo: 'culto',
    descricao: ''
  });

  React.useEffect(() => {
    document.title = "Calendário – Kerigma Hub";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Calendário de eventos e atividades");
  }, []);

  const getTipoBadge = (tipo: string) => {
    const config = {
      culto: { variant: "default" as const, label: "Culto" },
      celula: { variant: "secondary" as const, label: "Célula" },
      ensino: { variant: "outline" as const, label: "Ensino" },
      ministerio: { variant: "destructive" as const, label: "Ministério" }
    };
    const c = config[tipo as keyof typeof config] || config.culto;
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const eventosFiltrados = eventos.filter(evento => {
    const matchesFiltro = evento.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
                         evento.local.toLowerCase().includes(filtro.toLowerCase());
    const matchesTipo = tipoFiltro === 'todos' || evento.tipo === tipoFiltro;
    return matchesFiltro && matchesTipo;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editandoEvento) {
      setEventos(eventos.map(evento => 
        evento.id === editandoEvento.id ? { ...formData, id: editandoEvento.id } : evento
      ));
    } else {
      setEventos([...eventos, { ...formData, id: Date.now() }]);
    }
    setFormData({ titulo: '', data: '', horario: '', local: '', tipo: 'culto', descricao: '' });
    setEditandoEvento(null);
    setDialogOpen(false);
  };

  const handleEdit = (evento: any) => {
    setEditandoEvento(evento);
    setFormData(evento);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setEventos(eventos.filter(evento => evento.id !== id));
  };

  const resetForm = () => {
    setFormData({ titulo: '', data: '', horario: '', local: '', tipo: 'culto', descricao: '' });
    setEditandoEvento(null);
  };

  return (
    <AppLayout>
      <main className="space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">Calendário</h1>
            <p className="text-muted-foreground">Eventos e atividades programadas</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar eventos..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="max-w-xs"
              />
            </div>
            <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="culto">Culto</SelectItem>
                <SelectItem value="celula">Célula</SelectItem>
                <SelectItem value="ensino">Ensino</SelectItem>
                <SelectItem value="ministerio">Ministério</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Evento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editandoEvento ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="titulo">Título</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="data">Data</Label>
                      <Input
                        id="data"
                        type="date"
                        value={formData.data}
                        onChange={(e) => setFormData({...formData, data: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="horario">Horário</Label>
                      <Input
                        id="horario"
                        type="time"
                        value={formData.horario}
                        onChange={(e) => setFormData({...formData, horario: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="local">Local</Label>
                    <Input
                      id="local"
                      value={formData.local}
                      onChange={(e) => setFormData({...formData, local: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select value={formData.tipo} onValueChange={(value) => setFormData({...formData, tipo: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="culto">Culto</SelectItem>
                        <SelectItem value="celula">Célula</SelectItem>
                        <SelectItem value="ensino">Ensino</SelectItem>
                        <SelectItem value="ministerio">Ministério</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {editandoEvento ? 'Atualizar' : 'Criar'} Evento
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Próximos Eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventosFiltrados.map((evento) => (
                  <div key={evento.id} className="flex items-start gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center text-center min-w-[60px]">
                      <div className="text-xs text-muted-foreground">
                        {new Date(evento.data).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}
                      </div>
                      <div className="text-xl font-bold text-foreground">
                        {new Date(evento.data).getDate()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">{evento.titulo}</h3>
                        {getTipoBadge(evento.tipo)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{evento.horario}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{evento.local}</span>
                        </div>
                      </div>
                      {evento.descricao && (
                        <p className="text-xs text-muted-foreground">{evento.descricao}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(evento)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(evento.id)} className="text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {eventosFiltrados.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum evento encontrado</p>
                    <p className="text-xs mt-2">
                      {filtro || tipoFiltro !== 'todos' ? 'Tente ajustar os filtros' : 'Crie seu primeiro evento'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calendário Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Calendário visual em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </AppLayout>
  );
};

export default CalendarioPage;