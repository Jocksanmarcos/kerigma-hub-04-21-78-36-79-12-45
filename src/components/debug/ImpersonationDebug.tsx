import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, X, AlertTriangle } from 'lucide-react';
import { useImpersonation } from '@/hooks/useImpersonation';
import { supabase } from '@/integrations/supabase/client';

export const ImpersonationDebug: React.FC = () => {
  const { 
    checkIsImpersonating, 
    getImpersonationData, 
    clearImpersonationData,
    stopImpersonation 
  } = useImpersonation();

  const isImpersonating = checkIsImpersonating();
  const impersonationData = getImpersonationData();

  const getCurrentUser = () => {
    return supabase.auth.getUser().then(({ data }) => data.user);
  };

  const handleClearImpersonation = () => {
    clearImpersonationData();
    window.location.reload();
  };

  const handleStopImpersonation = () => {
    stopImpersonation();
  };

  if (!isImpersonating && !impersonationData) {
    return null;
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <Shield className="h-5 w-5" />
          Debug: Estado de Impersonação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isImpersonating && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Impersonação Ativa Detectada!</strong>
              <br />
              Usuário original: {impersonationData?.original_user_id}
              <br />
              Usuário alvo: {impersonationData?.target_user_name} ({impersonationData?.target_user_id})
              <br />
              Iniciada em: {impersonationData?.started_at ? new Date(impersonationData.started_at).toLocaleString() : 'N/A'}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleStopImpersonation}
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            Encerrar Impersonação Corretamente
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearImpersonation}
            className="flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Limpar Dados (Força)
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p><strong>Dados brutos no localStorage:</strong></p>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
            {JSON.stringify(impersonationData, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};