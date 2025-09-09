import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'secondary';
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = 'default',
  className
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-surface-blue border-primary/20 shadow-kerigma-md';
      case 'secondary':
        return 'bg-surface-yellow border-secondary/20 shadow-kerigma-md';
      default:
        return 'shadow-kerigma hover:shadow-kerigma-md';
    }
  };

  return (
    <Card className={cn('overflow-hidden', getVariantStyles(), className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide pr-3 break-words leading-snug">
          {title}
        </CardTitle>
        <div
          className={cn(
            'p-2 rounded-kerigma shrink-0 ml-3',
            variant === 'primary' && 'bg-primary/10 text-primary',
            variant === 'secondary' && 'bg-secondary/10 text-secondary',
            variant === 'default' && 'bg-muted text-muted-foreground'
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-3xl font-bold text-foreground">
          {value}
        </div>
        {(description || trend) && (
          <div className="flex items-center gap-2 text-sm">
            {trend && (
              <span
                className={cn(
                  'font-semibold',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
            {description && (
              <span className="text-muted-foreground">{description}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};