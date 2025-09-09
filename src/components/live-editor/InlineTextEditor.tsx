import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

// Safe hook para casos onde o LiveEditorProvider não está disponível
const useSafeLiveEditor = () => {
  try {
    const { useLiveEditor } = require('./LiveEditorProvider');
    return useLiveEditor();
  } catch {
    return { 
      editMode: false,
      inlineEditingBlockId: null,
      startInlineEdit: () => {},
      saveInlineEdit: () => Promise.resolve(),
      cancelInlineEdit: () => {}
    };
  }
};

interface InlineTextEditorProps {
  blockId: string;
  content: any;
  element?: keyof JSX.IntrinsicElements;
  className?: string;
  children: React.ReactNode;
}

/**
 * V2.0 Inline Text Editor
 * Provides direct inline editing with floating toolbar
 */
export const InlineTextEditor: React.FC<InlineTextEditorProps> = ({
  blockId,
  content,
  element: Element = "div",
  className,
  children
}) => {
  const {
    editMode,
    inlineEditingBlockId,
    startInlineEdit,
    saveInlineEdit,
    cancelInlineEdit
  } = useSafeLiveEditor();

  const elementRef = useRef<HTMLElement>(null);
  const isEditing = inlineEditingBlockId === blockId;

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (!editMode || isEditing) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    if (elementRef.current) {
      startInlineEdit(blockId, content, elementRef.current);
    }
  };

  const handleSave = async () => {
    if (!elementRef.current) return;
    
    const newContent = {
      ...content,
      texto: elementRef.current.textContent || elementRef.current.innerText || ""
    };
    
    await saveInlineEdit(blockId, newContent);
  };

  const handleCancel = () => {
    cancelInlineEdit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  // Ensure proper focus and cursor position
  useEffect(() => {
    if (isEditing && elementRef.current) {
      elementRef.current.focus();
      // Place cursor at end of text
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(elementRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

  const editorClassName = cn(
    className,
    editMode && !isEditing && "cursor-pointer hover:ring-1 hover:ring-primary/30 rounded-sm transition-all",
    isEditing && "ring-2 ring-primary/50 rounded-sm outline-none bg-background/90 backdrop-blur-sm"
  );

  return (
    <div className="relative group">
      {React.createElement(Element, {
        ref: elementRef as any,
        className: editorClassName,
        onClick: handleClick,
        onKeyDown: isEditing ? handleKeyDown : undefined,
        suppressContentEditableWarning: true,
        'data-block-id': blockId,
        'data-inline-editable': editMode ? 'true' : 'false'
      }, children)}

      {/* Floating Toolbar */}
      {isEditing && (
        <div className="absolute -top-12 left-0 z-50 flex items-center gap-1 bg-popover border rounded-md shadow-lg p-1 animate-in fade-in-0 slide-in-from-bottom-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors"
            title="Salvar (Ctrl+Enter)"
          >
            <Check className="w-3 h-3" />
            Salvar
          </button>
          <button
            onClick={handleCancel}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded transition-colors"
            title="Cancelar (Esc)"
          >
            <X className="w-3 h-3" />
            Cancelar
          </button>
        </div>
      )}

      {/* Edit indicator when not editing */}
      {editMode && !isEditing && (
        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-primary text-primary-foreground text-xs px-1 py-0.5 rounded text-center leading-none">
            ✏️
          </div>
        </div>
      )}
    </div>
  );
};