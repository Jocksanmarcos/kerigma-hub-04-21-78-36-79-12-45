import React, { useState } from 'react';
import { ChatbotSupport } from './ChatbotSupport';
import { Button } from '@/components/ui/button';
import { Bot, X } from 'lucide-react';

export const ChatbotButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Botão flutuante */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="relative rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90 [&_svg]:!size-8"
            size="lg"
            aria-label="Abrir assistente virtual"
          >
            <Bot />
          </Button>
        </div>
      )}

      {/* Chatbot modal */}
      {isOpen && (
        <ChatbotSupport 
          isMinimized={false}
          onToggleMinimize={() => setIsOpen(false)}
        />
      )}
    </>
  );
};