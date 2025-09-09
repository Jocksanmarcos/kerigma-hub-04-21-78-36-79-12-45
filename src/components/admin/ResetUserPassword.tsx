import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePasswordReset } from '@/hooks/usePasswordReset';
import { KeyRound, User } from 'lucide-react';

export function ResetUserPassword() {
  const { resetJocksanPassword, isLoading } = usePasswordReset();

  const handleResetPassword = async () => {
    await resetJocksanPassword();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <KeyRound className="h-5 w-5" />
          Reset de Senha
        </CardTitle>
        <CardDescription>
          Redefinir senha para usuário específico
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <User className="h-4 w-4" />
          <span className="text-sm font-medium">jocksan.marcos@gmail.com</span>
        </div>
        
        <Button 
          onClick={handleResetPassword}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? 'Redefinindo...' : 'Redefinir Senha para Luckas@2025'}
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
          Isso vai definir a senha como "Luckas@2025" para o usuário especificado.
        </p>
      </CardContent>
    </Card>
  );
}