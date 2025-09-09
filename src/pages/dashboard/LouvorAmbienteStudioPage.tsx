import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Volume2, 
  Mic, 
  Music, 
  Palette, 
  Lightbulb, 
  Camera, 
  Radio,
  Settings,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Heart,
  Zap,
  Waves,
  Sun,
  Users
} from 'lucide-react';

const LouvorAmbienteStudioPage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([75]);
  const [lighting, setLighting] = useState([80]);
  const [ambienceMode, setAmbienceMode] = useState('worship');

  const ambienceModes = [
    { id: 'worship', name: 'Louvor', icon: Heart, color: 'bg-blue-500' },
    { id: 'prayer', name: 'Oração', icon: Sun, color: 'bg-purple-500' },
    { id: 'celebration', name: 'Celebração', icon: Zap, color: 'bg-yellow-500' },
    { id: 'meditation', name: 'Meditação', icon: Waves, color: 'bg-green-500' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Studio de Louvor & Ambiente</h1>
            <p className="text-muted-foreground">
              Controle completo do ambiente sonoro, visual e atmosférico dos cultos
            </p>
          </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
          <Button>
            <Radio className="h-4 w-4 mr-2" />
            Transmissão Ao Vivo
          </Button>
        </div>
        </div>

      <Tabs defaultValue="live-control" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="live-control" className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Controle Live
          </TabsTrigger>
          <TabsTrigger value="ambience" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Ambientes
          </TabsTrigger>
          <TabsTrigger value="lighting" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Iluminação
          </TabsTrigger>
          <TabsTrigger value="streaming" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Transmissão
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            Biblioteca
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live-control" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Audio Control */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Controle de Áudio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" size="lg">
                      <SkipBack className="h-6 w-6" />
                    </Button>
                    <Button 
                      size="lg" 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="px-8"
                    >
                      {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </Button>
                    <Button variant="outline" size="lg">
                      <SkipForward className="h-6 w-6" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="font-semibold">Quão Lindo Este Nome É</p>
                    <p className="text-sm text-muted-foreground">Hillsong Worship</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Volume Geral</label>
                    <Slider
                      value={volume}
                      onValueChange={setVolume}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">{volume[0]}%</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Microfones</label>
                      <Slider defaultValue={[85]} max={100} step={1} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Instrumentos</label>
                      <Slider defaultValue={[70]} max={100} step={1} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Ambience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Ambientes Rápidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {ambienceModes.map((mode) => (
                    <Button
                      key={mode.id}
                      variant={ambienceMode === mode.id ? "default" : "outline"}
                      className="h-20 flex-col"
                      onClick={() => setAmbienceMode(mode.id)}
                    >
                      <mode.icon className="h-6 w-6 mb-2" />
                      {mode.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Radio className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="font-semibold">Live</p>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Transmitindo
                </Badge>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <p className="font-semibold">Viewers</p>
                <p className="text-2xl font-bold">247</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Volume2 className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <p className="font-semibold">Audio Level</p>
                <p className="text-2xl font-bold">{volume[0]}%</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Lightbulb className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <p className="font-semibold">Lighting</p>
                <p className="text-2xl font-bold">{lighting[0]}%</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ambience" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {ambienceModes.map((mode) => (
              <Card key={mode.id} className="hover:shadow-lg transition-all cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${mode.color}`}>
                      <mode.icon className="h-5 w-5 text-white" />
                    </div>
                    {mode.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Configuração pré-definida para momentos de {mode.name.toLowerCase()}
                  </p>
                  <Button className="w-full">Ativar Ambiente</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="lighting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Controle de Iluminação</CardTitle>
              <CardDescription>
                Ajuste a iluminação para criar a atmosfera perfeita
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Intensidade Geral</label>
                    <Slider
                      value={lighting}
                      onValueChange={setLighting}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Luzes do Palco</label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Luzes da Plateia</label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Efeitos Especiais</label>
                      <Switch />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Presets de Iluminação</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      Louvor Intimista
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Adoração Intensa
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Pregação
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Entrada/Saída
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="streaming" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Transmissão Ao Vivo
              </CardTitle>
              <CardDescription>
                Gerencie a transmissão online dos cultos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Preview da Transmissão</p>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1">Iniciar Live</Button>
                    <Button variant="outline">Testar</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Configurações de Stream</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">YouTube Live</label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Facebook Live</label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Site da Igreja</label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Qualidade</h4>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm">720p HD</Button>
                      <Button variant="outline" size="sm">1080p Full HD</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Biblioteca de Recursos</CardTitle>
              <CardDescription>
                Acesse músicas, backing tracks e recursos de áudio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  'Quão Lindo Este Nome É',
                  'Reckless Love',
                  'Way Maker',
                  'Goodness of God',
                  'Great Are You Lord',
                  'Oceans'
                ].map((song, index) => (
                  <Card key={index} className="hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Button size="sm" variant="outline">
                          <Play className="h-4 w-4" />
                        </Button>
                        <div>
                          <p className="font-medium text-sm">{song}</p>
                          <p className="text-xs text-muted-foreground">Hillsong Worship</p>
      </div>
      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </AppLayout>
  );
};

export default LouvorAmbienteStudioPage;