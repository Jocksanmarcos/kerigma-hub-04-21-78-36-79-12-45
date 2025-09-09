import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { QuizQuestion, QuizFormData } from '@/hooks/useQuizzes';

interface QuizFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: QuizFormData) => Promise<boolean>;
  editingQuiz?: QuizQuestion | null;
  loading?: boolean;
}

export const QuizForm: React.FC<QuizFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingQuiz,
  loading = false,
}) => {
  const [formData, setFormData] = useState<QuizFormData>({
    reference_id: '',
    texto_pergunta: '',
    opcoes: [
      { id: 'A', texto: '' },
      { id: 'B', texto: '' },
    ],
    resposta_correta: '',
  });

  // Reset form quando abrir/fechar ou editar
  useEffect(() => {
    if (isOpen) {
      if (editingQuiz) {
        // Garantir que as opções são tratadas corretamente mesmo vindas do JSON do banco
        const opcoes = Array.isArray(editingQuiz.opcoes) 
          ? editingQuiz.opcoes 
          : (editingQuiz.opcoes ? [editingQuiz.opcoes] : []);
        
        setFormData({
          reference_id: editingQuiz.reference_id,
          texto_pergunta: editingQuiz.texto_pergunta,
          opcoes: opcoes.length > 0 ? opcoes : [
            { id: 'A', texto: '' },
            { id: 'B', texto: '' },
          ],
          resposta_correta: editingQuiz.resposta_correta,
        });
      } else {
        setFormData({
          reference_id: '',
          texto_pergunta: '',
          opcoes: [
            { id: 'A', texto: '' },
            { id: 'B', texto: '' },
          ],
          resposta_correta: '',
        });
      }
    }
  }, [isOpen, editingQuiz]);

  const handleAddOption = () => {
    const nextLetter = String.fromCharCode(65 + formData.opcoes.length); // A, B, C, D...
    setFormData(prev => ({
      ...prev,
      opcoes: [...prev.opcoes, { id: nextLetter, texto: '' }]
    }));
  };

  const handleRemoveOption = (index: number) => {
    if (formData.opcoes.length <= 2) return; // Mínimo 2 opções
    
    const removedId = formData.opcoes[index].id;
    setFormData(prev => ({
      ...prev,
      opcoes: prev.opcoes.filter((_, i) => i !== index),
      resposta_correta: prev.resposta_correta === removedId ? '' : prev.resposta_correta
    }));
  };

  const handleOptionChange = (index: number, texto: string) => {
    setFormData(prev => ({
      ...prev,
      opcoes: prev.opcoes.map((opcao, i) => 
        i === index ? { ...opcao, texto } : opcao
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.reference_id.trim()) {
      alert('Por favor, preencha a referência.');
      return;
    }
    
    if (!formData.texto_pergunta.trim()) {
      alert('Por favor, preencha o texto da pergunta.');
      return;
    }

    const opcoesPreenchidas = formData.opcoes.filter(opcao => opcao.texto.trim() !== '');
    if (opcoesPreenchidas.length < 2) {
      alert('Por favor, preencha pelo menos duas opções.');
      return;
    }

    if (!formData.resposta_correta) {
      alert('Por favor, selecione a resposta correta.');
      return;
    }

    const success = await onSubmit({
      ...formData,
      opcoes: opcoesPreenchidas
    });

    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingQuiz ? 'Editar Pergunta' : 'Nova Pergunta'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Referência */}
          <div className="space-y-2">
            <Label htmlFor="reference_id">Referência (ID) *</Label>
            <Input
              id="reference_id"
              placeholder="Ex: GEN.1, MAT.5, CURSO-DNA-1"
              value={formData.reference_id}
              onChange={(e) => setFormData(prev => ({ ...prev, reference_id: e.target.value }))}
              required
            />
          </div>

          {/* Texto da Pergunta */}
          <div className="space-y-2">
            <Label htmlFor="texto_pergunta">Texto da Pergunta *</Label>
            <Textarea
              id="texto_pergunta"
              placeholder="Digite a pergunta aqui..."
              value={formData.texto_pergunta}
              onChange={(e) => setFormData(prev => ({ ...prev, texto_pergunta: e.target.value }))}
              rows={3}
              required
            />
          </div>

          {/* Opções */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Opções de Resposta *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                disabled={formData.opcoes.length >= 6} // Máximo 6 opções
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Opção
              </Button>
            </div>

            {formData.opcoes.map((opcao, index) => (
              <div key={opcao.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {opcao.id}
                </div>
                <Input
                  placeholder={`Opção ${opcao.id}`}
                  value={opcao.texto}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-1"
                />
                {formData.opcoes.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveOption(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Resposta Correta */}
          <div className="space-y-2">
            <Label>Resposta Correta *</Label>
            <Select 
              value={formData.resposta_correta} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, resposta_correta: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a resposta correta" />
              </SelectTrigger>
              <SelectContent>
                {formData.opcoes
                  .filter(opcao => opcao.texto.trim() !== '')
                  .map((opcao) => (
                    <SelectItem key={opcao.id} value={opcao.id}>
                      Opção {opcao.id}: {opcao.texto.substring(0, 50)}...
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {editingQuiz ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};