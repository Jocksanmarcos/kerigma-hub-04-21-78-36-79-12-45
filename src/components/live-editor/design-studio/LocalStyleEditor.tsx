import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Wand2, Target, Save } from "lucide-react";
import { useLiveEditor } from "../LiveEditorProvider";
import { useToast } from "@/hooks/use-toast";

export const LocalStyleEditor: React.FC = () => {
  const { selectedComponent, refineWithAI } = useLiveEditor();
  const { toast } = useToast();
  const [localStyles, setLocalStyles] = useState({
    backgroundColor: '',
    textColor: '',
    padding: '',
    margin: '',
    borderRadius: '',
    fontSize: ''
  });
  const [isRefining, setIsRefining] = useState(false);

  const handleStyleChange = (key: string, value: string) => {
    setLocalStyles(prev => ({ ...prev, [key]: value }));
  };

  const refineStylesWithAI = async () => {
    if (!selectedComponent) return;
    
    setIsRefining(true);
    try {
      const result = await refineWithAI(selectedComponent.id, localStyles);
      if (result && result.suggestions) {
        setLocalStyles(result.suggestions);
        toast({
          title: "Estilos Refinados com IA",
          description: "Sugestões de melhorias aplicadas!"
        });
      }
    } catch (error) {
      console.error('Error refining styles:', error);
    } finally {
      setIsRefining(false);
    }
  };

  const applyStyles = () => {
    if (!selectedComponent) return;
    
    // Apply styles to the selected component
    const element = document.querySelector(`[data-component-id="${selectedComponent.id}"]`);
    if (element) {
      Object.entries(localStyles).forEach(([key, value]) => {
        if (value) {
          (element as HTMLElement).style[key as any] = value;
        }
      });
      
      toast({
        title: "Estilos Aplicados",
        description: `Estilos locais aplicados ao ${selectedComponent.type}`
      });
    }
  };

  if (!selectedComponent) {
    return (
      <div className="h-full flex items-center justify-center text-center">
        <div className="space-y-4">
          <div className="w-12 h-12 mx-auto bg-muted/50 rounded-full flex items-center justify-center">
            <Target className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium mb-2">Nenhum Componente Selecionado</h3>
            <p className="text-sm text-muted-foreground">
              Clique em qualquer elemento da página para editar seus estilos locais.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selected Component Info */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="text-xs">
            {selectedComponent.type}
          </Badge>
          <Button 
            size="sm" 
            variant="outline"
            onClick={refineStylesWithAI}
            disabled={isRefining}
            className="text-xs ml-auto"
          >
            <Wand2 className="h-3 w-3 mr-1" />
            {isRefining ? 'Refinando...' : 'Refinar com IA'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          ID: {selectedComponent.id}
        </p>
      </div>

      <Separator />

      {/* Local Style Controls */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="bg-color" className="text-xs text-muted-foreground">Cor de Fundo</Label>
          <Input
            id="bg-color"
            value={localStyles.backgroundColor}
            onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
            className="mt-1 text-xs"
            placeholder="transparent"
          />
        </div>

        <div>
          <Label htmlFor="text-color" className="text-xs text-muted-foreground">Cor do Texto</Label>
          <Input
            id="text-color"
            value={localStyles.textColor}
            onChange={(e) => handleStyleChange('textColor', e.target.value)}
            className="mt-1 text-xs"
            placeholder="inherit"
          />
        </div>

        <div>
          <Label htmlFor="padding" className="text-xs text-muted-foreground">Padding</Label>
          <Input
            id="padding"
            value={localStyles.padding}
            onChange={(e) => handleStyleChange('padding', e.target.value)}
            className="mt-1 text-xs"
            placeholder="1rem"
          />
        </div>

        <div>
          <Label htmlFor="margin" className="text-xs text-muted-foreground">Margin</Label>
          <Input
            id="margin"
            value={localStyles.margin}
            onChange={(e) => handleStyleChange('margin', e.target.value)}
            className="mt-1 text-xs"
            placeholder="0"
          />
        </div>

        <div>
          <Label htmlFor="border-radius" className="text-xs text-muted-foreground">Border Radius</Label>
          <Input
            id="border-radius"
            value={localStyles.borderRadius}
            onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
            className="mt-1 text-xs"
            placeholder="0.5rem"
          />
        </div>

        <div>
          <Label htmlFor="font-size" className="text-xs text-muted-foreground">Tamanho da Fonte</Label>
          <Input
            id="font-size"
            value={localStyles.fontSize}
            onChange={(e) => handleStyleChange('fontSize', e.target.value)}
            className="mt-1 text-xs"
            placeholder="1rem"
          />
        </div>
      </div>

      {/* Apply Button */}
      <Button 
        className="w-full" 
        onClick={applyStyles}
      >
        <Save className="h-4 w-4 mr-2" />
        Aplicar Estilos
      </Button>
    </div>
  );
};