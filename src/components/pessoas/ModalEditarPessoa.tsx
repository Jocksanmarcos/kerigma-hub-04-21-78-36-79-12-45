import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, X } from 'lucide-react';

interface Pessoa {
  id: string;
  nome_completo: string;
  email?: string;
  telefone?: string;
  tipo_pessoa: string;
  situacao: string;
  data_nascimento?: string;
  data_membresia?: string;
  celula_id?: string;
  celulas?: { nome: string };
  foto_url?: string;
  dons_talentos?: string[];
  endereco?: string;
  observacoes?: string;
}

interface ModalEditarPessoaProps {
  pessoa: Pessoa | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ModalEditarPessoa: React.FC<ModalEditarPessoaProps> = ({
  pessoa,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [celulas, setCelulas] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    telefone: '',
    tipo_pessoa: 'membro',
    situacao: 'ativo',
    data_nascimento: '',
    data_membresia: '',
    celula_id: '',
    endereco: '',
    observacoes: '',
    dons_talentos: [] as string[]
  });

  useEffect(() => {
    if (pessoa) {
      setFormData({
        nome_completo: pessoa.nome_completo || '',
        email: pessoa.email || '',
        telefone: pessoa.telefone || '',
        tipo_pessoa: pessoa.tipo_pessoa || 'membro',
        situacao: pessoa.situacao || 'ativo',
        data_nascimento: pessoa.data_nascimento || '',
        data_membresia: pessoa.data_membresia || '',
        celula_id: pessoa.celula_id || 'none',
        endereco: (pessoa as any).endereco || '',
        observacoes: (pessoa as any).observacoes || '',
        dons_talentos: pessoa.dons_talentos || []
      });
    }
  }, [pessoa]);

  useEffect(() => {
    const loadCelulas = async () => {
      try {
        const { data } = await supabase
          .from('celulas')
          .select('id, nome')
          .eq('ativa', true)
          .order('nome');
        
        setCelulas(data || []);
      } catch (error) {
        console.error('Erro ao carregar células:', error);
      }
    };

    if (isOpen) {
      loadCelulas();
    }
  }, [isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pessoa?.id) return;
    
    try {
      setLoading(true);

      const updateData = {
        nome_completo: formData.nome_completo,
        email: formData.email || null,
        telefone: formData.telefone || null,
        tipo_pessoa: formData.tipo_pessoa,
        situacao: formData.situacao,
        data_nascimento: formData.data_nascimento || null,
        data_membresia: formData.data_membresia || null,
        celula_id: formData.celula_id === 'none' ? null : formData.celula_id || null,
        endereco: formData.endereco || null,
        observacoes: formData.observacoes || null,
        dons_talentos: formData.dons_talentos.length > 0 ? formData.dons_talentos : null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('pessoas')
        .update(updateData)
        .eq('id', pessoa.id);

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Pessoa atualizada com sucesso',
      });

      onSuccess();
      onClose();
      
    } catch (error: any) {
      console.error('Erro ao atualizar pessoa:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar pessoa',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!pessoa) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Pessoa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome Completo */}
          <div className="space-y-2">
            <Label htmlFor="nome_completo">Nome Completo *</Label>
            <Input
              id="nome_completo"
              value={formData.nome_completo}
              onChange={(e) => handleInputChange('nome_completo', e.target.value)}
              required
            />
          </div>

          {/* Email e Telefone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
              />
            </div>
          </div>

          {/* Tipo de Pessoa e Situação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo_pessoa">Tipo de Pessoa</Label>
              <Select 
                value={formData.tipo_pessoa} 
                onValueChange={(value) => handleInputChange('tipo_pessoa', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="membro">Membro</SelectItem>
                  <SelectItem value="visitante">Visitante</SelectItem>
                  <SelectItem value="lider">Líder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="situacao">Situação</Label>
              <Select 
                value={formData.situacao} 
                onValueChange={(value) => handleInputChange('situacao', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="afastado">Afastado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_nascimento">Data de Nascimento</Label>
              <Input
                id="data_nascimento"
                type="date"
                value={formData.data_nascimento}
                onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="data_membresia">Data de Membresia</Label>
              <Input
                id="data_membresia"
                type="date"
                value={formData.data_membresia}
                onChange={(e) => handleInputChange('data_membresia', e.target.value)}
              />
            </div>
          </div>

          {/* Célula */}
          <div className="space-y-2">
            <Label htmlFor="celula_id">Célula</Label>
            <Select 
              value={formData.celula_id} 
              onValueChange={(value) => handleInputChange('celula_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma célula" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma célula</SelectItem>
                {celulas.map((celula) => (
                  <SelectItem key={celula.id} value={celula.id}>
                    {celula.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Endereço */}
          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => handleInputChange('endereco', e.target.value)}
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};