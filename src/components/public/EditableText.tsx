import React, { useEffect, useRef } from "react";
import { useLiveEditor } from "@/components/live-editor/LiveEditorProvider";
import { InlineEditingToolbar } from "@/components/live-editor/InlineEditingToolbar";
import { cn } from "@/lib/utils";

interface EditableTextProps {
  id: string;
  children: React.ReactNode;
  element?: keyof JSX.IntrinsicElements;
  className?: string;
}

export const EditableText: React.FC<EditableTextProps> = ({ 
  id, 
  children, 
  element: Element = "span",
  className 
}) => {
  const { editMode, getTextDraft, setTextDraft, saveInlineEdit, cancelInlineEdit, startInlineEdit, setInlineEditingBlockId } = useLiveEditor();
  const ref = useRef<HTMLElement>(null);

  // Sync drafts with visual content
  useEffect(() => {
    if (!ref.current || editMode) return;
    const draft = getTextDraft(id, "");
    if (draft && ref.current.innerText !== draft) {
      ref.current.innerText = draft;
    }
  }, [editMode, getTextDraft, id]);

  const handleInput = (e: React.FormEvent<HTMLElement>) => {
    const text = (e.currentTarget as HTMLElement).innerText;
    setTextDraft(id, text);
  };

  const handleClick = () => {
    if (editMode && ref.current) {
      const currentContent = ref.current.innerText;
      setInlineEditingBlockId(id);
      startInlineEdit(id, { texto: currentContent }, ref.current);
    }
  };

  const handleSave = async () => {
    const text = ref.current?.innerText || "";
    await saveInlineEdit(id, { texto: text });
  };

  const handleCancel = () => {
    cancelInlineEdit();
  };

  return (
    <div className="relative">
      {React.createElement(
        Element,
        {
          ref,
          className: cn(
            className,
            editMode && "outline-dashed outline-1 outline-primary/50 rounded px-1 cursor-text hover:bg-accent/20 transition-colors"
          ),
          contentEditable: false, // Only enable editing when starting inline edit
          suppressContentEditableWarning: true,
          "data-editable-text-id": id,
          "data-block-id": id, // Important for selector queries
          onInput: handleInput,
          onClick: handleClick,
        },
        children
      )}
      {editMode && (
        <InlineEditingToolbar
          blockId={id}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};