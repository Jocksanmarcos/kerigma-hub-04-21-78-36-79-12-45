import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Lock } from "lucide-react";

const formSchema = z.object({
  descricao_necessidade: z.string().min(20, "Descrição deve ter pelo menos 20 caracteres"),
  categoria: z.string().min(1, "Selecione uma categoria"),
});

type FormData = z.infer<typeof formSchema>;

const categorias = [
  "Alimentação",
  "Moradia",
  "Saúde",
  "Educação",
  "Transporte",
  "Vestuário",
  "Trabalho/Emprego",
  "Apoio Emocional",
  "Outros"
];

interface FormularioPedidoAjudaProps {
  onSuccess: () => void;
}

export function FormularioPedidoAjuda({ onSuccess }: FormularioPedidoAjudaProps) {
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      descricao_necessidade: "",
      categoria: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Primeiro obter o ID da pessoa atual
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Usuário não autenticado");

      const { data: pessoa } = await supabase
        .from('pessoas')
        .select('id')
        .eq('user_id', user.user.id)
        .single();

      if (!pessoa) throw new Error("Pessoa não encontrada");

      const { error } = await supabase
        .from('mural_pedidos_ajuda')
        .insert({
          descricao_necessidade: data.descricao_necessidade,
          categoria: data.categoria,
          solicitante_id: pessoa.id,
        });

      if (error) throw error;

      // Enviar notificação para a equipe de Diaconia
      await supabase.functions.invoke('send-notification', {
        body: {
          userId: 'diaconia',
          title: 'Novo Pedido de Ajuda',
          message: `Nova solicitação de ajuda na categoria: ${data.categoria}`,
          type: 'pedido_ajuda'
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Pedido enviado!",
        description: "Sua solicitação foi enviada confidencialmente para a equipe de Diaconia.",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar pedido",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <div>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Solicitar Ajuda Confidencialmente
        </DialogTitle>
      </DialogHeader>

      <div className="bg-muted/50 p-4 rounded-lg mt-4 mb-6">
        <p className="text-sm text-muted-foreground">
          <strong>Confidencialidade garantida:</strong> Este pedido será visto apenas pela 
          equipe de Diaconia da igreja. Sua identidade será protegida e o atendimento 
          será feito com total discrição e amor cristão.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="categoria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Necessidade</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de ajuda necessária" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria} value={categoria}>
                        {categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="descricao_necessidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição da Necessidade</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descreva sua necessidade com o máximo de detalhes que se sentir confortável em compartilhar. Isso nos ajudará a entender melhor como podemos ajudar."
                    className="min-h-[120px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full" 
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Enviar Pedido Confidencial
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}