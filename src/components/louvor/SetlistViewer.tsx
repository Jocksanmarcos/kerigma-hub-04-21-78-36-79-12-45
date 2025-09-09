import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Music, Play, FileText, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SetlistViewerProps {
  setlist: string[]; // Array de IDs das músicas
}

interface Musica {
  id: string;
  titulo: string;
  artista: string;
  tom: string;
  bpm: number;
  tags: string[];
  letra?: string;
  cifra?: string;
  link_referencia?: string;
}

export const SetlistViewer: React.FC<SetlistViewerProps> = ({ setlist }) => {
  const { data: musicas, isLoading } = useQuery({
    queryKey: ['setlist-musicas', setlist],
    queryFn: async () => {
      if (!setlist || setlist.length === 0) return [];
      
      const { data, error } = await supabase
        .from('louvor_repertorio')
        .select('*')
        .in('id', setlist)
        .eq('ativo', true);
      
      if (error) throw error;
      
      // Reordenar baseado na ordem do setlist
      const musicasOrdenadas = setlist
        .map(id => data?.find(musica => musica.id === id))
        .filter(Boolean) as Musica[];
      
      return musicasOrdenadas;
    },
    enabled: !!setlist && setlist.length > 0
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!setlist || setlist.length === 0) {
    return (
      <div className="text-center py-8">
        <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Nenhuma música selecionada para este evento</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {musicas?.map((musica, index) => (
        <Card key={musica.id} className="p-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <h4 className="font-medium">{musica.titulo}</h4>
              </div>
              
              {musica.artista && (
                <p className="text-sm text-muted-foreground mb-2">
                  por {musica.artista}
                </p>
              )}
              
              <div className="flex items-center gap-2 mb-2">
                {musica.tom && (
                  <Badge variant="outline" className="text-xs">
                    {musica.tom}
                  </Badge>
                )}
                {musica.bpm && (
                  <Badge variant="secondary" className="text-xs">
                    {musica.bpm} BPM
                  </Badge>
                )}
              </div>
              
              {musica.tags && musica.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {musica.tags.slice(0, 3).map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {musica.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{musica.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {musica.link_referencia && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(musica.link_referencia, '_blank')}
                  title="Ouvir música"
                >
                  <Play className="h-4 w-4" />
                </Button>
              )}
              {musica.letra && (
                <Button
                  variant="ghost"
                  size="sm"
                  title="Ver letra"
                >
                  <FileText className="h-4 w-4" />
                </Button>
              )}
              {musica.cifra && (
                <Button
                  variant="ghost"
                  size="sm"
                  title="Ver cifra"
                >
                  <Music className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
      
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Total: {musicas?.length || 0} músicas</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Exportar Setlist
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};