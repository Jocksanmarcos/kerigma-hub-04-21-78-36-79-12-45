import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical, Type, Mail, Phone, Calendar, ToggleLeft } from 'lucide-react';

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  description?: string;
  options?: string[];
}

interface FormularioBuilderProps {
  structure: FormField[];
  onChange: (structure: FormField[]) => void;
}

export const FormularioBuilder: React.FC<FormularioBuilderProps> = ({ structure, onChange }) => {
  const [newField, setNewField] = useState<Partial<FormField>>({
    type: 'text',
    label: '',
    required: false
  });

  const fieldTypes = [
    { value: 'text', label: 'Texto', icon: Type },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'phone', label: 'Telefone', icon: Phone },
    { value: 'date', label: 'Data', icon: Calendar },
    { value: 'textarea', label: 'Texto Longo', icon: Type },
    { value: 'select', label: 'Seleção', icon: ToggleLeft },
    { value: 'checkbox', label: 'Checkbox', icon: ToggleLeft },
  ];

  const addField = () => {
    if (!newField.label) return;

    const field: FormField = {
      id: Date.now().toString(),
      type: newField.type || 'text',
      label: newField.label,
      placeholder: newField.placeholder,
      required: newField.required || false,
      description: newField.description,
      options: newField.type === 'select' ? ['Opção 1', 'Opção 2'] : undefined
    };

    onChange([...structure, field]);
    setNewField({
      type: 'text',
      label: '',
      required: false
    });
  };

  const removeField = (id: string) => {
    onChange(structure.filter(field => field.id !== id));
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    onChange(structure.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const moveField = (id: string, direction: 'up' | 'down') => {
    const index = structure.findIndex(field => field.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= structure.length) return;

    const newStructure = [...structure];
    [newStructure[index], newStructure[newIndex]] = [newStructure[newIndex], newStructure[index]];
    onChange(newStructure);
  };

  return (
    <div className="space-y-6">
      {/* Campos existentes */}
      {structure.length > 0 && (
        <div className="space-y-3">
          <Label>Campos do Formulário</Label>
          {structure.map((field, index) => (
            <Card key={field.id} className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex flex-col gap-1 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveField(field.id, 'up')}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveField(field.id, 'down')}
                    disabled={index === structure.length - 1}
                  >
                    ↓
                  </Button>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      placeholder="Label do campo"
                      className="flex-1"
                    />
                    <Badge variant="outline">{field.type}</Badge>
                    {field.required && <Badge variant="secondary">Obrigatório</Badge>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      value={field.placeholder || ''}
                      onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                      placeholder="Placeholder (opcional)"
                    />
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={field.required}
                        onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                      />
                      <Label>Obrigatório</Label>
                    </div>
                  </div>

                  {field.description && (
                    <Input
                      value={field.description}
                      onChange={(e) => updateField(field.id, { description: e.target.value })}
                      placeholder="Descrição do campo"
                    />
                  )}

                  {field.type === 'select' && field.options && (
                    <div className="space-y-2">
                      <Label className="text-sm">Opções:</Label>
                      {field.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...field.options!];
                              newOptions[optionIndex] = e.target.value;
                              updateField(field.id, { options: newOptions });
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newOptions = field.options!.filter((_, i) => i !== optionIndex);
                              updateField(field.id, { options: newOptions });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newOptions = [...field.options!, `Opção ${field.options!.length + 1}`];
                          updateField(field.id, { options: newOptions });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Opção
                      </Button>
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeField(field.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Adicionar novo campo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Adicionar Campo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Campo</Label>
              <Select
                value={newField.type}
                onValueChange={(value) => setNewField(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fieldTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Label do Campo</Label>
              <Input
                value={newField.label || ''}
                onChange={(e) => setNewField(prev => ({ ...prev, label: e.target.value }))}
                placeholder="Ex: Nome completo"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Placeholder (opcional)</Label>
              <Input
                value={newField.placeholder || ''}
                onChange={(e) => setNewField(prev => ({ ...prev, placeholder: e.target.value }))}
                placeholder="Ex: Digite seu nome..."
              />
            </div>

            <div className="flex items-center space-x-2 mt-8">
              <Switch
                checked={newField.required}
                onCheckedChange={(checked) => setNewField(prev => ({ ...prev, required: checked }))}
              />
              <Label>Campo obrigatório</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição (opcional)</Label>
            <Textarea
              value={newField.description || ''}
              onChange={(e) => setNewField(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Texto de ajuda para o usuário..."
              rows={2}
            />
          </div>

          <Button 
            onClick={addField} 
            disabled={!newField.label}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Campo
          </Button>
        </CardContent>
      </Card>

      {structure.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Type className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>Nenhum campo adicionado ainda</p>
          <p className="text-sm">Comece criando o primeiro campo do formulário</p>
        </div>
      )}
    </div>
  );
};