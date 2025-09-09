import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Heart } from "lucide-react";

const formSchema = z.object({
  mensagem: z.string().min(1, "Digite uma mensagem para o doador"),
});

type FormData = z.infer<typeof formSchema>;

interface Doacao {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  fotos_urls: string[] | null;
  status: string;
  created_at: string;
  doador_id: string;
  pessoas?: {
    nome_completo: string;
  };
}

interface InteresseModalProps {
  doacao: Doacao | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InteresseModal({ doacao, open, onOpenChange }: InteresseModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mensagem: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!doacao) return;

      // Primeiro obter o ID da pessoa atual
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Usuário não autenticado");

      const { data: pessoa } = await supabase
        .from('pessoas')
        .select('id, nome_completo, telefone, email')
        .eq('user_id', user.user.id)
        .single();

      if (!pessoa) throw new Error("Pessoa não encontrada");

      // Registrar interesse
      const { error } = await supabase
        .from('mural_interessados')
        .insert({
          doacao_id: doacao.id,
          interessado_id: pessoa.id,
          mensagem: data.mensagem,
        });

      if (error) throw error;

      // Notificar o doador via edge function
      await supabase.functions.invoke('notificar-doador', {
        body: {
          doacao_id: doacao.id,
          interessado: {
            nome: pessoa.nome_completo,
            telefone: pessoa.telefone,
            email: pessoa.email,
            mensagem: data.mensagem,
          },
          doacao: {
            titulo: doacao.titulo,
            descricao: doacao.descricao,
          }
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Interesse registrado!",
        description: "O doador foi notificado sobre seu interesse e entrará em contato.",
      });
      queryClient.invalidateQueries({ queryKey: ['mural-doacoes'] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao registrar interesse",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  if (!doacao) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Demonstrar Interesse
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">{doacao.titulo}</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {doacao.descricao}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Oferecido por: {doacao.pessoas?.nome_completo || 'Anônimo'}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="mensagem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensagem para o doador</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Explique por que tem interesse nesta doação e como ela ajudaria você ou sua família..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <p className="text-xs text-muted-foreground">
                Seus dados de contato serão compartilhados com o doador para que ele possa entrar em contato diretamente.
              </p>

              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Heart className="mr-2 h-4 w-4" />
                      Confirmar Interesse
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}