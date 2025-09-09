import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mail, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface RecaptchaFormProps {
  onSubmit?: (data: FormData) => void;
}

export const RecaptchaForm: React.FC<RecaptchaFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate reCAPTCHA verification
      // In a real implementation, you would call Google reCAPTCHA v3 here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate form submission
      if (onSubmit) {
        onSubmit(formData);
      }
      
      toast({ 
        title: "Mensagem enviada!", 
        description: "Obrigado por entrar em contato. Em breve responderemos." 
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex items-center gap-2 mb-6">
          <Mail className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Envie uma mensagem</h2>
        </div>
        
        <form id="contact-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Nome *
              </label>
              <Input 
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Seu nome completo" 
                required 
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                E-mail *
              </label>
              <Input 
                id="email"
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com" 
                required 
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2">
              Telefone
            </label>
            <Input 
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(11) 99999-9999"
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label htmlFor="subject" className="block text-sm font-medium mb-2">
              Assunto *
            </label>
            <Input 
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Assunto da sua mensagem" 
              required 
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Mensagem *
            </label>
            <Textarea 
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Digite sua mensagem aqui..." 
              rows={6} 
              required 
              disabled={isSubmitting}
            />
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
          
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isSubmitting}
          >
            <Mail className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};