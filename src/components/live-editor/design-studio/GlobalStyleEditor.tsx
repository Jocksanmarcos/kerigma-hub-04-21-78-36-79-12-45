import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Palette, Wand2, Save } from "lucide-react";
import { useLiveEditor } from "../LiveEditorProvider";
import { useToast } from "@/hooks/use-toast";

export const GlobalStyleEditor: React.FC = () => {
  const { designSystem, updateDesignSystem, generateAIPalette } = useLiveEditor();
  const { toast } = useToast();
  const [isGeneratingPalette, setIsGeneratingPalette] = useState(false);

  const handleColorChange = (colorKey: keyof typeof designSystem.colors, value: string) => {
    updateDesignSystem({
      colors: {
        ...designSystem.colors,
        [colorKey]: value
      }
    });
  };

  const handleFontChange = (fontKey: keyof typeof designSystem.fonts, value: string) => {
    updateDesignSystem({
      fonts: {
        ...designSystem.fonts,
        [fontKey]: value
      }
    });
  };

  const handleSpacingChange = (spacingKey: keyof typeof designSystem.spacing, value: string) => {
    updateDesignSystem({
      spacing: {
        ...designSystem.spacing,
        [spacingKey]: value
      }
    });
  };

  const generatePaletteWithAI = async () => {
    setIsGeneratingPalette(true);
    try {
      const result = await generateAIPalette([designSystem.colors.primary, designSystem.colors.secondary]);
      if (result && result.palette) {
        updateDesignSystem({
          colors: {
            primary: result.palette.primary,
            secondary: result.palette.secondary,
            background: result.palette.background,
            foreground: result.palette.foreground
          }
        });
        toast({
          title: "Paleta Gerada com IA",
          description: "Nova paleta de cores aplicada com sucesso!"
        });
      }
    } catch (error) {
      console.error('Error generating palette:', error);
    } finally {
      setIsGeneratingPalette(false);
    }
  };

  const hslToHex = (hsl: string) => {
    // Convert HSL to HEX for color picker
    const [h, s, l] = hsl.split(' ').map(v => parseFloat(v.replace('%', '')));
    const a = s * Math.min(l, 100 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color / 100).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const hexToHsl = (hex: string) => {
    // Convert HEX to HSL format
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Color Palette */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Paleta de Cores
          </Label>
          <Button 
            size="sm" 
            variant="outline"
            onClick={generatePaletteWithAI}
            disabled={isGeneratingPalette}
            className="text-xs"
          >
            <Wand2 className="h-3 w-3 mr-1" />
            {isGeneratingPalette ? 'Gerando...' : 'IA'}
          </Button>
        </div>
        
        <div className="space-y-3">
          <div>
            <Label htmlFor="primary-color" className="text-xs text-muted-foreground">Cor Primária</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="primary-color"
                type="color"
                value={hslToHex(designSystem.colors.primary)}
                onChange={(e) => handleColorChange('primary', hexToHsl(e.target.value))}
                className="w-12 h-8 p-1 border rounded"
              />
              <Input
                value={designSystem.colors.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="flex-1 text-xs"
                placeholder="213 90% 58%"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="secondary-color" className="text-xs text-muted-foreground">Cor Secundária</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="secondary-color"
                type="color"
                value={hslToHex(designSystem.colors.secondary)}
                onChange={(e) => handleColorChange('secondary', hexToHsl(e.target.value))}
                className="w-12 h-8 p-1 border rounded"
              />
              <Input
                value={designSystem.colors.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                className="flex-1 text-xs"
                placeholder="45 100% 65%"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="background-color" className="text-xs text-muted-foreground">Fundo</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="background-color"
                type="color"
                value={hslToHex(designSystem.colors.background)}
                onChange={(e) => handleColorChange('background', hexToHsl(e.target.value))}
                className="w-12 h-8 p-1 border rounded"
              />
              <Input
                value={designSystem.colors.background}
                onChange={(e) => handleColorChange('background', e.target.value)}
                className="flex-1 text-xs"
                placeholder="0 0% 100%"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="foreground-color" className="text-xs text-muted-foreground">Texto</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="foreground-color"
                type="color"
                value={hslToHex(designSystem.colors.foreground)}
                onChange={(e) => handleColorChange('foreground', hexToHsl(e.target.value))}
                className="w-12 h-8 p-1 border rounded"
              />
              <Input
                value={designSystem.colors.foreground}
                onChange={(e) => handleColorChange('foreground', e.target.value)}
                className="flex-1 text-xs"
                placeholder="215 25% 15%"
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Typography */}
      <div>
        <Label className="text-sm font-medium">Tipografia</Label>
        <div className="space-y-3 mt-3">
          <div>
            <Label htmlFor="heading-font" className="text-xs text-muted-foreground">Fonte dos Títulos</Label>
            <Input
              id="heading-font"
              value={designSystem.fonts.heading}
              onChange={(e) => handleFontChange('heading', e.target.value)}
              className="mt-1 text-xs"
              placeholder="Inter, sans-serif"
            />
          </div>
          <div>
            <Label htmlFor="body-font" className="text-xs text-muted-foreground">Fonte do Corpo</Label>
            <Input
              id="body-font"
              value={designSystem.fonts.body}
              onChange={(e) => handleFontChange('body', e.target.value)}
              className="mt-1 text-xs"
              placeholder="Inter, sans-serif"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Spacing */}
      <div>
        <Label className="text-sm font-medium">Espaçamento</Label>
        <div className="space-y-3 mt-3">
          <div>
            <Label htmlFor="section-spacing" className="text-xs text-muted-foreground">Seções</Label>
            <Input
              id="section-spacing"
              value={designSystem.spacing.section}
              onChange={(e) => handleSpacingChange('section', e.target.value)}
              className="mt-1 text-xs"
              placeholder="4rem"
            />
          </div>
          <div>
            <Label htmlFor="container-width" className="text-xs text-muted-foreground">Largura Máxima</Label>
            <Input
              id="container-width"
              value={designSystem.spacing.container}
              onChange={(e) => handleSpacingChange('container', e.target.value)}
              className="mt-1 text-xs"
              placeholder="1200px"
            />
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <Button 
        className="w-full" 
        onClick={() => {
          toast({
            title: "Estilos Aplicados",
            description: "As alterações de design foram aplicadas!"
          });
        }}
      >
        <Save className="h-4 w-4 mr-2" />
        Aplicar Alterações
      </Button>
    </div>
  );
};