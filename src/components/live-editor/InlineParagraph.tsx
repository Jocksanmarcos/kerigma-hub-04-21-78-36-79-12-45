import React from "react";
import { InlineTextEditor } from "./InlineTextEditor";
import { cn } from "@/lib/utils";

interface InlineParagraphProps {
  blockId: string;
  content: any;
  className?: string;
  children: React.ReactNode;
}

export const InlineParagraph: React.FC<InlineParagraphProps> = ({
  blockId,
  content,
  className,
  children
}) => {
  return (
    <InlineTextEditor
      blockId={blockId}
      content={content}
      element="p"
      className={cn("text-base leading-relaxed", className)}
    >
      {children}
    </InlineTextEditor>
  );
};