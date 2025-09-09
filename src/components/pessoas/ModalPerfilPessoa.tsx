import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Users,
  Heart,
  MessageCircle,
  X
} from 'lucide-react';

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
}

interface ModalPerfilPessoaProps {
  pessoa: Pessoa | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: string, pessoa: Pessoa) => void;
}

export const ModalPerfilPessoa: React.FC<ModalPerfilPessoaProps> = ({
  pessoa,
  isOpen,
  onClose,
  onAction
}) => {
  if (!pessoa) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusColor = (situacao: string) => {
    switch (situacao) {
      case 'ativo': return 'bg-green-100 text-green-800 border-green-200';
      case 'inativo': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'visitante': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <User className="h-5 w-5" />
            Perfil da Pessoa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header com foto e informações básicas */}
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <Avatar className="h-24 w-24 border-4 border-muted">
              <AvatarImage src={pessoa.foto_url} alt={pessoa.nome_completo} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {getInitials(pessoa.nome_completo)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {pessoa.nome_completo}
              </h2>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge 
                  variant="outline" 
                  className={`${getStatusColor(pessoa.situacao)}`}
                >
                  {pessoa.situacao}
                </Badge>
                <Badge variant="secondary">
                  {pessoa.tipo_pessoa}
                </Badge>
              </div>

              {/* Ações rápidas */}
              <div className="flex flex-wrap gap-2">
                {pessoa.telefone && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAction('whatsapp', pessoa)}
                      className="gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAction('call', pessoa)}
                      className="gap-2"
                    >
                      <Phone className="h-4 w-4" />
                      Ligar
                    </Button>
                  </>
                )}
                {pessoa.email && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAction('email', pessoa)}
                    className="gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Informações de contato */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Informações de Contato
            </h3>
            
            <div className="grid gap-3">
              {pessoa.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{pessoa.email}</span>
                </div>
              )}
              
              {pessoa.telefone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{pessoa.telefone}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Informações pessoais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </h3>
            
            <div className="grid gap-3">
              {pessoa.data_nascimento && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {formatDate(pessoa.data_nascimento)} ({calculateAge(pessoa.data_nascimento)} anos)
                  </span>
                </div>
              )}
              
              {pessoa.data_membresia && (
                <div className="flex items-center gap-3">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">
                    Membro desde {formatDate(pessoa.data_membresia)}
                  </span>
                </div>
              )}

              {pessoa.celulas?.nome && (
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">
                    Célula: {pessoa.celulas.nome}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Dons e Talentos */}
          {pessoa.dons_talentos && pessoa.dons_talentos.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Dons e Talentos
                </h3>
                
                <div className="flex flex-wrap gap-2">
                  {pessoa.dons_talentos.map((dom, index) => (
                    <Badge key={index} variant="outline">
                      {dom}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Footer com ações */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onAction('edit', pessoa)}
            >
              Editar Informações
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
            >
              <X className="h-4 w-4 mr-2" />
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};