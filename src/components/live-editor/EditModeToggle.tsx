import React from 'react';
import { Button } from '@/components/ui/button';
import { useEditMode } from '@/contexts/EditModeContext';
import { Edit, X } from 'lucide-react';

// Safe hook para casos onde o LiveEditorProvider não está disponível
const useSafeLiveEditor = () => {
  try {
    const { useLiveEditor } = require('@/components/live-editor/LiveEditorProvider');
    return useLiveEditor();
  } catch {
    return { isAdmin: false };
  }
};

export const EditModeToggle: React.FC = () => {
  const { isEditMode, setEditMode } = useEditMode();
  const { isAdmin } = useSafeLiveEditor();

  // Só mostra para admins
  if (!isAdmin) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      {isEditMode ? (
        <Button
          onClick={() => setEditMode(false)}
          variant="destructive"
          className="shadow-lg"
        >
          <X className="mr-2 h-4 w-4" />
          Sair do Modo de Edição
        </Button>
      ) : (
        <Button
          onClick={() => setEditMode(true)}
          className="shadow-lg"
        >
          <Edit className="mr-2 h-4 w-4" />
          Ativar Modo de Edição
        </Button>
      )}
    </div>
  );
};