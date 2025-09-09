import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Clock, List } from 'lucide-react';

export const AgendaSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      {/* Header skeleton */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled>
              Hoje
            </Button>
          </div>
          
          <Skeleton className="h-6 w-48" />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            <Calendar className="h-4 w-4 mr-1" />
            Mês
          </Button>
          <Button variant="outline" size="sm" disabled>
            <Clock className="h-4 w-4 mr-1" />
            Semana
          </Button>
          <Button variant="outline" size="sm" disabled>
            <List className="h-4 w-4 mr-1" />
            Dia
          </Button>
        </div>
      </div>

      {/* Calendar skeleton */}
      <Card className="flex-1 m-4 min-h-0">
        <div className="p-4 h-full min-h-[600px]">
          {/* Calendar header days */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
              <div key={index} className="p-2 text-center font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid skeleton */}
          <div className="grid grid-cols-7 gap-1 h-[500px]">
            {Array.from({ length: 35 }, (_, index) => (
              <div key={index} className="border border-border p-2 relative">
                <Skeleton className="h-4 w-6 mb-2" />
                {/* Random event skeletons */}
                {Math.random() > 0.7 && (
                  <Skeleton className="h-6 w-full mb-1 rounded" />
                )}
                {Math.random() > 0.8 && (
                  <Skeleton className="h-6 w-3/4 rounded" />
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};