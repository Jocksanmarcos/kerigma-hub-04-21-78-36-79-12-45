import React, { useEffect, useRef } from "react";
import { useLiveEditor } from "./LiveEditorProvider";
import { cn } from "@/lib/utils";

interface UniversalTextEditorProps {
  id: string;
  children: React.ReactNode;
  element?: keyof JSX.IntrinsicElements;
  className?: string;
  placeholder?: string;
  allowLineBreaks?: boolean;
}

/**
 * Universal text editor that can be applied to any text element
 * Provides in-place editing for all text content across the site
 */
export const UniversalTextEditor: React.FC<UniversalTextEditorProps> = ({ 
  id, 
  children, 
  element: Element = "span",
  className,
  placeholder = "Clique para editar...",
  allowLineBreaks = false
}) => {
  const { editMode, getTextDraft, setTextDraft, addToHistory } = useLiveEditor();
  const ref = useRef<HTMLElement>(null);
  const [isEditing, setIsEditing] = React.useState(false);

  // Get current content from drafts or fallback to children
  const getCurrentContent = () => {
    const draft = getTextDraft(id, "");
    if (draft) return draft;
    if (typeof children === 'string') return children;
    if (React.isValidElement(children)) {
      return children.props.children || "";
    }
    return "";
  };

  const currentContent = getCurrentContent();

  // Sync visual content with drafts
  useEffect(() => {
    if (!ref.current || !editMode) return;
    const draft = getTextDraft(id, "");
    if (draft && ref.current.innerText !== draft) {
      ref.current.innerText = draft;
    }
  }, [editMode, getTextDraft, id]);

  const handleInput = (e: React.FormEvent<HTMLElement>) => {
    const text = (e.currentTarget as HTMLElement).innerText;
    setTextDraft(id, text);
  };

  const handleFocus = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    // Save to history when editing is complete
    addToHistory("text_edit", { id, content: currentContent });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    // Prevent line breaks in certain contexts
    if (e.key === 'Enter' && !allowLineBreaks) {
      e.preventDefault();
    }
    
    // Allow Escape to blur and save
    if (e.key === 'Escape') {
      (e.currentTarget as HTMLElement).blur();
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (!editMode) return;
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).focus();
  };

  if (!editMode) {
    return React.createElement(Element, {
      className,
      dangerouslySetInnerHTML: { __html: currentContent || (typeof children === 'string' ? children : '') }
    });
  }

  const editorClassName = cn(
    className,
    "outline-none cursor-text transition-all duration-200 min-h-[1.2em]",
    isEditing 
      ? "ring-2 ring-primary/50 ring-offset-2" 
      : "hover:ring-1 hover:ring-primary/30",
    !currentContent && !children && "opacity-50"
  );

  return React.createElement(Element, {
    ref: ref as any,
    className: editorClassName,
    contentEditable: editMode,
    suppressContentEditableWarning: true,
    onInput: handleInput,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
    onClick: handleClick,
    'data-placeholder': (!currentContent && !children) ? placeholder : undefined,
    'data-universal-text-id': id
  }, children);
};