import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Upload } from "lucide-react";

const formSchema = z.object({
  titulo: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  descricao: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  categoria: z.string().min(1, "Selecione uma categoria"),
});

type FormData = z.infer<typeof formSchema>;

const categorias = [
  "Roupas",
  "Alimentos",
  "Móveis",
  "Eletrodomésticos",
  "Livros",
  "Brinquedos",
  "Material Escolar",
  "Produtos de Higiene",
  "Outros"
];

interface FormularioDoacaoProps {
  onSuccess: () => void;
}

export function FormularioDoacao({ onSuccess }: FormularioDoacaoProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [fotos, setFotos] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: "",
      descricao: "",
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
        .from('mural_doacoes')
        .insert({
          titulo: data.titulo,
          descricao: data.descricao,
          categoria: data.categoria,
          fotos_urls: fotos.length > 0 ? fotos : null,
          doador_id: pessoa.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Doação cadastrada!",
        description: "Sua oferta foi publicada no mural da generosidade.",
      });
      queryClient.invalidateQueries({ queryKey: ['mural-doacoes'] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cadastrar doação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `mural-doacoes/${fileName}`;

        const { error } = await supabase.storage
          .from('uploads')
          .upload(filePath, file);

        if (error) throw error;

        const { data } = supabase.storage
          .from('uploads')
          .getPublicUrl(filePath);

        return data.publicUrl;
      });

      const urls = await Promise.all(uploadPromises);
      setFotos(prev => [...prev, ...urls]);
    } catch (error: any) {
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <div>
      <DialogHeader>
        <DialogTitle>Oferecer Doação</DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <FormField
            control={form.control}
            name="titulo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título da Doação</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Roupas infantis variadas" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
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
            name="descricao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descreva os itens que está oferecendo, estado de conservação, etc."
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Fotos (opcional)</label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="flex-1"
              />
              {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            {fotos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {fotos.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-20 object-cover rounded border"
                  />
                ))}
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={mutation.isPending || isUploading}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publicando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Publicar Doação
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}