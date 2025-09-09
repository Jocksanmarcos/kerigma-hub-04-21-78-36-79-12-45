import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EditableComponentWrapper } from "@/components/live-editor/EditableComponentWrapper";
import { RichTextEditor } from "@/components/live-editor/RichTextEditor";

interface EditableCardProps {
  editableId?: string;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export const EditableCard: React.FC<EditableCardProps> = ({
  editableId = `card-${Math.random().toString(36).substr(2, 9)}`,
  title,
  description,
  children,
  className
}) => {
  const [currentProps, setCurrentProps] = useState({
    title: title || "",
    description: description || "",
    className: className || ""
  });

  const handlePropsChange = (newProps: Record<string, any>) => {
    setCurrentProps(prev => ({ ...prev, ...newProps }));
  };

  return (
    <EditableComponentWrapper
      id={editableId}
      type="Card"
      props={currentProps}
      onPropsChange={handlePropsChange}
      className={currentProps.className}
    >
      <Card className={currentProps.className}>
        {(currentProps.title || currentProps.description) && (
          <CardHeader>
            {currentProps.title && (
              <CardTitle>
                <RichTextEditor
                  id={`${editableId}-title`}
                  content={currentProps.title}
                  placeholder="Título do card..."
                  tag="h3"
                  onContentChange={(content) => handlePropsChange({ title: content })}
                />
              </CardTitle>
            )}
            {currentProps.description && (
              <CardDescription>
                <RichTextEditor
                  id={`${editableId}-description`}
                  content={currentProps.description}
                  placeholder="Descrição do card..."
                  tag="p"
                  onContentChange={(content) => handlePropsChange({ description: content })}
                />
              </CardDescription>
            )}
          </CardHeader>
        )}
        {children && <CardContent>{children}</CardContent>}
      </Card>
    </EditableComponentWrapper>
  );
};