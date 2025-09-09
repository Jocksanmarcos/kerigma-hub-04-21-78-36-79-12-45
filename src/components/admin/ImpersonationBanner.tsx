import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, LogOut } from 'lucide-react';
import { useImpersonation } from '@/hooks/useImpersonation';

export const ImpersonationBanner: React.FC = () => {
  const { stopImpersonation, getImpersonationData, checkIsImpersonating } = useImpersonation();
  
  if (!checkIsImpersonating()) {
    return null;
  }

  const impersonationData = getImpersonationData();

  return (
    <Alert className="bg-yellow-50 border-yellow-200 mb-4">
      <Shield className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-yellow-800">
          Você está assumindo a sessão de <strong>{impersonationData?.target_user_name}</strong>
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={stopImpersonation}
          className="ml-4"
        >
          <LogOut className="h-4 w-4 mr-1" />
          Encerrar Impersonação
        </Button>
      </AlertDescription>
    </Alert>
  );
};