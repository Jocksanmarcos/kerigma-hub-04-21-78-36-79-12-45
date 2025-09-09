import React, { useCallback, useEffect, useRef } from "react";
import { useLiveEditor } from "./LiveEditorProvider";

interface RichTextEditorProps {
  id: string;
  content: string;
  placeholder?: string;
  className?: string;
  onContentChange?: (content: string) => void;
  tag?: keyof JSX.IntrinsicElements;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  id,
  content,
  placeholder = "Clique para editar...",
  className,
  onContentChange,
  tag: Tag = "div"
}) => {
  const { editMode, getTextDraft, setTextDraft } = useLiveEditor();
  const editorRef = useRef<HTMLElement>(null);
  const [isEditing, setIsEditing] = React.useState(false);

  const currentContent = getTextDraft(id, content);

  useEffect(() => {
    if (!editorRef.current || !editMode) return;

    const editor = editorRef.current;
    
    // Set initial content
    if (editor.innerHTML !== currentContent) {
      editor.innerHTML = currentContent;
    }

    const handleInput = () => {
      const newContent = editor.innerHTML;
      setTextDraft(id, newContent);
      onContentChange?.(newContent);
    };

    const handleFocus = () => setIsEditing(true);
    const handleBlur = () => setIsEditing(false);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow basic formatting shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            document.execCommand('bold');
            break;
          case 'i':
            e.preventDefault();
            document.execCommand('italic');
            break;
          case 'u':
            e.preventDefault();
            document.execCommand('underline');
            break;
        }
      }
      
      // Prevent line breaks in certain contexts
      if (e.key === 'Enter' && Tag !== 'div' && Tag !== 'p') {
        e.preventDefault();
      }
    };

    editor.addEventListener('input', handleInput);
    editor.addEventListener('focus', handleFocus);
    editor.addEventListener('blur', handleBlur);
    editor.addEventListener('keydown', handleKeyDown);

    return () => {
      editor.removeEventListener('input', handleInput);
      editor.removeEventListener('focus', handleFocus);
      editor.removeEventListener('blur', handleBlur);
      editor.removeEventListener('keydown', handleKeyDown);
    };
  }, [editMode, id, currentContent, setTextDraft, onContentChange, Tag]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (editMode) {
      e.preventDefault();
      e.stopPropagation();
      editorRef.current?.focus();
    }
  }, [editMode]);

  if (!editMode) {
    return React.createElement(Tag, {
      className,
      dangerouslySetInnerHTML: { __html: currentContent || content }
    });
  }

  const isEmpty = !currentContent && !content;
  const editorClassName = `${className || ''} ${isEditing ? 'ring-2 ring-primary/50 ring-offset-2' : 'hover:ring-1 hover:ring-primary/30'} transition-all duration-200 cursor-text min-h-[1.5em] outline-none${isEmpty ? ' empty-placeholder' : ''}`.trim();

  return React.createElement(Tag, {
    ref: editorRef as any,
    className: editorClassName,
    contentEditable: editMode,
    suppressContentEditableWarning: true,
    onClick: handleClick,
    'data-placeholder': isEmpty ? placeholder : undefined
  });
};