import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { LucideIcon } from 'lucide-react';

interface EnhancedCardProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'default' | 'lg';
  interactive?: boolean;
  icon?: LucideIcon;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  onClick?: () => void;
  loading?: boolean;
}

export const EnhancedCard: React.FC<EnhancedCardProps> = ({
  title,
  description,
  children,
  footer,
  className,
  variant = 'default',
  size = 'default',
  interactive = false,
  icon: Icon,
  badge,
  badgeVariant = 'default',
  onClick,
  loading = false,
  ...props
}) => {
  const cardVariants = {
    default: 'bg-card border shadow-kerigma hover:shadow-kerigma-md',
    elevated: 'bg-card border shadow-kerigma-lg hover:shadow-kerigma-xl',
    outlined: 'bg-card border-2 shadow-none hover:shadow-kerigma',
    gradient: 'bg-kerigma-gradient text-white border-0 shadow-kerigma-lg hover:shadow-kerigma-xl',
    success: 'bg-success-soft border-success/20 shadow-kerigma hover:shadow-kerigma-md',
    warning: 'bg-warning-soft border-warning/20 shadow-kerigma hover:shadow-kerigma-md',
    error: 'bg-error-soft border-error/20 shadow-kerigma hover:shadow-kerigma-md',
    info: 'bg-info-soft border-info/20 shadow-kerigma hover:shadow-kerigma-md',
  };

  const sizeVariants = {
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  };

  const cardClasses = cn(
    'rounded-kerigma transition-all duration-200',
    cardVariants[variant],
    interactive && 'cursor-pointer interactive-element',
    loading && 'animate-pulse opacity-75',
    className
  );

  const CardComponent = (
    <Card className={cardClasses} onClick={onClick} {...props}>
      {(title || description || Icon || badge) && (
        <CardHeader className={cn('space-y-4', sizeVariants[size])}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className={cn(
                  'p-2 rounded-lg',
                  variant === 'gradient' ? 'bg-white/20' : 'bg-primary/10'
                )}>
                  <Icon className={cn(
                    'w-5 h-5',
                    variant === 'gradient' ? 'text-white' : 'text-primary'
                  )} />
                </div>
              )}
              <div>
                {title && (
                  <CardTitle className={cn(
                    'text-responsive-lg font-semibold',
                    variant === 'gradient' ? 'text-white' : 'text-foreground'
                  )}>
                    {title}
                  </CardTitle>
                )}
                {description && (
                  <CardDescription className={cn(
                    'text-responsive-sm mt-1',
                    variant === 'gradient' ? 'text-white/80' : 'text-muted-foreground'
                  )}>
                    {description}
                  </CardDescription>
                )}
              </div>
            </div>
            {badge && (
              <Badge variant={badgeVariant} className="shrink-0">
                {badge}
              </Badge>
            )}
          </div>
        </CardHeader>
      )}
      
      {children && (
        <CardContent className={cn(
          sizeVariants[size],
          (title || description || Icon || badge) && 'pt-0'
        )}>
          {children}
        </CardContent>
      )}
      
      {footer && (
        <CardFooter className={cn(sizeVariants[size], 'pt-0')}>
          {footer}
        </CardFooter>
      )}
    </Card>
  );

  return CardComponent;
};

// Specialized card variants
export const StatsCard: React.FC<{
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
  className?: string;
}> = ({ title, value, change, trend, icon: Icon, className }) => (
  <EnhancedCard
    variant="elevated"
    size="default"
    className={className}
    interactive
  >
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <p className="text-responsive-sm font-medium text-muted-foreground">
          {title}
        </p>
        <p className="text-responsive-2xl font-bold text-foreground">
          {value}
        </p>
        {change && (
          <p className={cn(
            'text-responsive-xs',
            trend === 'up' && 'text-success',
            trend === 'down' && 'text-error',
            trend === 'neutral' && 'text-muted-foreground'
          )}>
            {change}
          </p>
        )}
      </div>
      {Icon && (
        <div className="p-3 bg-primary/10 rounded-lg">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      )}
    </div>
  </EnhancedCard>
);

export const ActionCard: React.FC<{
  title: string;
  description: string;
  actionText: string;
  onAction: () => void;
  icon?: LucideIcon;
  variant?: 'default' | 'primary' | 'success' | 'warning';
  className?: string;
}> = ({ title, description, actionText, onAction, icon: Icon, variant = 'default', className }) => (
  <EnhancedCard
    title={title}
    description={description}
    icon={Icon}
    variant={variant === 'primary' ? 'gradient' : 'default'}
    className={className}
    footer={
      <Button 
        onClick={onAction}
        variant={variant === 'default' ? 'default' : 'secondary'}
        className="w-full"
      >
        {actionText}
      </Button>
    }
  />
);