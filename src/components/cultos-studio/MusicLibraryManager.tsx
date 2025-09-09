import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Music, Plus, Search, Play, Download } from "lucide-react";

interface MusicaLouvor {
  id: string;
  titulo: string;
  artista: string | null;
  compositor: string | null;
  categoria: string;
  bpm: number | null;
  tonalidade: string | null;
  letra: string | null;
  link_audio_youtube: string | null;
  link_cifra_pdf: string | null;
  observacoes: string | null;
  tags: string | null;
  ativa: boolean;
  created_at: string;
  created_by: string | null;
  updated_at: string;
}

const MusicLibraryManager: React.FC = () => {
  const { toast } = useToast();
  const [musicas, setMusicas] = useState<MusicaLouvor[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    titulo: "",
    artista: "",
    compositor: "",
    categoria: "adoracao",
    bpm: "",
    tonalidade: "",
    letra: "",
    link_audio_youtube: "",
    link_cifra_pdf: "",
    observacoes: "",
    tags: ""
  });

  useEffect(() => {
    loadMusicas();
  }, []);

  const loadMusicas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("louvor_musicas")
        .select("*")
        .eq("ativa", true)
        .order("titulo");

      if (error) throw error;
      setMusicas(data as any || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar músicas",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const musicasFiltradas = useMemo(() => {
    let filtered = musicas;

    if (filtroCategoria !== "todas") {
      filtered = filtered.filter(m => m.categoria === filtroCategoria);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.titulo.toLowerCase().includes(query) ||
        m.artista?.toLowerCase().includes(query) ||
        m.tags?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [musicas, filtroCategoria, searchQuery]);

  const handleAddMusica = async () => {
    try {
      if (!formData.titulo) {
        toast({
          title: "Título obrigatório",
          description: "O título da música é obrigatório.",
          variant: "destructive"
        });
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { error } = await supabase
        .from("louvor_musicas")
        .insert({
          titulo: formData.titulo,
          artista: formData.artista || null,
          compositor: formData.compositor || null,
          categoria: formData.categoria,
          bpm: formData.bpm ? parseInt(formData.bpm) : null,
          tonalidade: formData.tonalidade || null,
          letra: formData.letra || null,
          link_audio_youtube: formData.link_audio_youtube || null,
          link_cifra_pdf: formData.link_cifra_pdf || null,
          observacoes: formData.observacoes || null,
          tags: formData.tags || null,
          created_by: userData.user.id
        } as any);

      if (error) throw error;

      toast({
        title: "Música adicionada",
        description: "A música foi adicionada à biblioteca com sucesso."
      });

      setFormData({
        titulo: "",
        artista: "",
        compositor: "",
        categoria: "adoracao",
        bpm: "",
        tonalidade: "",
        letra: "",
        link_audio_youtube: "",
        link_cifra_pdf: "",
        observacoes: "",
        tags: ""
      });
      setIsAddDialogOpen(false);
      loadMusicas();
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar música",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case "adoracao": return "bg-purple-100 text-purple-800";
      case "louvor": return "bg-blue-100 text-blue-800";
      case "entrega": return "bg-green-100 text-green-800";
      case "comunhao": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Biblioteca Musical Completa
          </CardTitle>
          <CardDescription>
            Gerencie o repertório musical do ministério de louvor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, artista ou tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as categorias</SelectItem>
                <SelectItem value="adoracao">Adoração</SelectItem>
                <SelectItem value="louvor">Louvor</SelectItem>
                <SelectItem value="entrega">Entrega</SelectItem>
                <SelectItem value="comunhao">Comunhão</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Música
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Música</DialogTitle>
                  <DialogDescription>
                    Adicione uma nova música ao repertório do ministério
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="titulo">Título *</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                      placeholder="Nome da música"
                    />
                  </div>

                  <div>
                    <Label htmlFor="artista">Artista</Label>
                    <Input
                      id="artista"
                      value={formData.artista}
                      onChange={(e) => setFormData(prev => ({ ...prev, artista: e.target.value }))}
                      placeholder="Nome do artista"
                    />
                  </div>

                  <div>
                    <Label htmlFor="compositor">Compositor</Label>
                    <Input
                      id="compositor"
                      value={formData.compositor}
                      onChange={(e) => setFormData(prev => ({ ...prev, compositor: e.target.value }))}
                      placeholder="Nome do compositor"
                    />
                  </div>

                  <div>
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select value={formData.categoria} onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="adoracao">Adoração</SelectItem>
                        <SelectItem value="louvor">Louvor</SelectItem>
                        <SelectItem value="entrega">Entrega</SelectItem>
                        <SelectItem value="comunhao">Comunhão</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tonalidade">Tonalidade</Label>
                    <Input
                      id="tonalidade"
                      value={formData.tonalidade}
                      onChange={(e) => setFormData(prev => ({ ...prev, tonalidade: e.target.value }))}
                      placeholder="Ex: G, Am, C#"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bpm">Tempo (BPM)</Label>
                    <Input
                      id="bpm"
                      type="number"
                      value={formData.bpm}
                      onChange={(e) => setFormData(prev => ({ ...prev, bpm: e.target.value }))}
                      placeholder="Ex: 120"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="Ex: alegre, rápida, dança"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="link_audio_youtube">Link do YouTube</Label>
                    <Input
                      id="link_audio_youtube"
                      value={formData.link_audio_youtube}
                      onChange={(e) => setFormData(prev => ({ ...prev, link_audio_youtube: e.target.value }))}
                      placeholder="Link do YouTube"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="link_cifra_pdf">Link da Cifra/PDF</Label>
                    <Input
                      id="link_cifra_pdf"
                      value={formData.link_cifra_pdf}
                      onChange={(e) => setFormData(prev => ({ ...prev, link_cifra_pdf: e.target.value }))}
                      placeholder="Link da cifra ou partitura"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="letra">Letra</Label>
                    <Textarea
                      id="letra"
                      value={formData.letra}
                      onChange={(e) => setFormData(prev => ({ ...prev, letra: e.target.value }))}
                      placeholder="Cole aqui a letra da música..."
                      rows={4}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                      placeholder="Observações adicionais..."
                      rows={2}
                    />
                  </div>
                </div>

                <Button onClick={handleAddMusica} className="w-full mt-4">
                  Adicionar Música
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Grid de músicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8">Carregando músicas...</div>
        ) : musicasFiltradas.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma música encontrada</h3>
            <p className="text-muted-foreground">Tente ajustar os filtros ou adicione uma nova música</p>
          </div>
        ) : (
          musicasFiltradas.map((musica) => (
            <Card key={musica.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg line-clamp-1">{musica.titulo}</CardTitle>
                    <CardDescription>{musica.artista || "Artista não informado"}</CardDescription>
                  </div>
                  <Badge className={getCategoriaColor(musica.categoria)}>
                    {musica.categoria}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  {musica.tonalidade && (
                    <div>Tom: <span className="font-medium">{musica.tonalidade}</span></div>
                  )}
                  {musica.bpm && (
                    <div>BPM: <span className="font-medium">{musica.bpm}</span></div>
                  )}
                  {musica.compositor && (
                    <div className="col-span-2">Compositor: <span className="font-medium">{musica.compositor}</span></div>
                  )}
                </div>

                {musica.tags && (
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">
                      {musica.tags}
                    </Badge>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {musica.link_audio_youtube && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={musica.link_audio_youtube} target="_blank" rel="noopener noreferrer">
                        <Play className="h-4 w-4 mr-1" />
                        Ouvir
                      </a>
                    </Button>
                  )}
                  {musica.link_cifra_pdf && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={musica.link_cifra_pdf} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-1" />
                        Cifra
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MusicLibraryManager;