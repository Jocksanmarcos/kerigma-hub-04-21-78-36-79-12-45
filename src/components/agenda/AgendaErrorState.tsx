import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AgendaErrorStateProps {
  onRetry: () => void;
  error?: string;
}

export const AgendaErrorState: React.FC<AgendaErrorStateProps> = ({ onRetry, error }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header com título */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="text-xl font-semibold text-foreground">
          Central de Agenda
        </h1>
      </div>

      {/* Estado de erro */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Erro ao carregar agenda</h3>
              <p className="text-muted-foreground">
                Não foi possível carregar os dados da agenda. Verifique sua conexão e tente novamente.
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="text-left">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button onClick={onRetry} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};