import React from 'react';
import { useParams } from 'react-router-dom';
import { EventoPublicPage } from '@/components/eventos/EventoPublicPage';

const PublicEventoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Evento não encontrado</h1>
          <p className="text-muted-foreground">ID do evento não foi fornecido.</p>
        </div>
      </div>
    );
  }

  return <EventoPublicPage eventoId={id} />;
};

export default PublicEventoPage;