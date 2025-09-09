import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';
import { toast } from 'sonner';

interface UploadRecursoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const UploadRecursoModal: React.FC<UploadRecursoModalProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const { pessoa } = useCurrentPerson();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    tipo: '',
    categoria: '',
    publico_alvo: [] as string[],
    tags: [] as string[]
  });
  const [file, setFile] = useState<File | null>(null);
  const [newTag, setNewTag] = useState('');
  const [newPublico, setNewPublico] = useState('');

  const tiposRecurso = [
    'Estudo Semanal',
    'Quebra-Gelo', 
    'Vídeo de Treino',
    'Dinâmica',
    'Devocional',
    'Material de Apoio'
  ];

  const categorias = [
    'família',
    'integração',
    'treinamento',
    'discipulado',
    'evangelismo',
    'adoração'
  ];

  const publicosAlvo = [
    'Líder',
    'Co-líder',
    'Anfitrião',
    'Líder em Treinamento',
    'Membros',
    'Visitantes'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pessoa?.id) {
      toast.error('Você precisa estar logado para enviar recursos');
      return;
    }

    if (!formData.titulo || !formData.descricao || !formData.tipo || !formData.categoria) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    
    try {
      let arquivo_url = '';
      let arquivo_nome = '';
      let arquivo_tamanho = '';

      // Upload do arquivo se fornecido
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('recursos-celulas')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Erro no upload:', uploadError);
          toast.error('Erro ao fazer upload do arquivo');
          return;
        }

        const { data: urlData } = supabase.storage
          .from('recursos-celulas')
          .getPublicUrl(fileName);

        arquivo_url = urlData.publicUrl;
        arquivo_nome = file.name;
        arquivo_tamanho = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
      }

      // Inserir recurso na base de dados
      const { error: insertError } = await supabase
        .from('biblioteca_recursos_celulas')
        .insert({
          titulo: formData.titulo,
          descricao: formData.descricao,
          tipo: formData.tipo,
          categoria: formData.categoria,
          publico_alvo: formData.publico_alvo,
          tags: formData.tags,
          arquivo_url: arquivo_url || '#',
          arquivo_nome: arquivo_nome || 'N/A',
          arquivo_tamanho: arquivo_tamanho || null,
          criado_por: pessoa.id,
          ativo: false, // Aguarda aprovação
          downloads: 0
        });

      if (insertError) {
        console.error('Erro ao inserir recurso:', insertError);
        toast.error('Erro ao salvar recurso');
        return;
      }

      toast.success('Recurso enviado com sucesso! Aguardando aprovação.');
      
      // Reset form
      setFormData({
        titulo: '',
        descricao: '',
        tipo: '',
        categoria: '',
        publico_alvo: [],
        tags: []
      });
      setFile(null);
      
      onSuccess();
      onOpenChange(false);
      
    } catch (error) {
      console.error('Erro geral:', error);
      toast.error('Erro inesperado ao enviar recurso');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addPublico = () => {
    if (newPublico && !formData.publico_alvo.includes(newPublico)) {
      setFormData(prev => ({
        ...prev,
        publico_alvo: [...prev.publico_alvo, newPublico]
      }));
      setNewPublico('');
    }
  };

  const removePublico = (publicoToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      publico_alvo: prev.publico_alvo.filter(p => p !== publicoToRemove)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Enviar Novo Recurso
          </DialogTitle>
          <DialogDescription>
            Envie um recurso para a biblioteca. Todos os recursos passam por aprovação antes de ficarem disponíveis.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Ex: Como Conduzir uma Célula Eficaz"
                required
              />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição *</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descreva o conteúdo e objetivos do recurso..."
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Recurso *</Label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposRecurso.map(tipo => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Categoria *</Label>
                <Select value={formData.categoria} onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map(categoria => (
                      <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Upload de Arquivo */}
          <div>
            <Label>Arquivo (Opcional)</Label>
            <div className="mt-2">
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.avi,.mov"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Formatos aceitos: PDF, DOC, DOCX, PPT, PPTX, MP4, AVI, MOV (máx. 50MB)
              </p>
              {file && (
                <div className="mt-2 p-2 bg-muted rounded flex items-center justify-between">
                  <span className="text-sm">{file.name}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setFile(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Público Alvo */}
          <div>
            <Label>Público Alvo</Label>
            <div className="flex gap-2 mt-2">
              <Select value={newPublico} onValueChange={setNewPublico}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Adicionar público alvo" />
                </SelectTrigger>
                <SelectContent>
                  {publicosAlvo.map(publico => (
                    <SelectItem key={publico} value={publico}>{publico}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={addPublico} variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.publico_alvo.map(publico => (
                <Badge key={publico} variant="secondary" className="cursor-pointer" onClick={() => removePublico(publico)}>
                  {publico} <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Adicionar tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="outline" className="cursor-pointer" onClick={() => removeTag(tag)}>
                  #{tag} <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Recurso'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};