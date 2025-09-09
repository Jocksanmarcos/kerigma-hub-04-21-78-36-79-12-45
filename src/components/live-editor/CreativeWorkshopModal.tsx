import React, { useState } from "react";
import { useLiveEditor } from "./LiveEditorProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Wand2, 
  FileText, 
  Image, 
  Calendar, 
  Users, 
  BookOpen,
  Video,
  Music,
  Award,
  Plus,
  Sparkles
} from "lucide-react";

interface CreativeTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'content' | 'media' | 'events' | 'documents';
  fields: Array<{
    id: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'date' | 'file';
    required?: boolean;
    options?: string[];
    placeholder?: string;
  }>;
}

interface CreativeWorkshopModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreativeWorkshopModal: React.FC<CreativeWorkshopModalProps> = ({ open, onOpenChange }) => {
  const { addBlock } = useLiveEditor();
  const [selectedTemplate, setSelectedTemplate] = useState<CreativeTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isCreating, setIsCreating] = useState(false);

  const templates: CreativeTemplate[] = [
    {
      id: 'hero-section',
      name: 'Seção Hero',
      description: 'Crie uma seção de destaque com título, descrição e botões de ação',
      icon: <Sparkles className="h-5 w-5" />,
      category: 'content',
      fields: [
        { id: 'title', label: 'Título Principal', type: 'text', required: true, placeholder: 'Digite o título impactante...' },
        { id: 'subtitle', label: 'Subtítulo', type: 'text', placeholder: 'Subtítulo opcional...' },
        { id: 'description', label: 'Descrição', type: 'textarea', placeholder: 'Descreva sua mensagem...' },
        { id: 'ctaText', label: 'Texto do Botão', type: 'text', placeholder: 'Saiba Mais' },
        { id: 'ctaLink', label: 'Link do Botão', type: 'text', placeholder: '/contato' },
        { id: 'backgroundType', label: 'Tipo de Fundo', type: 'select', options: ['Cor Sólida', 'Gradiente', 'Imagem'] }
      ]
    },
    {
      id: 'event-card',
      name: 'Card de Evento',
      description: 'Adicione um cartão de evento com data, horário e detalhes',
      icon: <Calendar className="h-5 w-5" />,
      category: 'events',
      fields: [
        { id: 'eventTitle', label: 'Nome do Evento', type: 'text', required: true },
        { id: 'eventDate', label: 'Data', type: 'date', required: true },
        { id: 'eventTime', label: 'Horário', type: 'text', placeholder: '19:30' },
        { id: 'eventLocation', label: 'Local', type: 'text' },
        { id: 'eventDescription', label: 'Descrição', type: 'textarea' },
        { id: 'eventImage', label: 'Imagem do Evento', type: 'file' }
      ]
    },
    {
      id: 'testimonial',
      name: 'Testemunho',
      description: 'Compartilhe testemunhos e histórias inspiradoras',
      icon: <Users className="h-5 w-5" />,
      category: 'content',
      fields: [
        { id: 'testimonialText', label: 'Testemunho', type: 'textarea', required: true },
        { id: 'authorName', label: 'Nome', type: 'text', required: true },
        { id: 'authorRole', label: 'Cargo/Função', type: 'text', placeholder: 'Membro da Igreja' },
        { id: 'authorPhoto', label: 'Foto do Autor', type: 'file' }
      ]
    },
    {
      id: 'media-gallery',
      name: 'Galeria de Mídia',
      description: 'Crie uma galeria de fotos ou vídeos',
      icon: <Image className="h-5 w-5" />,
      category: 'media',
      fields: [
        { id: 'galleryTitle', label: 'Título da Galeria', type: 'text', required: true },
        { id: 'galleryDescription', label: 'Descrição', type: 'textarea' },
        { id: 'galleryType', label: 'Tipo', type: 'select', options: ['Fotos', 'Vídeos', 'Misto'] },
        { id: 'layoutStyle', label: 'Estilo do Layout', type: 'select', options: ['Grade', 'Carrossel', 'Masonry'] }
      ]
    },
    {
      id: 'sermon-player',
      name: 'Player de Pregação',
      description: 'Adicione um player de áudio/vídeo para pregações',
      icon: <Video className="h-5 w-5" />,
      category: 'media',
      fields: [
        { id: 'sermonTitle', label: 'Título da Pregação', type: 'text', required: true },
        { id: 'preacher', label: 'Pregador', type: 'text', required: true },
        { id: 'sermonDate', label: 'Data da Pregação', type: 'date' },
        { id: 'mediaUrl', label: 'URL do Áudio/Vídeo', type: 'text', required: true },
        { id: 'sermonSummary', label: 'Resumo', type: 'textarea' }
      ]
    },
    {
      id: 'course-card',
      name: 'Card de Curso',
      description: 'Promova cursos e estudos bíblicos',
      icon: <BookOpen className="h-5 w-5" />,
      category: 'content',
      fields: [
        { id: 'courseTitle', label: 'Nome do Curso', type: 'text', required: true },
        { id: 'instructor', label: 'Instrutor', type: 'text' },
        { id: 'duration', label: 'Duração', type: 'text', placeholder: '8 semanas' },
        { id: 'schedule', label: 'Horário', type: 'text', placeholder: 'Quartas às 20h' },
        { id: 'courseDescription', label: 'Descrição', type: 'textarea' },
        { id: 'difficulty', label: 'Nível', type: 'select', options: ['Iniciante', 'Intermediário', 'Avançado'] }
      ]
    }
  ];

  const categories = [
    { id: 'content', label: 'Conteúdo', icon: <FileText className="h-4 w-4" /> },
    { id: 'media', label: 'Mídia', icon: <Image className="h-4 w-4" /> },
    { id: 'events', label: 'Eventos', icon: <Calendar className="h-4 w-4" /> },
    { id: 'documents', label: 'Documentos', icon: <Award className="h-4 w-4" /> }
  ];

  const handleTemplateSelect = (template: CreativeTemplate) => {
    setSelectedTemplate(template);
    // Initialize form data with empty values
    const initialData = template.fields.reduce((acc, field) => ({
      ...acc,
      [field.id]: ''
    }), {});
    setFormData(initialData);
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleCreateContent = async () => {
    if (!selectedTemplate) return;
    
    setIsCreating(true);
    try {
      // Create the content block based on template and form data
      const contentBlock = {
        id: `${selectedTemplate.id}-${Date.now()}`,
        type: selectedTemplate.id,
        template: selectedTemplate.name,
        data: formData,
        createdAt: new Date().toISOString()
      };

      addBlock({
        type: selectedTemplate.id,
        content_json: formData
      });
      
      // Reset and close
      setSelectedTemplate(null);
      setFormData({});
      onOpenChange(false);
      
    } catch (error) {
      console.error('Erro ao criar conteúdo:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const renderField = (field: any) => {
    const value = formData[field.id] || '';
    
    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
          />
        );
      
      case 'select':
        return (
          <Select value={value} onValueChange={(value) => handleFieldChange(field.id, value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option.toLowerCase().replace(/\s+/g, '-')}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        );
      
      case 'file':
        return (
          <Input
            type="file"
            onChange={(e) => handleFieldChange(field.id, e.target.files?.[0])}
            accept="image/*,video/*,audio/*"
          />
        );
      
      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Oficina Criativa
            <Badge variant="secondary">Beta</Badge>
          </DialogTitle>
        </DialogHeader>

        {!selectedTemplate ? (
          // Template Selection
          <div className="py-4">
            <Tabs defaultValue="content">
              <TabsList className="grid w-full grid-cols-4">
                {categories.map(category => (
                  <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                    {category.icon}
                    {category.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map(category => (
                <TabsContent key={category.id} value={category.id} className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates
                      .filter(template => template.category === category.id)
                      .map(template => (
                        <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                              {template.icon}
                              {template.name}
                            </CardTitle>
                            <CardDescription>{template.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Button
                              onClick={() => handleTemplateSelect(template)}
                              className="w-full"
                              variant="outline"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Usar Template
                            </Button>
                          </CardContent>
                        </Card>
                      ))
                    }
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        ) : (
          // Template Form
          <div className="py-4">
            <div className="flex items-center gap-2 mb-6">
              <Button variant="ghost" onClick={() => setSelectedTemplate(null)}>
                ← Voltar
              </Button>
              <div className="flex items-center gap-2">
                {selectedTemplate.icon}
                <h3 className="text-lg font-semibold">{selectedTemplate.name}</h3>
              </div>
            </div>

            <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-2">
              {selectedTemplate.fields.map(field => (
                <div key={field.id} className="grid gap-2">
                  <Label htmlFor={field.id} className="flex items-center gap-1">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  {renderField(field)}
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateContent} 
                disabled={isCreating}
                className="bg-primary hover:bg-primary/90"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                {isCreating ? 'Criando...' : 'Criar Conteúdo'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreativeWorkshopModal;