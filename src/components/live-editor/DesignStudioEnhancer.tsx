import React, { useEffect } from "react";
import { useLiveEditor } from "./LiveEditorProvider";

/**
 * Design Studio Enhancer
 * Automatically makes all text elements on the page editable in edit mode
 * This component should be included in the main layout when editMode is active
 */
export const DesignStudioEnhancer: React.FC = () => {
  const { editMode, setTextDraft, getTextDraft } = useLiveEditor();

  useEffect(() => {
    if (!editMode) return;

    // Make all text elements editable
    const makeElementsEditable = () => {
      const textElements = document.querySelectorAll(
        'h1, h2, h3, h4, h5, h6, p, span, div[data-text-content="true"], button:not([data-editable-id]), a:not([data-editable-id])'
      );

      textElements.forEach((element, index) => {
        const htmlElement = element as HTMLElement;
        
        // Skip if already made editable or if it's part of the editor UI
        if (
          htmlElement.getAttribute('contenteditable') === 'true' ||
          htmlElement.closest('[data-editor-ui="true"]') ||
          htmlElement.closest('.floating-toolbar') ||
          htmlElement.closest('[data-editable-id]') ||
          htmlElement.closest('[data-universal-text-id]')
        ) {
          return;
        }

        // Generate unique ID for this element
        const elementId = `auto-text-${index}-${Date.now()}`;
        
        // Make contentEditable
        htmlElement.contentEditable = 'true';
        htmlElement.setAttribute('data-universal-text-id', elementId);
        
        // Add visual indicators
        htmlElement.style.outline = '1px dashed rgba(var(--primary), 0.3)';
        htmlElement.style.borderRadius = '4px';
        htmlElement.style.padding = '2px';
        htmlElement.style.margin = '2px';
        htmlElement.style.cursor = 'text';
        
        // Add event listeners
        const handleInput = (e: Event) => {
          const text = (e.target as HTMLElement).innerText;
          setTextDraft(elementId, text);
        };

        const handleFocus = () => {
          htmlElement.style.outline = '2px solid rgba(var(--primary), 0.6)';
        };

        const handleBlur = () => {
          htmlElement.style.outline = '1px dashed rgba(var(--primary), 0.3)';
        };

        htmlElement.addEventListener('input', handleInput);
        htmlElement.addEventListener('focus', handleFocus);
        htmlElement.addEventListener('blur', handleBlur);

        // Store cleanup function
        (htmlElement as any).__editorCleanup = () => {
          htmlElement.removeEventListener('input', handleInput);
          htmlElement.removeEventListener('focus', handleFocus);
          htmlElement.removeEventListener('blur', handleBlur);
          htmlElement.removeAttribute('contenteditable');
          htmlElement.removeAttribute('data-universal-text-id');
          htmlElement.style.outline = '';
          htmlElement.style.borderRadius = '';
          htmlElement.style.padding = '';
          htmlElement.style.margin = '';
          htmlElement.style.cursor = '';
        };
      });
    };

    // Debounce the enhancement to avoid performance issues
    const timeoutId = setTimeout(makeElementsEditable, 100);

    return () => {
      clearTimeout(timeoutId);
      
      // Cleanup all enhanced elements
      const enhancedElements = document.querySelectorAll('[data-universal-text-id]');
      enhancedElements.forEach(element => {
        const cleanup = (element as any).__editorCleanup;
        if (cleanup) cleanup();
      });
    };
  }, [editMode, setTextDraft, getTextDraft]);

  // This component doesn't render anything
  return null;
};