import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Bug, AlertCircle } from 'lucide-react';
import { FeedbackSystem } from './FeedbackSystem';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useLocation } from 'react-router-dom';

interface FeedbackButtonProps {
  variant?: 'default' | 'floating' | 'inline';
  className?: string;
}

export const FeedbackButton: React.FC<FeedbackButtonProps> = ({
  variant = 'default',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const currentModule = location.pathname.split('/')[1] || 'homepage';
  const currentContext = `Página: ${location.pathname}`;

  if (variant === 'floating') {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="secondary"
              size="lg"
              className={`rounded-full shadow-lg hover:shadow-xl transition-all h-12 w-12 ${className}`}
              aria-label="Reportar problema ou dar feedback"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <FeedbackSystem
              module={currentModule}
              context={currentContext}
              onFeedbackSubmit={() => setIsOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 ${className}`}
          >
            <AlertCircle className="h-4 w-4" />
            Reportar Problema
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <FeedbackSystem
            module={currentModule}
            context={currentContext}
            onFeedbackSubmit={() => setIsOpen(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={`gap-2 ${className}`}
        >
          <MessageSquare className="h-4 w-4" />
          Dar Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <FeedbackSystem
          module={currentModule}
          context={currentContext}
          onFeedbackSubmit={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};