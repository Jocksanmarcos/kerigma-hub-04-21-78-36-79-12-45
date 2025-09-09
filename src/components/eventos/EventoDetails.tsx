import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Edit, 
  Globe, 
  Lock,
  DollarSign,
  FileText,
  QrCode,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventoDetailsProps {
  evento: any;
  onEdit: () => void;
}

export const EventoDetails: React.FC<EventoDetailsProps> = ({ evento, onEdit }) => {
  const getStatusBadge = () => {
    const now = new Date();
    const dataInicio = new Date(evento.data_inicio);
    const dataFim = evento.data_fim ? new Date(evento.data_fim) : dataInicio;

    if (dataFim < now) {
      return <Badge variant="secondary">Finalizado</Badge>;
    } else if (dataInicio <= now && now <= dataFim) {
      return <Badge className="bg-green-500 hover:bg-green-600">Em Andamento</Badge>;
    } else {
      return <Badge variant="default">Programado</Badge>;
    }
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  };

  const generateEventQRCode = () => {
    // Função para gerar QR code do evento (para compartilhamento)
    const eventUrl = `${window.location.origin}/eventos/${evento.id}`;
    return eventUrl;
  };

  return (
    <div className="space-y-6">
      {/* Header com imagem */}
      {evento.cover_image_url && (
        <div className="relative rounded-kerigma overflow-hidden">
          <img 
            src={evento.cover_image_url} 
            alt={evento.titulo}
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{evento.titulo}</h1>
                <div className="flex items-center gap-4 text-white/90">
                  {getStatusBadge()}
                  <Badge variant="outline" className="border-white/30 text-white">
                    {evento.tipo}
                  </Badge>
                  {evento.is_paid_event && (
                    <Badge variant="secondary">Evento Pago</Badge>
                  )}
                </div>
              </div>
              <Button onClick={onEdit} variant="secondary" size="lg">
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Informações básicas */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Data e Horário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Início</p>
              <p className="font-semibold">{formatDateTime(evento.data_inicio)}</p>
            </div>
            {evento.data_fim && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fim</p>
                <p className="font-semibold">{formatDateTime(evento.data_fim)}</p>
              </div>
            )}
            {evento.registration_deadline && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prazo para Inscrições</p>
                <p className="font-semibold">
                  {format(new Date(evento.registration_deadline), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Localização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Local</p>
              <p className="font-semibold">{evento.local}</p>
            </div>
            {evento.endereco && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Endereço</p>
                <p className="text-sm">{evento.endereco}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Configurações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Configurações do Evento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 p-3 rounded-kerigma bg-muted/30">
              {evento.publico ? (
                <Globe className="h-5 w-5 text-green-500" />
              ) : (
                <Lock className="h-5 w-5 text-orange-500" />
              )}
              <div>
                <p className="font-medium">Visibilidade</p>
                <p className="text-sm text-muted-foreground">
                  {evento.publico ? 'Público' : 'Privado'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-kerigma bg-muted/30">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Inscrições</p>
                <p className="text-sm text-muted-foreground">
                  {evento.inscricoes_abertas ? 'Abertas' : 'Fechadas'}
                </p>
              </div>
            </div>

            {evento.capacidade > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-kerigma bg-muted/30">
                <Users className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">Capacidade</p>
                  <p className="text-sm text-muted-foreground">
                    {evento.capacidade} pessoas
                  </p>
                </div>
              </div>
            )}

            {evento.is_paid_event && (
              <div className="flex items-center gap-3 p-3 rounded-kerigma bg-muted/30">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Tipo</p>
                  <p className="text-sm text-muted-foreground">Evento Pago</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Descrição */}
      {evento.descricao && (
        <Card>
          <CardHeader>
            <CardTitle>Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {evento.descricao}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Formulário de inscrição */}
      {evento.form_structure_json && evento.form_structure_json.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Formulário de Inscrição</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {evento.form_structure_json.map((field: any, index: number) => (
                <div key={index} className="border rounded-kerigma p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{field.label}</p>
                      <p className="text-sm text-muted-foreground">
                        Tipo: {field.type} {field.required && '(Obrigatório)'}
                      </p>
                    </div>
                    <Badge variant="outline">{field.type}</Badge>
                  </div>
                  {field.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {field.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Editar Evento
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                const url = generateEventQRCode();
                navigator.clipboard.writeText(url);
              }}
            >
              <QrCode className="mr-2 h-4 w-4" />
              Copiar Link
            </Button>
            
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Baixar Lista
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};