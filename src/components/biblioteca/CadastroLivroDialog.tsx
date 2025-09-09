import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateBook, useUpdateBook } from '@/hooks/useBooks';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { BookOpen, Loader2, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CadastroLivroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookToEdit?: any;
}

interface BookFormData {
  titulo: string;
  autor: string;
  sinopse: string;
  categoria: string;
  editora: string;
  ano_publicacao: number;
  imagem_capa_url: string;
  isbn: string;
}

const CadastroLivroDialog = ({ open, onOpenChange, bookToEdit }: CadastroLivroDialogProps) => {
  const createBookMutation = useCreateBook();
  const updateBookMutation = useUpdateBook();
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<BookFormData>();
  const [isbnLoading, setIsbnLoading] = useState(false);
  const [previewCover, setPreviewCover] = useState<string>('');
  const isEditing = !!bookToEdit;

  // Load book data for editing
  useEffect(() => {
    if (bookToEdit && open) {
      setValue('titulo', bookToEdit.titulo || '');
      setValue('autor', bookToEdit.autor || '');
      setValue('editora', bookToEdit.editora || '');
      setValue('ano_publicacao', bookToEdit.ano_publicacao || '');
      setValue('sinopse', bookToEdit.sinopse || '');
      setValue('imagem_capa_url', bookToEdit.imagem_capa_url || '');
      setValue('categoria', bookToEdit.categoria || '');
      setValue('isbn', bookToEdit.isbn || '');
      setPreviewCover(bookToEdit.imagem_capa_url || '');
    } else if (!bookToEdit && open) {
      reset();
      setPreviewCover('');
    }
  }, [bookToEdit, open, setValue, reset]);

  const searchByISBN = async () => {
    const isbn = watch('isbn');
    if (!isbn) {
      toast.error('Por favor, digite um ISBN');
      return;
    }

    setIsbnLoading(true);
    console.log('Buscando ISBN:', isbn);
    
    try {
      const { data, error } = await supabase.functions.invoke('isbn-lookup', {
        body: { isbn }
      });

      console.log('Resposta da busca ISBN:', { data, error });

      if (error) {
        console.error('Erro na edge function:', error);
        throw error;
      }

      if (data && data.success && data.data) {
        const bookInfo = data.data;
        console.log('Dados do livro encontrados:', bookInfo);
        
        setValue('titulo', bookInfo.titulo || '');
        setValue('autor', bookInfo.autor || '');
        setValue('editora', bookInfo.editora || '');
        setValue('ano_publicacao', bookInfo.ano_publicacao || '');
        setValue('sinopse', bookInfo.sinopse || '');
        setValue('imagem_capa_url', bookInfo.imagem_capa_url || '');
        setValue('categoria', bookInfo.categoria || '');
        
        // Set preview cover for immediate visual feedback
        setPreviewCover(bookInfo.imagem_capa_url || '');
        
        if (bookInfo.titulo) {
          toast.success('Informações do livro carregadas com sucesso!');
        } else {
          toast.warning('ISBN encontrado, mas sem informações detalhadas. Complete manualmente.');
        }
      } else {
        console.log('Livro não encontrado ou resposta inválida:', data);
        toast.warning('Livro não encontrado. Você pode preencher as informações manualmente.');
      }
    } catch (error) {
      console.error('Erro ao buscar ISBN:', error);
      toast.error('Erro ao buscar informações do livro: ' + (error as Error).message);
    } finally {
      setIsbnLoading(false);
    }
  };

  const onSubmit = async (data: BookFormData) => {
    try {
      if (isEditing) {
        await updateBookMutation.mutateAsync({
          id: bookToEdit.id,
          updates: {
            titulo: data.titulo,
            autor: data.autor,
            sinopse: data.sinopse,
            categoria: data.categoria,
            editora: data.editora,
            ano_publicacao: data.ano_publicacao,
            imagem_capa_url: data.imagem_capa_url,
            isbn: data.isbn,
          }
        });
        toast.success('Livro atualizado com sucesso!');
      } else {
        await createBookMutation.mutateAsync({
          titulo: data.titulo,
          autor: data.autor,
          sinopse: data.sinopse,
          categoria: data.categoria,
          editora: data.editora,
          ano_publicacao: data.ano_publicacao,
          imagem_capa_url: data.imagem_capa_url,
          isbn: data.isbn,
          status: 'Disponível'
        });
        toast.success('Livro cadastrado com sucesso!');
      }
      
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(isEditing ? 'Erro ao atualizar livro' : 'Erro ao cadastrar livro');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Livro' : 'Cadastrar Novo Livro'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Atualize as informações do livro' : 'Adicione um novo livro ao acervo da biblioteca'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Busca por ISBN */}
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <Label htmlFor="isbn">Busca Rápida por ISBN</Label>
            <div className="flex gap-2">
              <Input 
                id="isbn" 
                placeholder="Digite o ISBN (com ou sem hífens)" 
                {...register('isbn')}
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={searchByISBN}
                disabled={isbnLoading}
                className="shrink-0"
              >
                {isbnLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                {isbnLoading ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Digite o ISBN e clique em "Buscar" para preencher automaticamente as informações do livro
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input 
                id="titulo" 
                placeholder="Digite o título do livro" 
                {...register('titulo', { required: 'Título é obrigatório' })}
              />
              {errors.titulo && (
                <span className="text-sm text-red-500">{errors.titulo.message}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="autor">Autor</Label>
              <Input 
                id="autor" 
                placeholder="Nome do autor" 
                {...register('autor')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select onValueChange={(value) => setValue('categoria', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teologia">Teologia</SelectItem>
                  <SelectItem value="espiritualidade">Espiritualidade</SelectItem>
                  <SelectItem value="romance-cristao">Romance Cristão</SelectItem>
                  <SelectItem value="biografia">Biografia</SelectItem>
                  <SelectItem value="familia">Família</SelectItem>
                  <SelectItem value="jovens">Jovens</SelectItem>
                  <SelectItem value="infantil">Infantil</SelectItem>
                  <SelectItem value="devocionais">Devocionais</SelectItem>
                  <SelectItem value="estudos-biblicos">Estudos Bíblicos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editora">Editora</Label>
              <Input 
                id="editora" 
                placeholder="Nome da editora" 
                {...register('editora')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ano_publicacao">Ano de Publicação</Label>
              <Input 
                id="ano_publicacao" 
                type="number" 
                placeholder="2024"
                {...register('ano_publicacao', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sinopse">Descrição</Label>
            <Textarea 
              id="sinopse" 
              placeholder="Breve descrição do livro..."
              rows={3}
              {...register('sinopse')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imagem_capa_url">URL da Capa</Label>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input 
                  id="imagem_capa_url" 
                  placeholder="https://..." 
                  {...register('imagem_capa_url')}
                  onChange={(e) => {
                    setValue('imagem_capa_url', e.target.value);
                    setPreviewCover(e.target.value);
                  }}
                />
              </div>
              {previewCover && (
                <div className="w-20 h-28 border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  <img 
                    src={previewCover} 
                    alt="Prévia da capa" 
                    className="w-full h-full object-cover"
                    onError={() => setPreviewCover('')}
                  />
                </div>
              )}
            </div>
            {previewCover && (
              <p className="text-xs text-muted-foreground">
                Prévia da capa encontrada automaticamente
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createBookMutation.isPending || updateBookMutation.isPending}
            >
              {(createBookMutation.isPending || updateBookMutation.isPending) ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <BookOpen className="h-4 w-4 mr-2" />
              )}
              {(createBookMutation.isPending || updateBookMutation.isPending) 
                ? (isEditing ? 'Atualizando...' : 'Cadastrando...') 
                : (isEditing ? 'Atualizar Livro' : 'Cadastrar Livro')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CadastroLivroDialog;