import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ForcePasswordChangePage: React.FC = () => {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Alterar senha obrigatória | Kerigma";
    const desc = "Defina uma nova senha para acessar a plataforma (obrigatório).";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);
    // Canonical
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", `${window.location.origin}/force-password-change`);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: "Senha muito curta", description: "Use ao menos 8 caracteres." });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Senhas não conferem", description: "Verifique e tente novamente." });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password,
        data: { requires_password_change: false },
      });
      if (error) throw error;
      toast({ title: "Senha atualizada", description: "Redirecionando para o dashboard..." });
      setTimeout(() => {
        window.location.assign("/dashboard");
      }, 800);
    } catch (err: any) {
      toast({ title: "Erro ao atualizar senha", description: err?.message || String(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <h1 className="sr-only">Alterar senha obrigatória</h1>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Defina sua nova senha</CardTitle>
          <CardDescription>Por segurança, é necessário alterar a senha no primeiro acesso.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmar senha</Label>
              <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Atualizando..." : "Atualizar senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default ForcePasswordChangePage;
