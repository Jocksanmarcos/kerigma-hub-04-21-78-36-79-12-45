import React, { useCallback, useState } from "react";
import { useLiveEditor } from "./LiveEditorProvider";
import { cn } from "@/lib/utils";

interface EditableComponentWrapperProps {
  id: string;
  type: string;
  props: Record<string, any>;
  children: React.ReactNode;
  onPropsChange?: (newProps: Record<string, any>) => void;
  className?: string;
}

export const EditableComponentWrapper: React.FC<EditableComponentWrapperProps> = ({
  id,
  type,
  props,
  children,
  onPropsChange,
  className
}) => {
  const { editMode, setSelectedComponent } = useLiveEditor();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!editMode) return;
    e.preventDefault();
    e.stopPropagation();
    
    // Create a fresh copy of props to ensure proper data binding
    const currentProps = { ...props };
    setSelectedComponent({ 
      id, 
      type, 
      props: currentProps, 
      onPropsChange: onPropsChange || (() => {}) 
    });
  }, [editMode, id, type, props, onPropsChange, setSelectedComponent]);

  if (!editMode) {
    return <>{children}</>;
  }

  return (
    <div
      className={cn(
        "relative transition-all duration-200",
        isHovered && "ring-2 ring-primary/50 ring-offset-2",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      data-editable-id={id}
      data-editable-type={type}
    >
      {isHovered && (
        <div className="absolute -top-6 left-0 z-50 bg-primary text-primary-foreground text-xs px-2 py-1 rounded pointer-events-none">
          {type}
        </div>
      )}
      {children}
    </div>
  );
};