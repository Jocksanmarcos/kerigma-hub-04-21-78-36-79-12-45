import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { 
  Camera, 
  Video, 
  Image as ImageIcon, 
  Play, 
  Pause, 
  Search, 
  Filter, 
  Grid, 
  List,
  Download,
  Share2,
  Heart,
  Eye,
  Calendar,
  MapPin,
  Users,
  Music
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MediaItem {
  id: string;
  titulo: string;
  descricao?: string;
  url_arquivo: string;
  url_thumbnail?: string;
  tipo: 'foto' | 'video' | 'audio';
  categoria: string;
  data_evento?: string;
  local_evento?: string;
  tags?: string[];
  destaque: boolean;
  views?: number;
  likes?: number;
  tamanho_arquivo?: number;
  duracao?: number; // Para vídeos/áudios em segundos
}

interface EnhancedMediaGalleryProps {
  showUpload?: boolean;
  categories?: string[];
  onItemSelect?: (item: MediaItem) => void;
  maxItems?: number;
  viewMode?: 'grid' | 'list';
}

const EnhancedMediaGallery: React.FC<EnhancedMediaGalleryProps> = ({
  showUpload = true,
  categories = ['todas', 'cultos', 'celulas', 'eventos', 'musicas'],
  onItemSelect,
  maxItems = 50,
  viewMode: initialViewMode = 'grid'
}) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadMediaItems();
  }, [selectedCategory, maxItems]);

  const loadMediaItems = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('galeria_fotos')
        .select('*')
        .order('destaque', { ascending: false })
        .order('data_evento', { ascending: false });

      if (selectedCategory !== 'todas') {
        query = query.eq('categoria', selectedCategory);
      }

      if (maxItems > 0) {
        query = query.limit(maxItems);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transformar dados para o formato MediaItem
      const formattedItems: MediaItem[] = (data || []).map(item => ({
        id: item.id,
        titulo: item.titulo,
        descricao: item.descricao,
        url_arquivo: item.url_imagem,
        url_thumbnail: item.url_thumbnail || item.url_imagem,
        tipo: 'foto' as const,
        categoria: item.categoria,
        data_evento: item.data_evento,
        destaque: item.destaque,
        views: Math.floor(Math.random() * 1000) + 50, // Simulado
        likes: Math.floor(Math.random() * 100) + 10, // Simulado
        tags: [] // Initialize as empty array since it might not exist in DB
      }));

      setMediaItems(formattedItems);
    } catch (error: any) {
      console.error('Erro ao carregar mídia:', error);
      toast({
        title: "Erro ao carregar galeria",
        description: "Usando dados de exemplo...",
        variant: "destructive"
      });

      // Dados de exemplo
      setMediaItems([
        {
          id: '1',
          titulo: 'Culto de Celebração - Janeiro 2024',
          descricao: 'Momentos especiais do nosso culto dominical',
          url_arquivo: '/placeholder.svg',
          url_thumbnail: '/placeholder.svg',
          tipo: 'foto',
          categoria: 'cultos',
          data_evento: '2024-01-14',
          local_evento: 'Templo Principal',
          destaque: true,
          views: 245,
          likes: 38,
          tags: ['culto', 'adoracao', 'louvor']
        },
        {
          id: '2',
          titulo: 'Música de Abertura',
          descricao: 'Louvor que abriu o culto',
          url_arquivo: '/placeholder.svg',
          tipo: 'audio',
          categoria: 'musicas',
          data_evento: '2024-01-14',
          destaque: false,
          views: 123,
          likes: 19,
          duracao: 245, // 4min 5seg
          tags: ['louvor', 'musica', 'adoracao']
        },
        {
          id: '3',
          titulo: 'Retiro de Jovens 2024',
          descricao: 'Vídeo resumo do retiro',
          url_arquivo: '/placeholder.svg',
          url_thumbnail: '/placeholder.svg',
          tipo: 'video',
          categoria: 'eventos',
          data_evento: '2024-01-05',
          local_evento: 'Fazenda Esperança',
          destaque: true,
          views: 678,
          likes: 84,
          duracao: 180, // 3min
          tags: ['jovens', 'retiro', 'testemunhos']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = mediaItems.filter(item => {
    const matchesSearch = item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'todas' || item.categoria === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const togglePlay = (itemId: string) => {
    setIsPlaying(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const MediaCard: React.FC<{ item: MediaItem; index: number }> = ({ item, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group"
    >
      <Dialog>
        <DialogTrigger asChild>
          <Card className="overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary/30">
            <div className="relative aspect-video overflow-hidden">
              {item.tipo === 'foto' && (
                <img
                  src={item.url_thumbnail || item.url_arquivo}
                  alt={item.titulo}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
              
              {item.tipo === 'video' && (
                <div className="relative w-full h-full bg-black/20 flex items-center justify-center">
                  <img
                    src={item.url_thumbnail || '/placeholder.svg'}
                    alt={item.titulo}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="rounded-full w-16 h-16 bg-white/90 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlay(item.id);
                      }}
                    >
                      {isPlaying[item.id] ? (
                        <Pause className="h-6 w-6 text-primary" />
                      ) : (
                        <Play className="h-6 w-6 text-primary ml-1" />
                      )}
                    </Button>
                  </div>
                  {item.duracao && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(item.duracao)}
                    </div>
                  )}
                </div>
              )}
              
              {item.tipo === 'audio' && (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <div className="text-center">
                    <Music className="h-12 w-12 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">{item.titulo}</p>
                    {item.duracao && (
                      <p className="text-xs text-muted-foreground">
                        {formatDuration(item.duracao)}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute bottom-3 right-3 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay(item.id);
                    }}
                  >
                    {isPlaying[item.id] ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4 ml-0.5" />
                    )}
                  </Button>
                </div>
              )}

              {/* Overlay com informações */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Badges e indicadores */}
              <div className="absolute top-3 left-3 flex gap-2">
                {item.destaque && (
                  <Badge className="bg-primary/90 text-primary-foreground">
                    Destaque
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-black/50 text-white border-0">
                  {item.tipo === 'foto' ? (
                    <Camera className="h-3 w-3 mr-1" />
                  ) : item.tipo === 'video' ? (
                    <Video className="h-3 w-3 mr-1" />
                  ) : (
                    <Music className="h-3 w-3 mr-1" />
                  )}
                  {item.tipo}
                </Badge>
              </div>

              {/* Stats no hover */}
              <div className="absolute bottom-3 left-3 right-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-white font-semibold text-sm mb-1 truncate">{item.titulo}</h3>
                <div className="flex items-center justify-between text-white/80 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {item.views}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {item.likes}
                    </div>
                  </div>
                  {item.data_evento && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.data_evento).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {viewMode === 'list' && (
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-1">{item.titulo}</h4>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                      {item.descricao || "Conteúdo da galeria"}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {item.data_evento && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(item.data_evento).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                      {item.local_evento && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.local_evento}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </DialogTrigger>
        
        <DialogContent className="max-w-6xl max-h-[90vh] p-0">
          <div className="relative">
            {item.tipo === 'foto' && (
              <img
                src={item.url_arquivo}
                alt={item.titulo}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            )}
            
            {item.tipo === 'video' && (
              <video
                src={item.url_arquivo}
                controls
                className="w-full h-auto max-h-[80vh]"
                poster={item.url_thumbnail}
              />
            )}
            
            {item.tipo === 'audio' && (
              <div className="p-12 bg-gradient-to-br from-primary/10 to-accent/10 text-center">
                <Music className="h-24 w-24 text-primary mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4">{item.titulo}</h3>
                <audio src={item.url_arquivo} controls className="w-full max-w-md mx-auto" />
              </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <div className="flex items-start justify-between text-white">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{item.titulo}</h3>
                  {item.descricao && (
                    <p className="text-white/80 mb-3">{item.descricao}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    {item.data_evento && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(item.data_evento).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                    {item.local_evento && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {item.local_evento}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {item.views} visualizações
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button size="sm" variant="secondary">
                    <Heart className="h-4 w-4 mr-1" />
                    {item.likes}
                  </Button>
                  <Button size="sm" variant="secondary">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="secondary">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header com Controles */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Biblioteca de Mídia
            </span>
          </h2>
          <p className="text-muted-foreground">
            {filteredItems.length} itens encontrados
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar na galeria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          {/* Modo de visualização */}
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              onClick={() => setViewMode('grid')}
              className="rounded-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              onClick={() => setViewMode('list')}
              className="rounded-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filtros por Categoria */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            size="sm"
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Grid/List de Mídia */}
      {loading ? (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-video bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          {filteredItems.map((item, index) => (
            <MediaCard key={item.id} item={item} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum item encontrado</h3>
            <p className="text-muted-foreground">
              Não há itens que correspondam aos seus critérios de busca.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedMediaGallery;