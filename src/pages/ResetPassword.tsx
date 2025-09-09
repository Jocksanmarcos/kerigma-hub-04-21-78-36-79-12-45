import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Lock } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    const handlePasswordReset = async () => {
      // Debug: Log all URL parameters and current URL
      const allParams = Object.fromEntries(searchParams.entries());
      const currentURL = window.location.href;
      console.log('Current URL:', currentURL);
      console.log('Reset URL params:', allParams);
      
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      
      // If there's an error in the URL
      if (error) {
        console.error('URL Error:', error, errorDescription);
        toast({
          title: "Erro no link",
          description: errorDescription || "Link de reset inválido",
          variant: "destructive"
        });
        setTimeout(() => navigate('/auth'), 3000);
        return;
      }
      
      // Check if this is a password recovery with tokens
      if (type === 'recovery' && accessToken && refreshToken) {
        try {
          console.log('Attempting to set session with tokens');
          console.log('Access token length:', accessToken.length);
          console.log('Refresh token length:', refreshToken.length);
          
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (sessionError) {
            console.error('Session error:', sessionError);
            toast({
              title: "Token inválido",
              description: "O link de reset expirou ou é inválido. Solicite um novo link.",
              variant: "destructive"
            });
            setTimeout(() => navigate('/auth'), 3000);
          } else {
            console.log('Session set successfully:', data);
            setIsValidToken(true);
            toast({
              title: "Link válido",
              description: "Agora você pode definir sua nova senha.",
            });
          }
        } catch (error: any) {
          console.error('Reset error:', error);
          toast({
            title: "Erro",
            description: "Ocorreu um erro ao processar o link de reset.",
            variant: "destructive"
          });
          setTimeout(() => navigate('/auth'), 3000);
        }
      } else if (type === 'recovery' && !accessToken) {
        // Password recovery type but no tokens - might be an old link format
        console.log('Recovery type found but no tokens');
        toast({
          title: "Link incompleto",
          description: "Este link não contém os tokens necessários. Solicite um novo link.",
          variant: "destructive"
        });
        setTimeout(() => navigate('/auth'), 3000);
      } else {
        console.log('No recovery type or tokens found');
        console.log('Available params:', Object.keys(allParams));
        toast({
          title: "Link inválido",
          description: "Link de reset de senha inválido. Solicite um novo link de reset.",
          variant: "destructive"
        });
        setTimeout(() => navigate('/auth'), 3000);
      }
    };

    handlePasswordReset();
  }, [searchParams, navigate, toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Senha atualizada!",
        description: "Sua senha foi alterada com sucesso.",
      });

      // Redirect to login page
      setTimeout(() => {
        navigate('/auth');
      }, 2000);
      
    } catch (error: any) {
      toast({
        title: "Erro ao alterar senha",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Lock className="h-5 w-5" />
              Verificando link...
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Lock className="h-5 w-5" />
            Redefinir Senha
          </CardTitle>
          <CardDescription>
            Digite sua nova senha abaixo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nova Senha</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua nova senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirmar Senha</label>
              <Input
                type="password"
                placeholder="Confirme sua nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}