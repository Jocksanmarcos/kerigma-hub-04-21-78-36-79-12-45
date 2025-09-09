import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLiveEditor } from "./LiveEditorProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Smartphone, Wrench, Palette, Undo2, Redo2, Send, LogOut } from "lucide-react";
import CreativeWorkshopModal from "./CreativeWorkshopModal";
import { ContextualPropertyPanel } from "./ContextualPropertyPanel";
import { DesignStudioPanel } from "./design-studio/DesignStudioPanel";

const toolbarBase = "fixed z-[1000] bottom-6 right-6 flex items-center gap-2 bg-card/90 backdrop-blur border border-border rounded-full shadow-lg px-3 py-2";

const FloatingToolbar: React.FC = () => {
  const { 
    isAdmin, 
    editMode, 
    setEditMode, 
    designMode, 
    pendingBlocks, 
    saveAll, 
    selectedComponent,
    canUndo,
    canRedo,
    undo,
    redo,
    saveDraft,
    publishChanges,
    exitEditMode
  } = useLiveEditor();
  const [mobilePreview, setMobilePreview] = useState(false);
  const [openWorkshop, setOpenWorkshop] = useState(false);
  const [showDesignStudio, setShowDesignStudio] = useState(false);

  useEffect(() => {
    const cls = "live-editor-mobile";
    if (mobilePreview) {
      document.documentElement.classList.add(cls);
    } else {
      document.documentElement.classList.remove(cls);
    }
  }, [mobilePreview]);

  if (!isAdmin) return null;

  return createPortal(
    <>
      <div className={toolbarBase} role="region" aria-label="Editor ao Vivo">
        <Button size="sm" variant={editMode ? "default" : "secondary"} onClick={() => setEditMode(!editMode)}>
          {editMode ? "Editar: ON" : "Editar: OFF"}
        </Button>
        
        {editMode && (
          <>
            {/* History Controls */}
            <Button size="sm" variant="outline" onClick={undo} disabled={!canUndo} title="Desfazer">
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={redo} disabled={!canRedo} title="Refazer">
              <Redo2 className="h-4 w-4" />
            </Button>
            
            {/* View Controls */}
            <Button size="sm" variant="outline" onClick={() => setMobilePreview((v) => !v)}>
              <Smartphone className="h-4 w-4 mr-1" /> {mobilePreview ? "Desktop" : "Mobile"}
            </Button>
            
            {/* Studio Controls */}
            <Button 
              size="sm" 
              variant={showDesignStudio ? "default" : "outline"}
              onClick={() => setShowDesignStudio(!showDesignStudio)}
            >
              <Palette className="h-4 w-4 mr-1" /> Studio
            </Button>
            <Button size="sm" variant="outline" onClick={() => setOpenWorkshop(true)}>
              <Wrench className="h-4 w-4 mr-1" /> Oficina
            </Button>
            
            {/* Save Controls */}
            <Button size="sm" variant="outline" onClick={saveDraft}>
              <Save className="h-4 w-4 mr-1" /> Rascunho
            </Button>
            <Button size="sm" variant="default" onClick={publishChanges}>
              <Send className="h-4 w-4 mr-1" /> Publicar
            </Button>
            
            {/* Exit Control */}
            <Button size="sm" variant="destructive" onClick={exitEditMode}>
              <LogOut className="h-4 w-4 mr-1" /> Sair
            </Button>
          </>
        )}
        
        {!editMode && (
          <>
            <Button size="sm" variant="outline" onClick={() => setMobilePreview((v) => !v)}>
              <Smartphone className="h-4 w-4 mr-2" /> {mobilePreview ? "Desktop" : "Mobile"}
            </Button>
          </>
        )}
        {pendingBlocks.length > 0 && (
          <Badge variant="secondary">{pendingBlocks.length} blocos</Badge>
        )}
        {selectedComponent && (
          <Badge variant="default">{selectedComponent.type} selecionado</Badge>
        )}

        <CreativeWorkshopModal open={openWorkshop} onOpenChange={setOpenWorkshop} />
      </div>
      
      {/* Design Studio Panel */}
      {showDesignStudio && <DesignStudioPanel onClose={() => setShowDesignStudio(false)} />}
      
      {/* Property Panel */}
      <ContextualPropertyPanel />
    </>,
    document.body
  );
};

export default FloatingToolbar;