import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Download, Share2, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MediaItem {
  id: string;
  titulo: string;
  descricao?: string;
  arquivo_url: string;
  thumbnail_url?: string;
  tipo: 'imagem' | 'video' | 'audio';
  tags?: string[];
}

interface MediaViewerProps {
  media: MediaItem;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({
  media,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false
}) => {
  const [isZoomed, setIsZoomed] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowRight':
          if (hasNext && onNext) onNext();
          break;
        case 'ArrowLeft':
          if (hasPrevious && onPrevious) onPrevious();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasNext, hasPrevious, onNext, onPrevious, onClose]);

  const renderMediaContent = () => {
    switch (media.tipo) {
      case 'video':
        return (
          <video
            src={media.arquivo_url}
            controls
            className="max-w-full max-h-full object-contain"
            autoPlay
          />
        );
      case 'audio':
        return (
          <div className="flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg p-8">
            <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-primary/20 rounded-full" />
            </div>
            <audio
              src={media.arquivo_url}
              controls
              className="w-full max-w-md"
              autoPlay
            />
          </div>
        );
      default:
        return (
          <img
            src={media.arquivo_url}
            alt={media.titulo}
            className={`max-w-full max-h-full object-contain transition-transform duration-300 ${
              isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          />
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={onClose}
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-6">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <h3 className="text-lg font-semibold">{media.titulo}</h3>
                {media.descricao && (
                  <p className="text-white/70 text-sm mt-1">{media.descricao}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {media.tipo === 'imagem' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsZoomed(!isZoomed);
                    }}
                  >
                    {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation */}
          {hasPrevious && onPrevious && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-6 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
              onClick={(e) => {
                e.stopPropagation();
                onPrevious();
              }}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}
          
          {hasNext && onNext && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-6 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}

          {/* Media Content */}
          <div 
            className="flex items-center justify-center w-full h-full p-20"
            onClick={(e) => e.stopPropagation()}
          >
            {renderMediaContent()}
          </div>

          {/* Footer with Tags */}
          {media.tags && media.tags.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-6">
              <div className="flex flex-wrap gap-2">
                {media.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};