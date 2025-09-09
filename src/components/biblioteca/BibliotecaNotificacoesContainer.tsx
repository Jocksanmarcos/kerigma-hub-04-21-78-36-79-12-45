import React from 'react';
import { BibliotecaNotificacoesPanel } from './BibliotecaNotificacoesPanel';
import { useNotificationStats, useRecentNotifications } from '@/hooks/useNotifications';

export const BibliotecaNotificacoesContainer: React.FC = () => {
  const { data: estatisticas, isLoading: loadingStats } = useNotificationStats();
  const { data: historicoRecente, isLoading: loadingHistory } = useRecentNotifications();

  // Se ainda está carregando, mostra o estado de loading
  if (loadingStats || loadingHistory) {
    return <BibliotecaNotificacoesPanel />;
  }

  return (
    <BibliotecaNotificacoesPanel 
      estatisticas={estatisticas}
      historicoRecente={historicoRecente}
    />
  );
};