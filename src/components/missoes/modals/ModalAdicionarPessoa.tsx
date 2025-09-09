import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Users, 
  Sparkles,
  Building2,
  Heart,
  X,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  nomeCompleto: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  status: string;
  dataBatismo: string;
  dataMembresia: string;
  tipoPessoa: string;
  celulaId: string;
  endereco: string;
  cidade: string;
  estado: string;
  observacoes: string;
  donsTalentos: string;
}

interface ModalAdicionarPessoaProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ModalAdicionarPessoa: React.FC<ModalAdicionarPessoaProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [celulas, setCelulas] = useState<any[]>([]);
  const [talentoInput, setTalentoInput] = useState('');
  const [talentos, setTalentos] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    nomeCompleto: '',
    email: '',
    telefone: '',
    dataNascimento: '',
    status: 'ativo',
    dataBatismo: '',
    dataMembresia: '',
    tipoPessoa: 'membro',
    celulaId: '',
    endereco: '',
    cidade: '',
    estado: '',
    observacoes: '',
    donsTalentos: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadCelulas();
    }
  }, [isOpen]);

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

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const applyPhoneMask = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
      .substring(0, 15);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = applyPhoneMask(e.target.value);
    handleInputChange('telefone', maskedValue);
  };

  const addTalento = () => {
    if (talentoInput.trim()) {
      setTalentos(prev => [...prev, talentoInput.trim()]);
      setTalentoInput('');
    }
  };

  const removeTalento = (index: number) => {
    setTalentos(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTalento();
    }
  };

  const resetForm = () => {
    setFormData({
      nomeCompleto: '',
      email: '',
      telefone: '',
      dataNascimento: '',
      status: 'ativo',
      dataBatismo: '',
      dataMembresia: '',
      tipoPessoa: 'membro',
      celulaId: '',
      endereco: '',
      cidade: '',
      estado: '',
      observacoes: '',
      donsTalentos: '',
    });
    setTalentos([]);
    setTalentoInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nomeCompleto || !formData.email) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Nome completo e email são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      // Verificar se o email já existe
      const { data: existingPerson } = await supabase
        .from('pessoas')
        .select('id')
        .eq('email', formData.email)
        .single();

      if (existingPerson) {
        toast({
          title: 'Email já cadastrado',
          description: 'Já existe uma pessoa cadastrada com este email.',
          variant: 'destructive',
        });
        return;
      }

      // Preparar dados para inserção
      const dadosNovaPessoa = {
        nome_completo: formData.nomeCompleto,
        email: formData.email,
        telefone: formData.telefone || null,
        data_nascimento: formData.dataNascimento || null,
        situacao: formData.status,
        data_batismo: formData.dataBatismo || null,
        data_membresia: formData.dataMembresia || null,
        tipo_pessoa: formData.tipoPessoa,
        celula_id: formData.celulaId && formData.celulaId !== 'none' ? formData.celulaId : null,
        endereco: formData.endereco || null,
        cidade: formData.cidade || null,
        estado: formData.estado || null,
        observacoes: formData.observacoes || null,
        dons_talentos: talentos.length > 0 ? talentos : null,
      };

      // Inserir nova pessoa
      const { data, error } = await supabase
        .from('pessoas')
        .insert([dadosNovaPessoa])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Pessoa adicionada com sucesso!',
        description: `${formData.nomeCompleto} foi cadastrado(a) no sistema.`,
      });

      onSuccess();
      onClose();
      resetForm();

    } catch (error: any) {
      console.error('Erro ao adicionar pessoa:', error);
      toast({
        title: 'Erro ao adicionar pessoa',
        description: error.message || 'Não foi possível cadastrar a pessoa.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-6 w-6 text-primary" />
            Adicionar Nova Pessoa
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Pessoais */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2">
              <User className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Informações Pessoais</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nomeCompleto" className="flex items-center gap-1">
                  Nome Completo
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nomeCompleto"
                  value={formData.nomeCompleto}
                  onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
                  placeholder="Digite o nome completo"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1">
                  Email
                  <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="email@exemplo.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={handlePhoneChange}
                    placeholder="(99) 99999-9999"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="dataNascimento"
                    type="date"
                    value={formData.dataNascimento}
                    onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="afastado">Afastado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoPessoa">Tipo de Pessoa</Label>
                <Select value={formData.tipoPessoa} onValueChange={(value) => handleInputChange('tipoPessoa', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    <SelectItem value="membro">Membro</SelectItem>
                    <SelectItem value="visitante">Visitante</SelectItem>
                    <SelectItem value="lider">Líder</SelectItem>
                    <SelectItem value="pastor">Pastor</SelectItem>
                    <SelectItem value="evangelista">Evangelista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Jornada na Igreja */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2">
              <Heart className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Jornada na Igreja</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataBatismo">Data de Batismo</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="dataBatismo"
                    type="date"
                    value={formData.dataBatismo}
                    onChange={(e) => handleInputChange('dataBatismo', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataMembresia">Data de Membresia</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="dataMembresia"
                    type="date"
                    value={formData.dataMembresia}
                    onChange={(e) => handleInputChange('dataMembresia', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Engajamento Ministerial */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Engajamento Ministerial</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="celulaId">Célula</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Select value={formData.celulaId} onValueChange={(value) => handleInputChange('celulaId', value)}>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Selecione a célula" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    <SelectItem value="none">Nenhuma célula</SelectItem>
                    {celulas.map((celula) => (
                      <SelectItem key={celula.id} value={celula.id}>
                        {celula.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="donsTalentos" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Dons e Talentos
              </Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={talentoInput}
                    onChange={(e) => setTalentoInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Digite um talento e pressione Enter"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTalento}
                    className="px-4"
                  >
                    Adicionar
                  </Button>
                </div>
                
                {talentos.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {talentos.map((talento, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1 px-3 py-1"
                      >
                        {talento}
                        <button
                          type="button"
                          onClick={() => removeTalento(index)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Informações Adicionais */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Informações Adicionais</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Textarea
                id="endereco"
                value={formData.endereco}
                onChange={(e) => handleInputChange('endereco', e.target.value)}
                placeholder="Digite o endereço completo"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) => handleInputChange('cidade', e.target.value)}
                  placeholder="Digite a cidade"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  value={formData.estado}
                  onChange={(e) => handleInputChange('estado', e.target.value)}
                  placeholder="Digite o estado"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                placeholder="Observações adicionais sobre a pessoa"
                rows={3}
              />
            </div>
          </div>
        </form>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            onClick={handleSubmit}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <User className="h-4 w-4" />
            )}
            {isLoading ? 'Salvando...' : 'Adicionar Pessoa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};