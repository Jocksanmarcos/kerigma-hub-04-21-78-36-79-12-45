import React, { useState, useEffect } from "react";
import { useLiveEditor } from "./LiveEditorProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Save, X, Palette, Type, Layout, Image } from "lucide-react";

interface PropertyDefinition {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'color' | 'image' | 'number';
  value: string | number;
  options?: { label: string; value: string }[];
  placeholder?: string;
}

interface EditableElementData {
  id: string;
  type: string;
  title: string;
  properties: PropertyDefinition[];
}

export const ContextualPropertyPanel: React.FC = () => {
  const { editMode } = useLiveEditor();
  const selectedElement = null; // Mock for now
  const updateElement = async (id: string, updates: any) => console.log('Update:', id, updates);
  const clearSelection = () => console.log('Clear selection');
  const [properties, setProperties] = useState<PropertyDefinition[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration - in real implementation, this would come from the selected element
  useEffect(() => {
    if (selectedElement) {
      // Extract properties from the selected element
      const mockProperties: PropertyDefinition[] = [
        {
          id: 'title',
          label: 'Título',
          type: 'text',
          value: selectedElement.textContent || '',
          placeholder: 'Digite o título...'
        },
        {
          id: 'subtitle',
          label: 'Subtítulo',
          type: 'text',
          value: '',
          placeholder: 'Digite o subtítulo...'
        },
        {
          id: 'description',
          label: 'Descrição',
          type: 'textarea',
          value: '',
          placeholder: 'Digite a descrição...'
        },
        {
          id: 'backgroundColor',
          label: 'Cor de Fundo',
          type: 'select',
          value: 'white',
          options: [
            { label: 'Branco', value: 'white' },
            { label: 'Cinza Claro', value: 'gray-50' },
            { label: 'Azul da Marca', value: 'primary' },
            { label: 'Gradiente', value: 'gradient' }
          ]
        },
        {
          id: 'textAlign',
          label: 'Alinhamento do Texto',
          type: 'select',
          value: 'left',
          options: [
            { label: 'Esquerda', value: 'left' },
            { label: 'Centro', value: 'center' },
            { label: 'Direita', value: 'right' }
          ]
        }
      ];
      
      setProperties(mockProperties);
      setHasChanges(false);
    }
  }, [selectedElement]);

  const handlePropertyChange = (propertyId: string, value: string | number) => {
    setProperties(prev => 
      prev.map(prop => 
        prop.id === propertyId ? { ...prop, value } : prop
      )
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selectedElement) return;
    
    setIsLoading(true);
    try {
      // Convert properties to element updates
      const updates = properties.reduce((acc, prop) => ({
        ...acc,
        [prop.id]: prop.value
      }), {});
      
      await updateElement(selectedElement.id, updates);
      setHasChanges(false);
      
      // Apply changes to DOM immediately for visual feedback
      if (selectedElement.textContent !== undefined) {
        const titleProp = properties.find(p => p.id === 'title');
        if (titleProp) {
          selectedElement.textContent = String(titleProp.value);
        }
      }
      
    } catch (error) {
      console.error('Erro ao salvar propriedades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      const confirm = window.confirm('Você tem alterações não salvas. Deseja descartar?');
      if (!confirm) return;
    }
    clearSelection();
  };

  const renderPropertyField = (property: PropertyDefinition) => {
    const commonProps = {
      id: property.id,
      value: String(property.value),
      onChange: (value: any) => handlePropertyChange(property.id, value),
      placeholder: property.placeholder
    };

    switch (property.type) {
      case 'text':
        return (
          <Input
            {...commonProps}
            onChange={(e) => commonProps.onChange(e.target.value)}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            onChange={(e) => commonProps.onChange(e.target.value)}
            rows={3}
          />
        );
      
      case 'select':
        return (
          <Select
            value={String(property.value)}
            onValueChange={commonProps.onChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {property.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'number':
        return (
          <Input
            {...commonProps}
            type="number"
            onChange={(e) => commonProps.onChange(Number(e.target.value))}
          />
        );
      
      default:
        return (
          <Input
            {...commonProps}
            onChange={(e) => commonProps.onChange(e.target.value)}
          />
        );
    }
  };

  if (!editMode || !selectedElement) {
    return null;
  }

  return (
    <Dialog open={!!selectedElement} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Propriedades do Elemento
            <Badge variant="secondary" className="ml-2">
              {selectedElement.tagName?.toLowerCase() || 'elemento'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Content Properties */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              <h3 className="font-semibold">Conteúdo</h3>
            </div>
            <div className="grid gap-4">
              {properties
                .filter(p => ['title', 'subtitle', 'description'].includes(p.id))
                .map(property => (
                  <div key={property.id} className="grid gap-2">
                    <Label htmlFor={property.id}>{property.label}</Label>
                    {renderPropertyField(property)}
                  </div>
                ))
              }
            </div>
          </div>

          <Separator />

          {/* Style Properties */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              <h3 className="font-semibold">Estilo e Layout</h3>
            </div>
            <div className="grid gap-4">
              {properties
                .filter(p => !['title', 'subtitle', 'description'].includes(p.id))
                .map(property => (
                  <div key={property.id} className="grid gap-2">
                    <Label htmlFor={property.id}>{property.label}</Label>
                    {renderPropertyField(property)}
                  </div>
                ))
              }
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleSave} 
                disabled={!hasChanges || isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>

          {hasChanges && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              ⚠️ Você tem alterações não salvas
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

