import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { EditableComponentWrapper } from "@/components/live-editor/EditableComponentWrapper";
import { EditableText } from "./EditableText";

interface EditableStatsCardProps {
  editableId?: string;
  value: string;
  label: string;
  className?: string;
}

export const EditableStatsCard: React.FC<EditableStatsCardProps> = ({
  editableId = `stats-card-${Math.random().toString(36).substr(2, 9)}`,
  value,
  label,
  className
}) => {
  const [currentProps, setCurrentProps] = useState({
    value,
    label
  });

  const handlePropsChange = (newProps: Record<string, any>) => {
    setCurrentProps(prev => ({ ...prev, ...newProps }));
  };

  return (
    <EditableComponentWrapper
      id={editableId}
      type="StatsCard"
      props={currentProps}
      onPropsChange={handlePropsChange}
    >
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <EditableText
            id={`${editableId}-value`}
            element="div"
            className="text-4xl md:text-5xl font-bold text-primary mb-2"
          >
            {currentProps.value}
          </EditableText>
          <EditableText
            id={`${editableId}-label`}
            element="div"
            className="text-lg text-muted-foreground"
          >
            {currentProps.label}
          </EditableText>
        </CardContent>
      </Card>
    </EditableComponentWrapper>
  );
};

export default EditableStatsCard;