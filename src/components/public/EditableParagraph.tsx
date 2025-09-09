import React from "react";
import { EditableText } from "./EditableText";
import { cn } from "@/lib/utils";

interface EditableParagraphProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export const EditableParagraph: React.FC<EditableParagraphProps> = ({ 
  id, 
  children, 
  className 
}) => {
  return (
    <EditableText
      id={id}
      element="p"
      className={cn("text-base leading-relaxed", className)}
    >
      {children}
    </EditableText>
  );
};