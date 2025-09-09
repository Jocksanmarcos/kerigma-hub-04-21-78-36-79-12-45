import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Download, Share2 } from 'lucide-react';

interface MediaItem {
  id: string;
  titulo: string;
  descricao?: string;
  arquivo_url: string;
  thumbnail_url?: string;
  tipo: 'imagem' | 'video' | 'audio';
  tags?: string[];
}

interface Album {
  id: string;
  nome: string;
  descricao?: string;
  categoria: string;
  data_evento?: string;
}

interface AlbumDetailViewProps {
  album: Album;
  mediaItems: MediaItem[];
  onBack: () => void;
  onMediaClick: (media: MediaItem) => void;
  isLoading?: boolean;
}

export const AlbumDetailView: React.FC<AlbumDetailViewProps> = ({
  album,
  mediaItems,
  onBack,
  onMediaClick,
  isLoading = false
}) => {
  const getMediaIcon = (tipo: string) => {
    switch (tipo) {
      case 'video':
        return <Play className="h-6 w-6" />;
      case 'audio':
        return <Play className="h-6 w-6" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Álbuns
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{album.nome}</h1>
            {album.descricao && (
              <p className="text-muted-foreground mt-1">{album.descricao}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="aspect-square bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaItems.map((media, index) => (
            <motion.div
              key={media.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card 
                className="overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-300"
                onClick={() => onMediaClick(media)}
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={media.thumbnail_url || media.arquivo_url}
                    alt={media.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Media Type Overlay */}
                  {media.tipo !== 'imagem' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                        {getMediaIcon(media.tipo)}
                      </div>
                    </div>
                  )}
                  
                  {/* Tags */}
                  {media.tags && media.tags.length > 0 && (
                    <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                      {media.tags.slice(0, 2).map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-black/70 text-white text-xs px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                    {media.titulo}
                  </h4>
                  {media.descricao && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {media.descricao}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {mediaItems.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Este álbum ainda não possui mídias.
          </p>
        </div>
      )}
    </div>
  );
};