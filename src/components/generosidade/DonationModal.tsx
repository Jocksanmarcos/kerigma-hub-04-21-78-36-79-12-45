import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, CreditCard, QrCode, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  fundId: string;
  fundName: string;
  onSuccess: (paymentInfo: any) => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  fundId,
  fundName,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    name: '',
    email: '',
    phone: '',
    message: '',
    paymentMethod: 'pix'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const amount = parseFloat(formData.amount);
      if (amount <= 0) {
        throw new Error('Valor deve ser maior que zero');
      }

      console.log('Criando preferência no Mercado Pago para integração financeira...');
      
      // Create Mercado Pago preference using enhanced function
      const { data, error } = await supabase.functions.invoke('mercado-pago-create-preference', {
        body: {
          donationAmount: amount,
          donorName: formData.name,
          donorEmail: formData.email,
          donorPhone: formData.phone,
          fundId: fundId,
          fundName: fundName,
          message: formData.message,
          isRecurring: false
        }
      });

      console.log('Resposta do Mercado Pago:', { data, error });

      if (error) {
        console.error('Erro na função:', error);
        throw new Error(error.message || 'Erro ao processar pagamento');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Erro desconhecido ao criar preferência');
      }

      // Redirect to Mercado Pago checkout
      if (data.checkoutUrl) {
        console.log('Redirecionando para checkout:', data.checkoutUrl);
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('URL de checkout não recebida');
      }

    } catch (error: any) {
      console.error('Donation error:', error);
      toast({
        title: "Erro ao processar doação",
        description: error.message || "Tente novamente em alguns minutos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: 'pix', label: 'PIX', icon: QrCode, description: 'Instantâneo' },
    { id: 'credit_card', label: 'Cartão de Crédito', icon: CreditCard, description: 'Parcelado' },
    { id: 'boleto', label: 'Boleto', icon: FileText, description: '1-3 dias úteis' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Semear em {fundName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Enhanced payment info */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Heart className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-primary mb-1">Integração Financeira Ativada</p>
                <p className="text-xs text-primary/80">
                  Sua doação será automaticamente registrada na Central Financeira após a aprovação do pagamento.
                </p>
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="amount">Valor da Doação</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="1"
                placeholder="0,00"
                className="pl-10"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                placeholder="Seu nome"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone (opcional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="message">Mensagem (opcional)</Label>
            <Textarea
              id="message"
              placeholder="Compartilhe sua motivação..."
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={3}
            />
          </div>

          <div>
            <Label>Forma de Pagamento</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {paymentMethods.map((method) => {
                const IconComponent = method.icon;
                return (
                  <button
                    key={method.id}
                    type="button"
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      formData.paymentMethod === method.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-muted hover:border-primary'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.id }))}
                  >
                    <IconComponent className="h-5 w-5 mx-auto mb-1" />
                    <p className="text-xs font-medium">{method.label}</p>
                    <p className="text-xs text-muted-foreground">{method.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Doar Agora
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};