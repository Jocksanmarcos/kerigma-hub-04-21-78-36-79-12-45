import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { UserPlus, Heart, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const FormularioVisitante: React.FC<{ content?: any }> = ({ content }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    nome_completo: "",
    email: "",
    telefone: "",
    endereco: "",
    observacoes: ""
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome_completo.trim()) {
      toast({ title: "Nome é obrigatório", variant: "destructive" });
      return;
    }

    setLoading(true);
    
    try {
      const payload = {
        nome_completo: form.nome_completo.trim(),
        email: form.email.trim() || null,
        telefone: form.telefone.trim() || null,
        endereco: form.endereco.trim() || null,
        observacoes: form.observacoes.trim() || null,
        tipo_pessoa: "visitante",
        situacao: "ativo",
      };

      const { error } = await supabase
        .from("pessoas")
        .insert(payload);

      if (error) {
        console.error("Erro ao inserir visitante:", error);
        toast({ 
          title: "Erro ao enviar dados", 
          description: "Tente novamente ou entre em contato conosco.",
          variant: "destructive" 
        });
      } else {
        setSuccess(true);
        setForm({
          nome_completo: "",
          email: "",
          telefone: "",
          endereco: "",
          observacoes: ""
        });
        toast({ 
          title: "Obrigado pelo seu interesse!", 
          description: "Recebemos suas informações. Em breve entraremos em contato."
        });
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
      toast({ 
        title: "Erro inesperado", 
        description: "Tente novamente mais tarde.",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Dados Recebidos!</h3>
          <p className="text-muted-foreground mb-4">
            Obrigado pelo seu interesse. Nossa equipe entrará em contato em breve.
          </p>
          <Button 
            variant="outline" 
            onClick={() => setSuccess(false)}
            className="w-full"
          >
            Enviar Outro Cadastro
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-center">
          <Heart className="h-5 w-5 text-primary" />
          Seja Bem-Vindo(a)!
        </CardTitle>
        <p className="text-sm text-muted-foreground text-center">
          {content?.mensagem || "Gostaríamos de conhecer você melhor. Preencha os dados abaixo:"}
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              type="text"
              placeholder="Seu nome completo"
              value={form.nome_completo}
              onChange={(e) => setForm({ ...form, nome_completo: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="telefone">Telefone/WhatsApp</Label>
            <Input
              id="telefone"
              type="tel"
              placeholder="(00) 00000-0000"
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="endereco">Endereço (Opcional)</Label>
            <Input
              id="endereco"
              type="text"
              placeholder="Cidade, bairro..."
              value={form.endereco}
              onChange={(e) => setForm({ ...form, endereco: e.target.value })}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="observacoes">Como nos conheceu?</Label>
            <Textarea
              id="observacoes"
              placeholder="Conte-nos como chegou até aqui..."
              value={form.observacoes}
              onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
              disabled={loading}
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full"
            size="lg"
          >
            {loading ? (
              "Enviando..."
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Enviar Dados
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Seus dados serão tratados com privacidade e utilizados apenas para contato da igreja.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default FormularioVisitante;