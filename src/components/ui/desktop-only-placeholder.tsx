import React from 'react';
import { Monitor } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DesktopOnlyPlaceholderProps {
  title: string;
  description?: string;
  className?: string;
}

export const DesktopOnlyPlaceholder: React.FC<DesktopOnlyPlaceholderProps> = ({
  title,
  description = "Esta ferramenta foi otimizada para a melhor experiência no desktop.",
  className = ""
}) => {
  return (
    <Card className={`${className} border-dashed border-2 border-muted-foreground/30`}>
      <CardHeader className="text-center pb-4">
        <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Monitor className="h-8 w-8 text-muted-foreground" />
        </div>
        <CardTitle className="text-lg text-muted-foreground">{title}</CardTitle>
        <Badge variant="secondary" className="mx-auto">
          Desktop Otimizado
        </Badge>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Acesse esta funcionalidade em um computador para a melhor experiência.
        </p>
      </CardContent>
    </Card>
  );
};