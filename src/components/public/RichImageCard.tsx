import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { EditableComponentWrapper } from "@/components/live-editor/EditableComponentWrapper";
import { EditableText } from "./EditableText";

interface RichImageCardProps {
  editableId?: string;
  image: string;
  title: string;
  subtitle?: string;
  alt: string;
  className?: string;
}

export const RichImageCard: React.FC<RichImageCardProps> = ({
  editableId = `rich-image-card-${Math.random().toString(36).substr(2, 9)}`,
  image,
  title,
  subtitle,
  alt,
  className,
}) => {
  const [currentProps, setCurrentProps] = useState({
    image,
    title,
    subtitle: subtitle || '',
    alt
  });

  const handlePropsChange = (newProps: Record<string, any>) => {
    setCurrentProps(prev => ({ ...prev, ...newProps }));
  };

  return (
    <EditableComponentWrapper
      id={editableId}
      type="RichImageCard"
      props={currentProps}
      onPropsChange={handlePropsChange}
    >
      <article className={cn("relative rounded-xl overflow-hidden shadow-kerigma-lg group", className)}>
        <img
          src={currentProps.image}
          alt={currentProps.alt}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent transition-opacity duration-300" />
        <div className="relative z-10 p-6 md:p-8 mt-[45%]">
          <EditableText
            id={`${editableId}-title`}
            element="h3"
            className="text-xl md:text-2xl font-semibold text-background"
          >
            {currentProps.title}
          </EditableText>
          {currentProps.subtitle && (
            <EditableText
              id={`${editableId}-subtitle`}
              element="p"
              className="text-sm md:text-base mt-2 text-background/90"
            >
              {currentProps.subtitle}
            </EditableText>
          )}
        </div>
      </article>
    </EditableComponentWrapper>
  );
};

export default RichImageCard;
