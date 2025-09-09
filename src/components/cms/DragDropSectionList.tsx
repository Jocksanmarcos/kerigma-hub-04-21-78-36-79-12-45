import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { GripVertical, Save } from 'lucide-react';
import { SecaoPagina } from '@/hooks/useHomePageContent';
import { DynamicSectionRenderer } from './DynamicSectionRenderer';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useEditMode } from '@/contexts/EditModeContext';

interface SortableItemProps {
  id: string;
  secao: SecaoPagina;
  isFirstTime?: boolean;
}

function SortableItem({ id, secao, isFirstTime }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners}
        className="absolute -left-12 top-4 z-10 bg-primary text-primary-foreground p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      
      <DynamicSectionRenderer 
        secao={secao} 
        isFirstTime={isFirstTime}
      />
    </div>
  );
}

interface DragDropSectionListProps {
  secoes: SecaoPagina[];
  isFirstTime?: boolean;
  onSectionsReorder?: (newOrder: SecaoPagina[]) => void;
}

export const DragDropSectionList: React.FC<DragDropSectionListProps> = ({
  secoes,
  isFirstTime,
  onSectionsReorder
}) => {
  const { isEditMode } = useEditMode();
  const [items, setItems] = useState(secoes);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over?.id);
        
        const newOrder = arrayMove(items, oldIndex, newIndex);
        setHasUnsavedChanges(true);
        onSectionsReorder?.(newOrder);
        return newOrder;
      });
    }
  };

  const saveNewOrder = async () => {
    if (!hasUnsavedChanges) return;
    
    setIsSaving(true);
    try {
      // Create order update array
      const orderUpdates = items.map((secao, index) => ({
        id: secao.id,
        nova_ordem: index
      }));

      const { error } = await supabase.functions.invoke('atualizar-ordem-secoes', {
        body: { orderUpdates }
      });

      if (error) throw error;

      setHasUnsavedChanges(false);
      toast.success('Nova ordem das seções salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar ordem:', error);
      toast.error('Erro ao salvar nova ordem das seções');
    } finally {
      setIsSaving(false);
    }
  };

  // If not in edit mode, render normally without drag and drop
  if (!isEditMode) {
    return (
      <>
        {secoes.map((secao) => (
          <DynamicSectionRenderer 
            key={secao.id} 
            secao={secao} 
            isFirstTime={isFirstTime}
          />
        ))}
      </>
    );
  }

  // Edit mode: render with drag and drop
  return (
    <div className="relative">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={items.map(item => item.id)} 
          strategy={verticalListSortingStrategy}
        >
          <div className="pl-16">
            {items.map((secao) => (
              <SortableItem 
                key={secao.id} 
                id={secao.id}
                secao={secao} 
                isFirstTime={isFirstTime}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Save Order Button */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={saveNewOrder}
            disabled={isSaving}
            className="gap-2 shadow-lg"
            size="lg"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Salvando...' : 'Salvar Nova Ordem'}
          </Button>
        </div>
      )}
    </div>
  );
};