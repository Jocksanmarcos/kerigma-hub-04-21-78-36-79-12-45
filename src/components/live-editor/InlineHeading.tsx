import React from "react";
import { InlineTextEditor } from "./InlineTextEditor";
import { cn } from "@/lib/utils";

interface InlineHeadingProps {
  blockId: string;
  content: any;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  children: React.ReactNode;
}

export const InlineHeading: React.FC<InlineHeadingProps> = ({
  blockId,
  content,
  level = 1,
  className,
  children
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
    <InlineTextEditor
      blockId={blockId}
      content={content}
      element={`h${level}` as keyof JSX.IntrinsicElements}
      className={cn(headingStyles[level], className)}
    >
      {children}
    </InlineTextEditor>
  );
};