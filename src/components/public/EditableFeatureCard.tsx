import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { EditableComponentWrapper } from "@/components/live-editor/EditableComponentWrapper";
import { EditableText } from "./EditableText";
import { LucideIcon } from "lucide-react";

interface EditableFeatureCardProps {
  editableId?: string;
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export const EditableFeatureCard: React.FC<EditableFeatureCardProps> = ({
  editableId = `feature-card-${Math.random().toString(36).substr(2, 9)}`,
  icon: Icon,
  title,
  description,
  className
}) => {
  const [currentProps, setCurrentProps] = useState({
    title,
    description
  });

  const handlePropsChange = (newProps: Record<string, any>) => {
    setCurrentProps(prev => ({ ...prev, ...newProps }));
  };

  return (
    <EditableComponentWrapper
      id={editableId}
      type="FeatureCard"
      props={currentProps}
      onPropsChange={handlePropsChange}
    >
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <Icon className="h-12 w-12 text-primary mx-auto mb-4" />
          <EditableText
            id={`${editableId}-title`}
            element="h3"
            className="text-xl font-semibold mb-3"
          >
            {currentProps.title}
          </EditableText>
          <EditableText
            id={`${editableId}-description`}
            element="p"
            className="text-muted-foreground"
          >
            {currentProps.description}
          </EditableText>
        </CardContent>
      </Card>
    </EditableComponentWrapper>
  );
};

export default EditableFeatureCard;