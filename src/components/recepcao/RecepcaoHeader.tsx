import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export const RecepcaoHeader: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <header className="fixed top-4 left-4 z-50">
      <div className="bg-background/95 backdrop-blur-sm border border-border/40 rounded-full shadow-lg p-2">
        <div className="flex items-center gap-2">
          <Link to="/dashboard">
            <Button 
              variant="ghost" 
              size="sm"
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2",
                "hover:bg-primary/10 transition-colors"
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Voltar ao Dashboard</span>
              <Home className="h-4 w-4 sm:hidden" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};