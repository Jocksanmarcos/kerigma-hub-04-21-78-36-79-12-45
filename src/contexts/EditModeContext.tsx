import React, { createContext, useContext, useState, ReactNode } from 'react';
import { BlogoConteudo } from '@/hooks/useHomePageContent';

interface EditModeContextType {
  isEditMode: boolean;
  setEditMode: (enabled: boolean) => void;
  editingBlock: BlogoConteudo | null;
  setEditingBlock: (block: BlogoConteudo | null) => void;
  isEditModalOpen: boolean;
  setEditModalOpen: (open: boolean) => void;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

export const EditModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBlock, setEditingBlock] = useState<BlogoConteudo | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const setEditMode = (enabled: boolean) => {
    setIsEditMode(enabled);
    if (!enabled) {
      setEditingBlock(null);
      setIsEditModalOpen(false);
    }
  };

  const setEditModalOpen = (open: boolean) => setIsEditModalOpen(open);

  return (
    <EditModeContext.Provider value={{
      isEditMode,
      setEditMode,
      editingBlock,
      setEditingBlock,
      isEditModalOpen,
      setEditModalOpen
    }}>
      {children}
    </EditModeContext.Provider>
  );
};

export const useEditMode = () => {
  const context = useContext(EditModeContext);
  if (context === undefined) {
    throw new Error('useEditMode must be used within an EditModeProvider');
  }
  return context;
};