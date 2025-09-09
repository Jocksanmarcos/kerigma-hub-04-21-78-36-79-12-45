import React from "react";
import { createPortal } from "react-dom";
import { useLiveEditor } from "./LiveEditorProvider";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface InlineEditingToolbarProps {
  blockId: string;
  onSave: () => void;
  onCancel: () => void;
}

export const InlineEditingToolbar: React.FC<InlineEditingToolbarProps> = ({
  blockId,
  onSave,
  onCancel
}) => {
  const { inlineEditingBlockId } = useLiveEditor();

  // Only show for the currently editing block
  if (inlineEditingBlockId !== blockId) return null;

  return createPortal(
    <div 
      className="absolute -top-12 right-2 flex items-center gap-1 bg-card/95 backdrop-blur border border-border rounded-full shadow-lg px-2 py-1 z-[1000]"
      role="toolbar"
      aria-label="Ferramentas de edição inline"
    >
      <Button
        size="icon-sm"
        variant="ghost"
        onClick={onSave}
        className="h-7 w-7 hover:bg-success/20 hover:text-success"
        title="Salvar alterações"
      >
        <Check className="h-3 w-3" />
      </Button>
      <Button
        size="icon-sm"
        variant="ghost"
        onClick={onCancel}
        className="h-7 w-7 hover:bg-destructive/20 hover:text-destructive"
        title="Cancelar edição"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>,
    document.body
  );
};