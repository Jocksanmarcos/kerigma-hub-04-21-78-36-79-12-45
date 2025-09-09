import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Calendar } from 'lucide-react';

interface Album {
  id: string;
  nome: string;
  descricao?: string;
  capa_url?: string;
  categoria: string;
  data_evento?: string;
  total_midias?: number;
}

interface AlbumsGridProps {
  albums: Album[];
  onAlbumClick: (albumId: string) => void;
  isLoading?: boolean;
}

export const AlbumsGrid: React.FC<AlbumsGridProps> = ({ 
  albums, 
  onAlbumClick, 
  isLoading = false 
}) => {
  const getCategoryColor = (categoria: string) => {
    const colors: Record<string, string> = {
      'cultos': 'bg-primary/10 text-primary border-primary/20',
      'celulas': 'bg-accent/10 text-accent border-accent/20',
      'eventos': 'bg-secondary/10 text-secondary border-secondary/20',
      'ministerio': 'bg-green-100 text-green-700 border-green-200',
      'geral': 'bg-muted text-muted-foreground border-border'
    };
    return colors[categoria] || colors['geral'];
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="aspect-video bg-muted animate-pulse" />
            <CardContent className="p-6">
              <div className="h-4 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {albums.map((album, index) => (
        <motion.div
          key={album.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card 
            className="overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30"
            onClick={() => onAlbumClick(album.id)}
          >
            <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-muted to-muted/50">
              {album.capa_url ? (
                <img
                  src={album.capa_url}
                  alt={album.nome}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                  <Camera className="h-12 w-12 text-primary/60" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute top-3 left-3">
                <Badge className={getCategoryColor(album.categoria)}>
                  {album.categoria}
                </Badge>
              </div>
              {album.total_midias && (
                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-white text-sm font-medium">
                    {album.total_midias} {album.total_midias === 1 ? 'item' : 'itens'}
                  </span>
                </div>
              )}
            </div>
            
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                {album.nome}
              </h3>
              {album.descricao && (
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                  {album.descricao}
                </p>
              )}
              {album.data_evento && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(album.data_evento).toLocaleDateString('pt-BR')}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};