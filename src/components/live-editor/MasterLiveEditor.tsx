import React, { useEffect, useState } from "react";
import { useLiveEditor } from "./LiveEditorProvider";
import FloatingToolbar from "./FloatingToolbar";
import VisualBlockInserter from "./VisualBlockInserter";
import { DesignStudioEnhancer } from "./DesignStudioEnhancer";
import { ContextualPropertyPanel } from "./ContextualPropertyPanel";
import CreativeWorkshopModal from "./CreativeWorkshopModal";

const MasterLiveEditor: React.FC = () => {
  const { isAdmin, editMode } = useLiveEditor();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isAdmin && !isInitialized) {
      console.log('🎨 Initializing Master Live Editor System');
      
      const style = document.createElement('style');
      style.id = 'live-editor-global-styles';
      style.textContent = `
        [data-live-editor="true"] {
          position: relative;
        }
        
        [data-live-editor="true"]:hover::before {
          content: "";
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border: 2px dashed hsl(var(--primary));
          border-radius: 4px;
          pointer-events: none;
          z-index: 1000;
        }
      `;
      
      document.head.appendChild(style);
      setIsInitialized(true);
    }

    return () => {
      const style = document.getElementById('live-editor-global-styles');
      if (style) {
        style.remove();
      }
    };
  }, [isAdmin, isInitialized]);

  useEffect(() => {
    if (editMode) {
      document.body.classList.add('live-editor-active');
    } else {
      document.body.classList.remove('live-editor-active');
    }
  }, [editMode]);

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <FloatingToolbar />
      {editMode && <VisualBlockInserter />}
      {editMode && <DesignStudioEnhancer />}
      <ContextualPropertyPanel />
      <CreativeWorkshopModal open={false} onOpenChange={() => {}} />
    </>
  );
};

export default MasterLiveEditor;