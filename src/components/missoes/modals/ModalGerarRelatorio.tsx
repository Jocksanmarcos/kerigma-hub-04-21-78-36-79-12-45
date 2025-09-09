import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { useChurches } from '@/hooks/useChurches';
import { FileText, Download, Calendar } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { toast } from 'sonner';

interface ModalGerarRelatorioProps {
  isOpen: boolean;
  onClose: () => void;
  relatorioTipo?: string;
  relatorioTitulo?: string;
}

export const ModalGerarRelatorio: React.FC<ModalGerarRelatorioProps> = ({
  isOpen,
  onClose,
  relatorioTipo = '',
  relatorioTitulo = 'Relatório'
}) => {
  const [formData, setFormData] = useState({
    tipo: relatorioTipo,
    periodo: undefined as DateRange | undefined,
    igreja_id: 'todas',
    formato: 'pdf'
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const { data: churches = [] } = useChurches();

  const handleGenerate = async () => {
    if (!formData.periodo?.from || !formData.periodo?.to) {
      toast.error('Por favor, selecione um período válido');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simular geração de relatório
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`${relatorioTitulo} gerado com sucesso!`);
      
      // Simular download do arquivo
      const link = document.createElement('a');
      link.href = '#';
      link.download = `${relatorioTitulo.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      
      onClose();
    } catch (error) {
      toast.error('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Gerar {relatorioTitulo}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Período do Relatório *</Label>
            <DatePickerWithRange
              selected={formData.periodo}
              onSelect={(range) => setFormData(prev => ({ ...prev, periodo: range }))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Igreja/Missão</Label>
            <Select 
              value={formData.igreja_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, igreja_id: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Igrejas/Missões</SelectItem>
                {churches.map((church) => (
                  <SelectItem key={church.id} value={church.id}>
                    {church.name} - {church.type === 'sede' ? 'Sede' : 'Missão'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Formato do Arquivo</Label>
            <Select 
              value={formData.formato} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, formato: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Resumo do Relatório
            </h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Tipo:</strong> {relatorioTitulo}</p>
              <p><strong>Período:</strong> {
                formData.periodo?.from && formData.periodo?.to 
                  ? `${formData.periodo.from.toLocaleDateString()} - ${formData.periodo.to.toLocaleDateString()}`
                  : 'Não selecionado'
              }</p>
              <p><strong>Escopo:</strong> {
                formData.igreja_id === 'todas' 
                  ? 'Todas as unidades' 
                  : churches.find(c => c.id === formData.igreja_id)?.name || 'Igreja selecionada'
              }</p>
              <p><strong>Formato:</strong> {formData.formato.toUpperCase()}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isGenerating}>
              Cancelar
            </Button>
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !formData.periodo?.from || !formData.periodo?.to}
              className="gap-2"
            >
              {isGenerating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isGenerating ? 'Gerando...' : 'Gerar Relatório'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};