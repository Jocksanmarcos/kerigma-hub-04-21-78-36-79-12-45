import React, { useState } from "react";
import { EditableComponentWrapper } from "../EditableComponentWrapper";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface EditableCarouselProps {
  editableId?: string;
  items?: Array<{
    id: string;
    content: React.ReactNode;
  }>;
  className?: string;
  autoplay?: boolean;
  loop?: boolean;
}

export const EditableCarousel: React.FC<EditableCarouselProps> = ({
  editableId = `carousel-${Math.random().toString(36).substr(2, 9)}`,
  items = [],
  className,
  autoplay = false,
  loop = true
}) => {
  const [currentProps, setCurrentProps] = useState({
    autoplay,
    loop,
    itemCount: items.length
  });

  const handlePropsChange = (newProps: Record<string, any>) => {
    setCurrentProps(prev => ({ ...prev, ...newProps }));
  };

  return (
    <EditableComponentWrapper
      id={editableId}
      type="Carousel"
      props={currentProps}
      onPropsChange={handlePropsChange}
    >
      <Carousel 
        className={className}
        opts={{
          loop: currentProps.loop
        }}
      >
        <CarouselContent>
          {items.map((item) => (
            <CarouselItem key={item.id}>
              {item.content}
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </EditableComponentWrapper>
  );
};