import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Crown, Key, Shield } from "lucide-react";
import { SuperAdminBootstrap } from "@/components/admin/SuperAdminBootstrap";
import { usePasswordReset } from "@/hooks/usePasswordReset";
import { ImpersonationDebug } from "@/components/debug/ImpersonationDebug";
import ReCAPTCHA from "react-google-recaptcha";

const AuthPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { resetJocksanPassword, isLoading: resetLoading } = usePasswordReset();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [showPasswordSignup, setShowPasswordSignup] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedRole, setSelectedRole] = useState<'pastor' | 'lider' | 'membro'>('membro');
  const [showBootstrap, setShowBootstrap] = useState(false);
  const [showAdminButton, setShowAdminButton] = useState(false);
  const captchaRefLogin = useRef<ReCAPTCHA>(null);
  const captchaRefSignup = useRef<ReCAPTCHA>(null);
  const [captchaTokenLogin, setCaptchaTokenLogin] = useState<string | null>(null);
  const [captchaTokenSignup, setCaptchaTokenSignup] = useState<string | null>(null);

  // Usando chave de teste do Google reCAPTCHA (sempre passa em desenvolvimento)
  const RECAPTCHA_SITE_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

  useEffect(() => {
    document.title = "Entrar | Kerigma Hub";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Acesse o Kerigma Hub: login e cadastro para líderes e membros.");
    try {
      const stored = localStorage.getItem("remember_me");
      if (stored !== null) setRememberMe(stored !== "false");
    } catch {}

    // Atalhos alternativos para Linux Mint
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl+Shift+A ou duplo clique na palavra "plataforma"
      if ((e.ctrlKey && e.shiftKey && e.key === 'A') || 
          (e.altKey && e.key === 'a')) {
        setShowAdminButton(true);
      }
      // Também pode usar F12 como alternativa
      if (e.key === 'F12') {
        setShowAdminButton(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const signIn = async () => {
    try {
      setLoading(true);
      
      if (!captchaTokenLogin) {
        toast({ title: "Verificação necessária", description: "Complete o captcha para continuar.", variant: "destructive" });
        return;
      }
      
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password,
        options: {
          captchaToken: captchaTokenLogin
        }
      });
      
      if (error) throw error;
      
      try { localStorage.setItem("remember_me", rememberMe ? "true" : "false"); } catch {}
      toast({ title: "Login realizado", description: "Redirecionando..." });
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      toast({ title: "Erro ao entrar", description: err?.message ?? "Tente novamente.", variant: "destructive" });
      // Reset captcha em caso de erro
      captchaRefLogin.current?.reset();
      setCaptchaTokenLogin(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async () => {
    try {
      setLoading(true);
      
      if (!captchaTokenSignup) {
        toast({ title: "Verificação necessária", description: "Complete o captcha para continuar.", variant: "destructive" });
        return;
      }
      
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          emailRedirectTo: redirectUrl,
          captchaToken: captchaTokenSignup,
          data: {
            role: selectedRole
          }
        },
      });
      
      if (error) throw error;
      
      // If user is created, add role to user_roles table
      if (data.user) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role: selectedRole as any,
            active: true
          });
        
        if (roleError) {
          console.warn('Role assignment error:', roleError);
        }
      }
      
      toast({ title: "Cadastro enviado", description: "Verifique seu e-mail para confirmar o acesso." });
    } catch (err: any) {
      toast({ title: "Erro no cadastro", description: err?.message ?? "Tente novamente.", variant: "destructive" });
      // Reset captcha em caso de erro
      captchaRefSignup.current?.reset();
      setCaptchaTokenSignup(null);
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async () => {
    try {
      if (!email) {
        toast({ title: "Informe seu e-mail", description: "Digite seu e-mail para recuperar a senha." });
        return;
      }
      // Usar a URL exata que funciona no ambiente
      const redirectTo = window.location.origin + '/reset-password';
      
      console.log('Sending password reset to:', email, 'with redirect:', redirectTo);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, { 
        redirectTo,
        captchaToken: undefined
      });
      
      console.log('Reset password result:', { error });
      if (error) throw error;
      toast({ title: "E-mail enviado", description: "Verifique sua caixa de entrada para redefinir a senha." });
    } catch (err: any) {
      toast({ title: "Erro ao enviar e-mail", description: err?.message ?? "Tente novamente.", variant: "destructive" });
    }
  };

  if (showBootstrap) {
    return <SuperAdminBootstrap />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted px-4 py-10">
      <div className="w-full max-w-md space-y-4">
        <ImpersonationDebug />
        <Card className="shadow-xl">
        <CardHeader>
          <CardTitle 
            className="text-2xl cursor-pointer" 
            onDoubleClick={() => setShowAdminButton(true)}
            title="Duplo clique para admin (ou pressione F12)"
          >
            Acessar plataforma
          </CardTitle>
          <CardDescription>Entre ou crie sua conta para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="entrar" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="entrar">Entrar</TabsTrigger>
              <TabsTrigger value="cadastrar">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="entrar" className="space-y-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  signIn();
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm">E-mail</label>
                  <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">Senha</label>
                  <div className="relative">
                    <Input
                      type={showPasswordLogin ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPasswordLogin((v) => !v)}
                      aria-label={showPasswordLogin ? "Ocultar senha" : "Mostrar senha"}
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswordLogin ? <EyeOff /> : <Eye />}
                     </Button>
                   </div>
                 </div>
                 
                 {/* reCAPTCHA para login */}
                 <div className="flex justify-center">
                   <ReCAPTCHA
                     ref={captchaRefLogin}
                     sitekey={RECAPTCHA_SITE_KEY}
                     onChange={(token) => setCaptchaTokenLogin(token)}
                     onExpired={() => setCaptchaTokenLogin(null)}
                     onError={() => setCaptchaTokenLogin(null)}
                   />
                 </div>
                 
                 <div className="flex items-center justify-between">
                   <label htmlFor="remember" className="flex items-center gap-2 text-sm">
                     <Checkbox
                       id="remember"
                       checked={rememberMe}
                       onCheckedChange={(v) => {
                         const checked = Boolean(v);
                         setRememberMe(checked);
                         try { localStorage.setItem("remember_me", checked ? "true" : "false"); } catch {}
                       }}
                     />
                     <span className="select-none">Permanecer conectado</span>
                   </label>
                   <div className="flex items-center gap-4">
                     <Button variant="link" type="button" onClick={forgotPassword} className="px-0">
                       Esqueci minha senha
                     </Button>
                     <Button type="submit" disabled={loading || !captchaTokenLogin} className="min-w-28">
                       {loading ? "Entrando..." : "Entrar"}
                     </Button>
                   </div>
                 </div>
               </form>
             </TabsContent>

             <TabsContent value="cadastrar" className="space-y-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  signUp();
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm">E-mail</label>
                  <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" required />
                </div>
                 <div className="space-y-2">
                   <label className="text-sm">Senha</label>
                   <Input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" required minLength={8} />
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm">Perfil de Acesso</label>
                    <Select value={selectedRole} onValueChange={(value: 'pastor' | 'lider' | 'membro') => setSelectedRole(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione seu perfil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="membro">Membro</SelectItem>
                        <SelectItem value="lider">Líder</SelectItem>
                        <SelectItem value="pastor">Pastor</SelectItem>
                      </SelectContent>
                     </Select>
                  </div>
                  
                  {/* reCAPTCHA para cadastro */}
                  <div className="flex justify-center">
                    <ReCAPTCHA
                      ref={captchaRefSignup}
                      sitekey={RECAPTCHA_SITE_KEY}
                      onChange={(token) => setCaptchaTokenSignup(token)}
                      onExpired={() => setCaptchaTokenSignup(null)}
                      onError={() => setCaptchaTokenSignup(null)}
                    />
                  </div>
                  
                 <div className="flex items-center justify-end">
                   <Button type="submit" disabled={loading || !captchaTokenSignup} className="min-w-28">
                     {loading ? "Cadastrando..." : "Cadastrar"}
                   </Button>
                 </div>
                 <p className="text-xs text-muted-foreground">Ao continuar, você concorda com nossos termos e política de privacidade.</p>
              </form>
            </TabsContent>
          </Tabs>
          
          {showAdminButton && (
            <div className="text-center border-t pt-4 mt-6 space-y-2">
              <Button 
                variant="outline" 
                onClick={() => setShowBootstrap(true)}
                className="text-sm w-full"
              >
                <Crown className="mr-2 h-4 w-4" />
                Configurar Super Admin
              </Button>
              <Button 
                variant="outline" 
                onClick={resetJocksanPassword}
                disabled={resetLoading}
                className="text-sm w-full"
              >
                <Key className="mr-2 h-4 w-4" />
                {resetLoading ? 'Resetando...' : 'Resetar Senha Jocksan'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default AuthPage;
