import React, { useEffect } from 'react';
import { LeitorBiblicoEnhanced } from '@/components/biblia/LeitorBiblicoEnhanced';

const JornadaBibliaEnhancedPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Leitor Bíblico Enhanced | Jornada de Crescimento';
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <LeitorBiblicoEnhanced />
    </div>
  );
};

export default JornadaBibliaEnhancedPage;