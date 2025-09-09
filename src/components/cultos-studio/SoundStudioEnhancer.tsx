import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Volume2, Play, Pause, Save, Settings, Music, Waves, Plus, Share2, CloudRain, Wind, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PresetAmbiente {
  id: string;
  nome: string;
  descricao: string | null;
  configuracao_json: any;
  tipo_preset: string;
  criado_por: string | null;
  publico: boolean;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

interface LayerConfig {
  id: string;
  nome: string;
  volume: number;
  loop: boolean;
  fadeIn: number;
  fadeOut: number;
  url?: string;
  tipo: 'ambiente' | 'musical' | 'efeito';
}

const SoundStudioEnhancer: React.FC = () => {
  const { toast } = useToast();
  const [presets, setPresets] = useState<PresetAmbiente[]>([]);
  const [presetAtivo, setPresetAtivo] = useState<PresetAmbiente | null>(null);
  const [layers, setLayers] = useState<LayerConfig[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volumeMaster, setVolumeMaster] = useState(0.7);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Form state for new preset
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    tipo_preset: "geral",
    publico: false,
    tags: ""
  });

  useEffect(() => {
    loadPresets();
    initAudioContext();
    loadDefaultLayers();
  }, []);

  const initAudioContext = () => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
      gainNodeRef.current.gain.value = volumeMaster;
    } catch (error) {
      console.error("Erro ao inicializar AudioContext:", error);
    }
  };

  const loadPresets = async () => {
    try {
      const { data, error } = await supabase
        .from("louvor_presets_ambiente")
        .select("*")
        .order("nome");

      if (error) throw error;
      setPresets((data as any) || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar presets",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const loadDefaultLayers = () => {
    const defaultLayers: LayerConfig[] = [
      {
        id: "layer1",
        nome: "Chuva Suave",
        volume: 0.3,
        loop: true,
        fadeIn: 2,
        fadeOut: 2,
        tipo: "ambiente"
      },
      {
        id: "layer2", 
        nome: "Vento Leve",
        volume: 0.2,
        loop: true,
        fadeIn: 3,
        fadeOut: 3,
        tipo: "ambiente"
      },
      {
        id: "layer3",
        nome: "Piano Ambiente",
        volume: 0.4,
        loop: true,
        fadeIn: 1,
        fadeOut: 1,
        tipo: "musical"
      },
      {
        id: "layer4",
        nome: "Reverb Espacial",
        volume: 0.1,
        loop: true,
        fadeIn: 5,
        fadeOut: 5,
        tipo: "efeito"
      }
    ];
    setLayers(defaultLayers);
  };

  const handleVolumeChange = (layerId: string, volume: number) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, volume: volume / 100 } : layer
    ));
  };

  const handleMasterVolumeChange = (volume: number[]) => {
    const newVolume = volume[0] / 100;
    setVolumeMaster(newVolume);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume;
    }
  };

  const togglePlayback = () => {
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
    setIsPlaying(!isPlaying);
    
    // Simular controle de reprodução
    toast({
      title: isPlaying ? "Reprodução pausada" : "Reprodução iniciada",
      description: "Studio de ambientação " + (isPlaying ? "pausado" : "ativo")
    });
  };

  const savePreset = async () => {
    try {
      if (!formData.nome) {
        toast({
          title: "Nome obrigatório",
          description: "Informe um nome para o preset.",
          variant: "destructive"
        });
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const configuracao = {
        layers,
        volumeMaster,
        version: "1.0"
      };

      const { error } = await supabase
        .from("louvor_presets_ambiente")
        .insert({
          nome_preset: formData.nome,
          configuracao_json: configuracao,
          criado_por: userData.user.id,
          publico: formData.publico
        });

      if (error) throw error;

      toast({
        title: "Preset salvo",
        description: "Configuração de ambiente salva com sucesso."
      });

      setFormData({
        nome: "",
        descricao: "",
        tipo_preset: "geral",
        publico: false,
        tags: ""
      });
      setIsCreateDialogOpen(false);
      loadPresets();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar preset",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const loadPreset = (preset: PresetAmbiente) => {
    try {
      const config = preset.configuracao_json;
      if (config.layers) {
        setLayers(config.layers);
      }
      if (config.volumeMaster) {
        setVolumeMaster(config.volumeMaster);
        if (gainNodeRef.current) {
          gainNodeRef.current.gain.value = config.volumeMaster;
        }
      }
      setPresetAtivo(preset);
      
      toast({
        title: "Preset carregado",
        description: `Configuração "${preset.nome}" aplicada com sucesso.`
      });
    } catch (error) {
      toast({
        title: "Erro ao carregar preset",
        description: "Formato de configuração inválido.",
        variant: "destructive"
      });
    }
  };

  const getLayerIcon = (tipo: string) => {
    switch (tipo) {
      case "ambiente":
        return <CloudRain className="h-4 w-4" />;
      case "musical":
        return <Music className="h-4 w-4" />;
      case "efeito":
        return <Zap className="h-4 w-4" />;
      default:
        return <Waves className="h-4 w-4" />;
    }
  };

  const getPresetTypeColor = (tipo: string) => {
    switch (tipo) {
      case "entrada":
        return "bg-blue-100 text-blue-800";
      case "adoracao":
        return "bg-purple-100 text-purple-800";
      case "ofertorio":
        return "bg-green-100 text-green-800";
      case "saida":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header do Studio */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500">
              <Volume2 className="h-6 w-6 text-white" />
            </div>
            Studio de Ambientação Sonora
          </CardTitle>
          <CardDescription>
            Crie ambientes sonoros imersivos com controle de múltiplas camadas
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controles do Player */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Player Multi-Camadas</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant={isPlaying ? "secondary" : "default"}
                    size="sm"
                    onClick={togglePlayback}
                    className="flex items-center gap-2"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isPlaying ? "Pausar" : "Reproduzir"}
                  </Button>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Save className="h-4 w-4 mr-1" />
                        Salvar Preset
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Salvar Configuração</DialogTitle>
                        <DialogDescription>
                          Salve esta configuração de ambiente para reutilizar
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="nome">Nome do Preset</Label>
                          <Input
                            id="nome"
                            value={formData.nome}
                            onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                            placeholder="Ex: Entrada Suave"
                          />
                        </div>

                        <div>
                          <Label htmlFor="descricao">Descrição</Label>
                          <Input
                            id="descricao"
                            value={formData.descricao}
                            onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                            placeholder="Descreva o ambiente criado"
                          />
                        </div>

                        <div>
                          <Label htmlFor="tipo">Tipo de Preset</Label>
                          <Select value={formData.tipo_preset} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_preset: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="geral">Geral</SelectItem>
                              <SelectItem value="entrada">Entrada</SelectItem>
                              <SelectItem value="adoracao">Adoração</SelectItem>
                              <SelectItem value="ofertorio">Ofertório</SelectItem>
                              <SelectItem value="saida">Saída</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                          <Input
                            id="tags"
                            value={formData.tags}
                            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                            placeholder="Ex: suave, relaxante, chuva"
                          />
                        </div>

                        <Button onClick={savePreset} className="w-full">
                          Salvar Preset
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Controle Master */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-lg font-semibold">Volume Master</Label>
                  <span className="text-sm font-mono">{Math.round(volumeMaster * 100)}%</span>
                </div>
                <Slider
                  value={[volumeMaster * 100]}
                  onValueChange={handleMasterVolumeChange}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Layers */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Camadas de Áudio</h3>
                {layers.map((layer) => (
                  <div key={layer.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getLayerIcon(layer.tipo)}
                        <span className="font-medium">{layer.nome}</span>
                        <Badge variant="outline" className="text-xs">
                          {layer.tipo}
                        </Badge>
                      </div>
                      <span className="text-sm font-mono">{Math.round(layer.volume * 100)}%</span>
                    </div>
                    <Slider
                      value={[layer.volume * 100]}
                      onValueChange={(value) => handleVolumeChange(layer.id, value[0])}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                      <div>Fade In: {layer.fadeIn}s</div>
                      <div>Fade Out: {layer.fadeOut}s</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Biblioteca de Presets */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Presets Salvos</CardTitle>
              <CardDescription>
                Configurações de ambiente previamente criadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {presets.length === 0 ? (
                  <div className="text-center py-8">
                    <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum preset salvo</h3>
                    <p className="text-muted-foreground text-sm">
                      Configure uma ambientação e salve como preset para reutilizar
                    </p>
                  </div>
                ) : (
                  presets.map((preset) => (
                    <div
                      key={preset.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                        presetAtivo?.id === preset.id ? "border-primary bg-primary/5" : ""
                      }`}
                      onClick={() => loadPreset(preset)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{preset.nome}</h4>
                        <Badge className={getPresetTypeColor(preset.tipo_preset)}>
                          {preset.tipo_preset}
                        </Badge>
                      </div>
                      {preset.descricao && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {preset.descricao}
                        </p>
                      )}
                      {preset.tags && preset.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {preset.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                              {tag}
                            </Badge>
                          ))}
                          {preset.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              +{preset.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SoundStudioEnhancer;