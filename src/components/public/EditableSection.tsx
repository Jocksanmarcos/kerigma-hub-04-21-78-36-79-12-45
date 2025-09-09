import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { EditableComponentWrapper } from "@/components/live-editor/EditableComponentWrapper";

interface EditableSectionProps {
  editableId?: string;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "muted" | "primary" | "accent";
  id?: string;
}

export const EditableSection: React.FC<EditableSectionProps> = ({
  editableId = `section-${Math.random().toString(36).substr(2, 9)}`,
  children,
  className,
  variant = "default",
  id,
}) => {
  const [currentProps, setCurrentProps] = useState({
    variant,
    className: className || ''
  });

  const handlePropsChange = (newProps: Record<string, any>) => {
    setCurrentProps(prev => ({ ...prev, ...newProps }));
  };

  const base = "py-24 md:py-28";
  const variants: Record<string, string> = {
    default: "bg-background",
    muted: "bg-muted",
    primary: "bg-primary text-primary-foreground",
    accent: "bg-accent text-accent-foreground",
  };

  return (
    <EditableComponentWrapper
      id={editableId}
      type="Section"
      props={currentProps}
      onPropsChange={handlePropsChange}
    >
      <section id={id} className={cn(base, variants[currentProps.variant], currentProps.className)}>
        <div className="max-w-6xl mx-auto px-4">{children}</div>
      </section>
    </EditableComponentWrapper>
  );
};

export default EditableSection;