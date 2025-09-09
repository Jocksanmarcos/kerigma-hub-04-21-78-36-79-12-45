import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Palette, Layout, Wand2 } from "lucide-react";
import { useLiveEditor } from "../LiveEditorProvider";
import { useToast } from "@/hooks/use-toast";

export const AIDesignAssistant: React.FC = () => {
  const { generateAIPalette, generateAISection, updateDesignSystem, addBlock } = useLiveEditor();
  const { toast } = useToast();
  
  const [paletteBase, setPaletteBase] = useState('');
  const [sectionPrompt, setSectionPrompt] = useState('');
  const [isGeneratingPalette, setIsGeneratingPalette] = useState(false);
  const [isGeneratingSection, setIsGeneratingSection] = useState(false);

  const handleGeneratePalette = async () => {
    if (!paletteBase.trim()) {
      toast({
        title: "Entrada Necessária",
        description: "Descreva as cores base desejadas",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingPalette(true);
    try {
      const baseColors = paletteBase.split(',').map(c => c.trim());
      const result = await generateAIPalette(baseColors);
      
      if (result && result.palette) {
        updateDesignSystem({
          colors: result.palette
        });
        toast({
          title: "Paleta Criada com IA",
          description: "Nova paleta aplicada com sucesso!"
        });
      }
    } catch (error) {
      console.error('Error generating palette:', error);
    } finally {
      setIsGeneratingPalette(false);
    }
  };

  const handleGenerateSection = async () => {
    if (!sectionPrompt.trim()) {
      toast({
        title: "Prompt Necessário",
        description: "Descreva a seção que deseja criar",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingSection(true);
    try {
      const result = await generateAISection(sectionPrompt);
      
      if (result && result.section) {
        addBlock({
          type: 'AI_Generated_Section',
          content_json: result.section
        });
        toast({
          title: "Seção Criada com IA",
          description: "Nova seção foi adicionada à página!"
        });
        setSectionPrompt('');
      }
    } catch (error) {
      console.error('Error generating section:', error);
    } finally {
      setIsGeneratingSection(false);
    }
  };

  const quickPalettePresets = [
    { name: "Igreja Tradicional", colors: "azul escuro, dourado, branco" },
    { name: "Moderno Vibrante", colors: "azul vibrante, laranja, cinza claro" },
    { name: "Natureza Acolhedora", colors: "verde natureza, bege, marrom claro" },
    { name: "Elegante Minimalista", colors: "preto, branco, cinza médio" }
  ];

  const sectionPresets = [
    "Seção de testemunhos com cards visuais e depoimentos inspiradores",
    "Área de eventos próximos com calendário e botões de inscrição",
    "Galeria de fotos da comunidade em grid responsivo",
    "Seção de ministérios com ícones e descrições",
    "Hero banner com call-to-action para primeira visita",
    "FAQ sobre a igreja com perguntas e respostas expandíveis"
  ];

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-purple-500" />
        <h3 className="font-medium">Assistente de IA Criativo</h3>
      </div>

      {/* AI Palette Generator */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Gerador de Paletas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="palette-base" className="text-xs text-muted-foreground">
              Cores Base (separadas por vírgula)
            </Label>
            <Input
              id="palette-base"
              value={paletteBase}
              onChange={(e) => setPaletteBase(e.target.value)}
              placeholder="azul celestial, dourado suave, branco puro"
              className="mt-1 text-xs"
            />
          </div>
          
          <div className="flex flex-wrap gap-1">
            {quickPalettePresets.map((preset) => (
              <Button
                key={preset.name}
                size="sm"
                variant="outline"
                onClick={() => setPaletteBase(preset.colors)}
                className="text-xs h-6 px-2"
              >
                {preset.name}
              </Button>
            ))}
          </div>

          <Button 
            onClick={handleGeneratePalette}
            disabled={isGeneratingPalette}
            className="w-full"
            size="sm"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            {isGeneratingPalette ? 'Gerando Paleta...' : 'Gerar Paleta com IA'}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* AI Section Builder */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Construtor de Seções
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="section-prompt" className="text-xs text-muted-foreground">
              Descrição da Seção Desejada
            </Label>
            <Textarea
              id="section-prompt"
              value={sectionPrompt}
              onChange={(e) => setSectionPrompt(e.target.value)}
              placeholder="Crie uma seção de testemunhos com 3 depoimentos em cards com fotos dos membros..."
              className="mt-1 text-xs min-h-[60px]"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Sugestões Rápidas:</Label>
            <div className="space-y-1">
              {sectionPresets.map((preset, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="ghost"
                  onClick={() => setSectionPrompt(preset)}
                  className="text-xs h-auto p-2 text-left justify-start whitespace-normal"
                >
                  • {preset}
                </Button>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleGenerateSection}
            disabled={isGeneratingSection}
            className="w-full"
            size="sm"
          >
            <Layout className="h-4 w-4 mr-2" />
            {isGeneratingSection ? 'Criando Seção...' : 'Criar Seção com IA'}
          </Button>
        </CardContent>
      </Card>

      {/* AI Tips */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-purple-500 mt-0.5" />
            <div className="text-xs">
              <p className="font-medium text-purple-900 mb-1">Dicas de IA</p>
              <ul className="text-purple-700 space-y-1">
                <li>• Seja específico nas descrições</li>
                <li>• Mencione o público-alvo</li>
                <li>• Inclua detalhes visuais desejados</li>
                <li>• Use referências de estilo</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};