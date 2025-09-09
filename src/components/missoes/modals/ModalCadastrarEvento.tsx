import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useCreateEvento } from '@/hooks/useMissoesEventos';
import { useChurches } from '@/hooks/useChurches';
import { Calendar, MapPin, Clock, Globe, Building2 } from 'lucide-react';

interface ModalCadastrarEventoProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalCadastrarEvento: React.FC<ModalCadastrarEventoProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    data_evento: '',
    data_fim: '',
    descricao: '',
    local: '',
    church_id: '',
    tipo: 'conferencia',
    publico: true,
  });

  const { data: churches = [] } = useChurches();
  const createEvento = useCreateEvento();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.data_evento || !formData.church_id) {
      return;
    }

    try {
      await createEvento.mutateAsync(formData);
      onClose();
      setFormData({
        nome: '',
        data_evento: '',
        data_fim: '',
        descricao: '',
        local: '',
        church_id: '',
        tipo: 'conferencia',
        publico: true,
      });
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Cadastrar Novo Evento
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Evento *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Digite o nome do evento"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo do Evento *</Label>
              <Select value={formData.tipo} onValueChange={(value) => handleInputChange('tipo', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conferencia">Conferência</SelectItem>
                  <SelectItem value="culto_especial">Culto Especial</SelectItem>
                  <SelectItem value="evangelismo">Evangelismo</SelectItem>
                  <SelectItem value="treinamento">Treinamento</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="church_id">Igreja/Missão *</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Select value={formData.church_id} onValueChange={(value) => handleInputChange('church_id', value)}>
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Selecione a igreja ou missão" />
                </SelectTrigger>
                <SelectContent>
                  {churches.map((church) => (
                    <SelectItem key={church.id} value={church.id}>
                      {church.name} - {church.type === 'sede' ? 'Sede' : 'Missão'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_evento">Data de Início *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="data_evento"
                  type="datetime-local"
                  value={formData.data_evento}
                  onChange={(e) => handleInputChange('data_evento', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_fim">Data de Fim</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="data_fim"
                  type="datetime-local"
                  value={formData.data_fim}
                  onChange={(e) => handleInputChange('data_fim', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="local">Local do Evento</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="local"
                value={formData.local}
                onChange={(e) => handleInputChange('local', e.target.value)}
                placeholder="Digite o endereço ou local do evento"
                className="pl-10"
                rows={2}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              placeholder="Descreva o evento..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="publico"
              checked={formData.publico}
              onCheckedChange={(checked) => handleInputChange('publico', checked)}
            />
            <Label htmlFor="publico" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Evento Público (visível para todos)
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createEvento.isPending}
              className="gap-2"
            >
              {createEvento.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <Calendar className="h-4 w-4" />
              )}
              Cadastrar Evento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};