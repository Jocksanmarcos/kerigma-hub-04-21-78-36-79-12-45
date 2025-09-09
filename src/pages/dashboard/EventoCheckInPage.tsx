import React from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { CheckInApp } from '@/components/eventos/CheckInApp';

const EventoCheckInPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <CheckInApp eventoId={id} />
      </div>
    </AppLayout>
  );
};

export default EventoCheckInPage;