import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface MobileOptimizedTableProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const MobileOptimizedTable: React.FC<MobileOptimizedTableProps> = ({
  children,
  className,
  title
}) => {
  return (
    <Card className={cn("w-full", className)}>
      {title && (
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0">
        {/* Mobile: Card layout */}
        <div className="block sm:hidden">
          {children}
        </div>
        
        {/* Desktop: Table with horizontal scroll */}
        <div className="hidden sm:block">
          <ScrollArea className="w-full">
            <div className="min-w-full overflow-x-auto">
              {children}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

interface MobileTableCardProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileTableCard: React.FC<MobileTableCardProps> = ({
  children,
  className
}) => {
  return (
    <Card className={cn("mb-3 sm:hidden", className)}>
      <CardContent className="p-4">
        {children}
      </CardContent>
    </Card>
  );
};

interface MobileTableFieldProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export const MobileTableField: React.FC<MobileTableFieldProps> = ({
  label,
  value,
  className
}) => {
  return (
    <div className={cn("flex justify-between items-start py-2 border-b border-border last:border-b-0", className)}>
      <span className="text-sm font-medium text-muted-foreground min-w-0 pr-2">
        {label}:
      </span>
      <span className="text-sm text-foreground text-right min-w-0 flex-1">
        {value}
      </span>
    </div>
  );
};