import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AccessibleTooltipProps {
  children: React.ReactNode;
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  delayDuration?: number;
  skipDelayDuration?: number;
}

export const AccessibleTooltip: React.FC<AccessibleTooltipProps> = ({
  children,
  content,
  side = 'top',
  delayDuration = 400,
  skipDelayDuration = 100
}) => {
  return (
    <TooltipProvider
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          className="max-w-xs text-sm"
          role="tooltip"
          aria-live="polite"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};