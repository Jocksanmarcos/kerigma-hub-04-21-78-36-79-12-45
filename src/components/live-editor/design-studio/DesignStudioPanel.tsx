import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPortal } from "react-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, Wand2, Layers, Sparkles, X } from "lucide-react";
import { useLiveEditor } from "../LiveEditorProvider";
import { GlobalStyleEditor } from "./GlobalStyleEditor";
import { LocalStyleEditor } from "./LocalStyleEditor";
import { AIDesignAssistant } from "./AIDesignAssistant";

export const DesignStudioPanel: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { designMode, setDesignMode, selectedComponent } = useLiveEditor();
  const [activeTab, setActiveTab] = useState("global");

  const getModeConfig = (mode: 'content' | 'architect' | 'visionary') => {
    switch (mode) {
      case 'architect':
        return {
          title: "Modo Arquiteto",
          description: "Controle total do design",
          icon: <Layers className="h-4 w-4" />,
          color: "bg-blue-500"
        };
      case 'visionary':
        return {
          title: "Modo Visionário",
          description: "Assistente de IA criativo",
          icon: <Sparkles className="h-4 w-4" />,
          color: "bg-purple-500"
        };
      default:
        return {
          title: "Modo Conteúdo",
          description: "Edição de conteúdo",
          icon: <Palette className="h-4 w-4" />,
          color: "bg-green-500"
        };
    }
  };

  const currentMode = getModeConfig(designMode);

  // Resizable state and handler
  const [panelSize, setPanelSize] = useState<{ width: number; height: number }>({
    width: 320,
    height: 600,
  });

  const startResize = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = panelSize.width;
    const startHeight = panelSize.height;

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      const maxW = Math.floor(window.innerWidth * 0.9);
      const maxH = Math.floor(window.innerHeight * 0.85);
      const minW = 288; // 18rem
      const minH = 320; // ~20rem

      const newWidth = Math.min(Math.max(minW, startWidth - dx), maxW); // anchored to right
      const newHeight = Math.min(Math.max(minH, startHeight + dy), maxH);

      setPanelSize({ width: newWidth, height: newHeight });
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  // Anchor near toolbar
  const [anchor, setAnchor] = useState<{ right: number; bottom: number }>({ right: 24, bottom: 96 });

  // Draggable panel state
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const update = () => {
      const toolbar = document.querySelector('[role="region"][aria-label="Editor ao Vivo"]') as HTMLElement | null;
      if (toolbar) {
        const rect = toolbar.getBoundingClientRect();
        const right = Math.max(12, Math.round(window.innerWidth - rect.right));
        const bottom = Math.max(12, Math.round(window.innerHeight - rect.top + 8));
        setAnchor({ right, bottom });
      }

      // Initialize default position once near toolbar
      setPosition((prev) => {
        if (prev) return prev;
        const x = Math.max(12, window.innerWidth - panelSize.width - (toolbar ? Math.round(window.innerWidth - toolbar.getBoundingClientRect().right) : 24));
        const y = Math.max(12, window.innerHeight - panelSize.height - (toolbar ? Math.round(window.innerHeight - toolbar.getBoundingClientRect().top + 8) : 96));
        return { x, y };
      });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [panelSize.width, panelSize.height]);

  const handleDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = position ?? {
      x: Math.max(12, window.innerWidth - panelSize.width - anchor.right),
      y: Math.max(12, window.innerHeight - panelSize.height - anchor.bottom),
    };
    setIsDragging(true);

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const newX = Math.min(Math.max(8, startPos.x + dx), window.innerWidth - panelSize.width - 8);
      const newY = Math.min(Math.max(8, startPos.y + dy), window.innerHeight - panelSize.height - 8);
      setPosition({ x: newX, y: newY });
    };

    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return createPortal(
      <Card
        className="design-studio-panel fixed z-[2000] bg-card/95 backdrop-blur-sm border shadow-lg overflow-auto min-w-[18rem] min-h-[20rem] max-w-[90vw] max-h-[85vh] relative"
        style={
          position
            ? { width: panelSize.width, height: panelSize.height, left: Math.round(position.x), top: Math.round(position.y) }
            : { width: panelSize.width, height: panelSize.height, right: anchor.right, bottom: anchor.bottom }
        }
      >
      <CardHeader className="pb-3 cursor-move select-none" onPointerDown={handleDragStart}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${currentMode.color}`} />
            Studio de Design
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {currentMode.title}
            </Badge>
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              aria-label="Fechar painel"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{currentMode.description}</p>
        
        {/* Mode Switcher */}
        <div className="flex gap-1 mt-2">
          <Button 
            size="sm" 
            variant={designMode === 'content' ? 'default' : 'outline'}
            onClick={() => setDesignMode('content')}
            className="flex-1"
          >
            Conteúdo
          </Button>
          <Button 
            size="sm" 
            variant={designMode === 'architect' ? 'default' : 'outline'}
            onClick={() => setDesignMode('architect')}
            className="flex-1"
          >
            <Layers className="h-4 w-4 mr-1" />
            Arquiteto
          </Button>
          <Button 
            size="sm" 
            variant={designMode === 'visionary' ? 'default' : 'outline'}
            onClick={() => setDesignMode('visionary')}
            className="flex-1"
          >
            <Wand2 className="h-4 w-4 mr-1" />
            Visionário
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        {designMode === 'architect' && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="global">Estilos Globais</TabsTrigger>
              <TabsTrigger value="local">
                Locais {selectedComponent && <Badge variant="outline" className="ml-1 text-xs">1</Badge>}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="global" className="mt-4 h-[calc(100%-3rem)] overflow-y-auto">
              <GlobalStyleEditor />
            </TabsContent>
            
            <TabsContent value="local" className="mt-4 h-[calc(100%-3rem)] overflow-y-auto">
              <LocalStyleEditor />
            </TabsContent>
          </Tabs>
        )}

        {designMode === 'visionary' && (
          <div className="h-full">
            <AIDesignAssistant />
          </div>
        )}

        {designMode === 'content' && (
          <div className="h-full flex items-center justify-center text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Palette className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-2">Modo Conteúdo Ativo</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Edite textos e conteúdo diretamente na página.
                </p>
                <p className="text-xs text-muted-foreground">
                  Mude para o Modo Arquiteto para controlar estilos globais e locais.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <div
        onPointerDown={startResize}
        role="separator"
        aria-label="Redimensionar painel"
        className="absolute bottom-1 right-1 h-3.5 w-3.5 cursor-se-resize rounded-sm bg-border/60 hover:bg-border"
        title="Arraste para redimensionar"
      />
    </Card>,
    document.body
  );
};