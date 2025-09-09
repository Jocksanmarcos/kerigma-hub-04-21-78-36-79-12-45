
import React from 'react';

interface TabContentWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Componente wrapper padronizado para o conteúdo das abas de configurações.
 * Garante largura total consistente em todas as abas com responsividade otimizada.
 */
export const TabContentWrapper: React.FC<TabContentWrapperProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <div className={`w-full space-y-6 ${className}`}>
      {children}
    </div>
  );
};
