import React, { useState } from "react";
import { EditableComponentWrapper } from "@/components/live-editor/EditableComponentWrapper";
import { cn } from "@/lib/utils";

interface EditableImageProps {
  editableId?: string;
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}

export const EditableImage: React.FC<EditableImageProps> = ({
  editableId = `image-${Math.random().toString(36).substr(2, 9)}`,
  src,
  alt,
  className,
  loading = "lazy"
}) => {
  const [currentProps, setCurrentProps] = useState({
    src,
    alt,
    loading
  });

  const handlePropsChange = (newProps: Record<string, any>) => {
    setCurrentProps(prev => ({ ...prev, ...newProps }));
  };

  return (
    <EditableComponentWrapper
      id={editableId}
      type="Image"
      props={currentProps}
      onPropsChange={handlePropsChange}
    >
      <img
        src={currentProps.src}
        alt={currentProps.alt}
        loading={currentProps.loading}
        className={cn("w-full h-auto", className)}
      />
    </EditableComponentWrapper>
  );
};