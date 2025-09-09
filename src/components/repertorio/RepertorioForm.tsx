import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

interface RepertorioFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

export function RepertorioForm({ 
  initialData, 
  onSubmit, 
  isSubmitting = false, 
  isEditing = false 
}: RepertorioFormProps) {
  const [formData, setFormData] = useState({
    titulo: '',
    artista: '',
    tom: '',
    bpm: '',
    letra: '',
    cifra: '',
    link_referencia: '',
    tags: [] as string[]
  });
  
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        titulo: initialData.titulo || '',
        artista: initialData.artista || '',
        tom: initialData.tom || '',
        bpm: initialData.bpm?.toString() || '',
        letra: initialData.letra || '',
        cifra: initialData.cifra || '',
        link_referencia: initialData.link_referencia || '',
        tags: initialData.tags || []
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo.trim()) {
      return;
    }

    const submitData = {
      titulo: formData.titulo.trim(),
      artista: formData.artista.trim() || null,
      tom: formData.tom.trim() || null,
      bpm: formData.bpm ? parseInt(formData.bpm) : null,
      letra: formData.letra.trim() || null,
      cifra: formData.cifra.trim() || null,
      link_referencia: formData.link_referencia.trim() || null,
      tags: formData.tags.length > 0 ? formData.tags : null,
      ativo: true
    };

    await onSubmit(submitData);
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="titulo">Título *</Label>
          <Input
            id="titulo"
            value={formData.titulo}
            onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
            placeholder="Nome da música"
            required
          />
        </div>

        <div>
          <Label htmlFor="artista">Artista</Label>
          <Input
            id="artista"
            value={formData.artista}
            onChange={(e) => setFormData(prev => ({ ...prev, artista: e.target.value }))}
            placeholder="Nome do artista"
          />
        </div>

        <div>
          <Label htmlFor="tom">Tom</Label>
          <Input
            id="tom"
            value={formData.tom}
            onChange={(e) => setFormData(prev => ({ ...prev, tom: e.target.value }))}
            placeholder="Ex: G, Am, C#"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="bpm">Tempo (BPM)</Label>
          <Input
            id="bpm"
            type="number"
            value={formData.bpm}
            onChange={(e) => setFormData(prev => ({ ...prev, bpm: e.target.value }))}
            placeholder="Ex: 120"
            min="60"
            max="200"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="link_referencia">Link de Referência</Label>
          <Input
            id="link_referencia"
            value={formData.link_referencia}
            onChange={(e) => setFormData(prev => ({ ...prev, link_referencia: e.target.value }))}
            placeholder="YouTube, Spotify, etc."
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="cifra">Link da Cifra</Label>
          <Input
            id="cifra"
            value={formData.cifra}
            onChange={(e) => setFormData(prev => ({ ...prev, cifra: e.target.value }))}
            placeholder="Link para cifra ou partitura"
          />
        </div>

        <div className="md:col-span-2">
          <Label>Tags</Label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Adicionar tag..."
                className="flex-1"
              />
              <Button type="button" onClick={addTag} variant="outline" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="letra">Letra</Label>
          <Textarea
            id="letra"
            value={formData.letra}
            onChange={(e) => setFormData(prev => ({ ...prev, letra: e.target.value }))}
            placeholder="Cole aqui a letra da música..."
            rows={6}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button 
          type="submit" 
          disabled={isSubmitting || !formData.titulo.trim()}
          className="flex-1"
        >
          {isSubmitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Adicionar Música')}
        </Button>
      </div>
    </form>
  );
}