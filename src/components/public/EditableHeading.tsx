import React from "react";
import { EditableText } from "./EditableText";
import { cn } from "@/lib/utils";

interface EditableHeadingProps {
  id: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
}

export const EditableHeading: React.FC<EditableHeadingProps> = ({ 
  id, 
  level = 1, 
  children, 
  className 
}) => {
  const headingStyles = {
    1: "text-4xl font-bold",
    2: "text-3xl font-semibold", 
    3: "text-2xl font-semibold",
    4: "text-xl font-medium",
    5: "text-lg font-medium",
    6: "text-base font-medium"
  };

  return (
    <EditableText
      id={id}
      element={`h${level}` as keyof JSX.IntrinsicElements}
      className={cn(headingStyles[level], className)}
    >
      {children}
    </EditableText>
  );
};