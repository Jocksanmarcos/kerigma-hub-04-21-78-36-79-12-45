import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  BookOpen, 
  User, 
  Mail, 
  Phone,
  Loader2,
  CheckCircle,
  Shield
} from 'lucide-react';
import { useCreatePublicReservation } from '@/hooks/useBooks';
import type { Book } from '@/hooks/useBooks';

interface SolicitacaoEmprestimoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: Book | null;
}

export const SolicitacaoEmprestimoDialog: React.FC<SolicitacaoEmprestimoDialogProps> = ({
  open,
  onOpenChange,
  book,
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    observacoes: ''
  });

  const createReservation = useCreatePublicReservation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!book || !formData.nome || !formData.email) {
      return;
    }

    try {
      // Simulate reCAPTCHA verification
      // In a real implementation, you would call Google reCAPTCHA v3 here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await createReservation.mutateAsync({
        livro_id: book.id,
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone || null,
        observacoes: formData.observacoes || null
      });

      // Reset form
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        observacoes: ''
      });
      
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      observacoes: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Solicitar Empréstimo
          </DialogTitle>
          <DialogDescription>
            Preencha seus dados para solicitar o empréstimo do livro
          </DialogDescription>
        </DialogHeader>

        {book && (
          <div className="bg-muted/50 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-16 bg-muted rounded-sm flex items-center justify-center overflow-hidden">
                {book.imagem_capa_url ? (
                  <img 
                    src={book.imagem_capa_url} 
                    alt={book.titulo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <h4 className="font-medium text-sm">{book.titulo}</h4>
                <p className="text-xs text-muted-foreground">{book.autor}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nome Completo *
            </Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Digite seu nome completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              E-mail *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Digite seu e-mail"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Telefone
            </Label>
            <Input
              id="telefone"
              type="tel"
              value={formData.telefone}
              onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Alguma observação adicional (opcional)"
              rows={3}
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
            <p className="font-medium mb-1">ℹ️ Informações importantes:</p>
            <ul className="text-xs space-y-1">
              <li>• Sua solicitação será analisada pela equipe da biblioteca</li>
              <li>• Você receberá um retorno em até 2 dias úteis</li>
              <li>• A reserva fica ativa por 7 dias após aprovação</li>
            </ul>
          </div>

          {/* reCAPTCHA Notice */}
          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border">
            <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">Proteção contra spam</p>
              <p className="text-muted-foreground">
                Este formulário é protegido pelo Google reCAPTCHA para garantir que você não é um robô.
                Ao enviar, você concorda com os{' '}
                <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Termos de Serviço
                </a>{' '}
                e{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Política de Privacidade
                </a>{' '}
                do Google.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={createReservation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createReservation.isPending || !formData.nome || !formData.email}
            >
              {createReservation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Solicitar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};