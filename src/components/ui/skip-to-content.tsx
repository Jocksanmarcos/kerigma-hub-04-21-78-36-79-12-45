import React from 'react';
import { Button } from '@/components/ui/button';

interface SkipToContentProps {
  targetId: string;
  label?: string;
}

export const SkipToContent: React.FC<SkipToContentProps> = ({
  targetId,
  label = 'Pular para o conteúdo principal'
}) => {
  const handleSkip = () => {
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Button
      onClick={handleSkip}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-primary text-primary-foreground"
      onFocus={(e) => {
        e.currentTarget.classList.remove('sr-only');
      }}
      onBlur={(e) => {
        e.currentTarget.classList.add('sr-only');
      }}
    >
      {label}
    </Button>
  );
};