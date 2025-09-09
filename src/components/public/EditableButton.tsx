import React, { useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { EditableComponentWrapper } from "@/components/live-editor/EditableComponentWrapper";

interface EditableButtonProps extends ButtonProps {
  editableId?: string;
  text?: string;
}

export const EditableButton: React.FC<EditableButtonProps> = ({
  editableId = `button-${Math.random().toString(36).substr(2, 9)}`,
  text,
  children,
  variant = "default",
  size = "default",
  ...props
}) => {
  const [currentProps, setCurrentProps] = useState({
    text: text || (typeof children === 'string' ? children : ''),
    variant,
    size,
    disabled: props.disabled || false
  });

  const handlePropsChange = (newProps: Record<string, any>) => {
    setCurrentProps(prev => ({ ...prev, ...newProps }));
  };

  return (
    <EditableComponentWrapper
      id={editableId}
      type="Button"
      props={currentProps}
      onPropsChange={handlePropsChange}
    >
      <Button
        {...props}
        variant={currentProps.variant as any}
        size={currentProps.size as any}
        disabled={currentProps.disabled}
      >
        {currentProps.text || children}
      </Button>
    </EditableComponentWrapper>
  );
};