import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Crown } from 'lucide-react';
import { useSuperAdminBootstrap } from '@/hooks/useSuperAdminBootstrap';

export const SuperAdminBootstrap: React.FC = () => {
  const { bootstrapSuperAdmin, isLoading } = useSuperAdminBootstrap();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Crown className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Super Administrador</CardTitle>
          <CardDescription>
            Configure o acesso completo a todos os módulos da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Esta ação criará um perfil de Super Admin com acesso total a todas as funcionalidades.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Email:</strong> admin@cbnkerigma.org.br</p>
            <p><strong>Senha:</strong> Kerigma@2025#</p>
            <p className="text-xs text-amber-600">
              Você será solicitado a alterar a senha no primeiro login.
            </p>
          </div>

          <Button 
            onClick={bootstrapSuperAdmin}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary to-primary/80"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Configurando...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Configurar Super Admin
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};