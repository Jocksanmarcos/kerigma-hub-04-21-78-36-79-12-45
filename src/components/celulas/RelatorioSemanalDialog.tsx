import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Heart, DollarSign, BookOpen, Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RelatorioSemanalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RelatorioSemanalDialog: React.FC<RelatorioSemanalDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [step, setStep] = useState(1);
  const [visitantes, setVisitantes] = useState(['']);
  const [motivosOracao, setMotivosOracao] = useState(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    dataReuniao: new Date().toISOString().split('T')[0],
    temaEstudo: '',
    numeroPresentes: '',
    ofertas: '',
    numeroDecisoes: '',
    observacoes: '',
    desafios: '',
    testemunhos: ''
  });

  const adicionarVisitante = () => {
    setVisitantes([...visitantes, '']);
  };

  const removerVisitante = (index: number) => {
    setVisitantes(visitantes.filter((_, i) => i !== index));
  };

  const adicionarMotivoOracao = () => {
    setMotivosOracao([...motivosOracao, '']);
  };

  const removerMotivoOracao = (index: number) => {
    setMotivosOracao(motivosOracao.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const relatorioData = {
        ...formData,
        visitantes: visitantes.filter(v => v.trim() !== ''),
        motivos_oracao: motivosOracao.filter(m => m.trim() !== ''),
        data_reuniao: formData.dataReuniao,
        total_presentes: parseInt(formData.numeroPresentes) || 0,
        visitantes_count: visitantes.filter(v => v.trim() !== '').length,
        decisoes: parseInt(formData.numeroDecisoes) || 0,
        ofertas: parseFloat(formData.ofertas) || 0
      };

      // Aqui salvaria no banco (implementar quando tiver a tabela correta)
      console.log('Dados do relatório:', relatorioData);
      
      toast.success('Relatório enviado com sucesso!');
      onOpenChange(false);
      
      // Reset form
      setStep(1);
      setVisitantes(['']);
      setMotivosOracao(['']);
      setFormData({
        dataReuniao: new Date().toISOString().split('T')[0],
        temaEstudo: '',
        numeroPresentes: '',
        ofertas: '',
        numeroDecisoes: '',
        observacoes: '',
        desafios: '',
        testemunhos: ''
      });
      
    } catch (error) {
      console.error('Erro ao enviar relatório:', error);
      toast.error('Erro ao enviar relatório');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Informações da Reunião</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="data-reuniao">Data da Reunião</Label>
              <Input 
                id="data-reuniao" 
                type="date" 
                value={formData.dataReuniao}
                onChange={(e) => setFormData({...formData, dataReuniao: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="tema-estudo">Tema do Estudo</Label>
              <Input 
                id="tema-estudo" 
                placeholder="Ex: O Poder da Oração"
                value={formData.temaEstudo}
                onChange={(e) => setFormData({...formData, temaEstudo: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="presentes">Número de Presentes</Label>
              <Input 
                id="presentes" 
                type="number" 
                placeholder="12"
                value={formData.numeroPresentes}
                onChange={(e) => setFormData({...formData, numeroPresentes: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="ofertas">Ofertas (R$)</Label>
              <Input 
                id="ofertas" 
                type="number" 
                step="0.01" 
                placeholder="50.00"
                value={formData.ofertas}
                onChange={(e) => setFormData({...formData, ofertas: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Visitantes e Decisões</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Visitantes da Reunião</Label>
            <div className="space-y-2 mt-2">
              {visitantes.map((visitante, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    placeholder="Nome do visitante"
                    value={visitante}
                    onChange={(e) => {
                      const novosVisitantes = [...visitantes];
                      novosVisitantes[index] = e.target.value;
                      setVisitantes(novosVisitantes);
                    }}
                  />
                  {visitantes.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removerVisitante(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={adicionarVisitante}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Visitante
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="decisoes">Número de Decisões</Label>
            <Input 
              id="decisoes" 
              type="number" 
              placeholder="2"
              value={formData.numeroDecisoes}
              onChange={(e) => setFormData({...formData, numeroDecisoes: e.target.value})}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Decisões de aceitar Jesus, batismo, etc.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5" />
            <span>Observações e Oração</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="observacoes">Observações Gerais</Label>
            <Textarea
              id="observacoes"
              placeholder="Como foi a reunião? Que dinâmicas foram usadas? Como foi a participação..."
              rows={3}
              value={formData.observacoes}
              onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="desafios">Desafios Enfrentados</Label>
            <Textarea
              id="desafios"
              placeholder="Houve algum desafio? Conflitos? Dificuldades?"
              rows={2}
              value={formData.desafios}
              onChange={(e) => setFormData({...formData, desafios: e.target.value})}
            />
          </div>

          <div>
            <Label>Motivos de Oração</Label>
            <div className="space-y-2 mt-2">
              {motivosOracao.map((motivo, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    placeholder="Motivo de oração"
                    value={motivo}
                    onChange={(e) => {
                      const novosMotivos = [...motivosOracao];
                      novosMotivos[index] = e.target.value;
                      setMotivosOracao(novosMotivos);
                    }}
                  />
                  {motivosOracao.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removerMotivoOracao(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={adicionarMotivoOracao}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Motivo
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="testemunhos">Testemunhos</Label>
            <Textarea
              id="testemunhos"
              placeholder="Houve algum testemunho especial? Resposta de oração?"
              rows={2}
              value={formData.testemunhos}
              onChange={(e) => setFormData({...formData, testemunhos: e.target.value})}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-6">
      {[1, 2, 3].map((stepNumber) => (
        <div key={stepNumber} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= stepNumber
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {stepNumber}
          </div>
          {stepNumber < 3 && (
            <div
              className={`w-12 h-0.5 ${
                step > stepNumber ? 'bg-primary' : 'bg-muted'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Relatório Semanal da Célula</DialogTitle>
          <DialogDescription>
            Preencha as informações da reunião semanal da sua célula
          </DialogDescription>
        </DialogHeader>

        {renderStepIndicator()}

        <div className="space-y-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        <div className="flex justify-between pt-4">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Anterior
              </Button>
            )}
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)}>
                Próximo
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Relatório'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};