import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, 
  Type, 
  Palette, 
  MousePointer, 
  Keyboard, 
  Volume2, 
  Users, 
  RotateCcw,
  Lightbulb,
  Heart,
  Accessibility
} from 'lucide-react';
import { useAccessibilitySettings } from '@/hooks/useAccessibilitySettings';
import { useToast } from '@/hooks/use-toast';

export const AccessibilitySettings: React.FC = () => {
  const { settings, updateSettings, resetSettings, detectUserPreferences } = useAccessibilitySettings();
  const { toast } = useToast();

  const handleAutoDetect = () => {
    detectUserPreferences();
    toast({
      title: "Configurações detectadas",
      description: "Aplicamos as melhores configurações baseadas no seu dispositivo."
    });
  };

  const handleReset = () => {
    resetSettings();
    toast({
      title: "Configurações restauradas",
      description: "Todas as configurações foram redefinidas para o padrão."
    });
  };

  const themes = [
    {
      id: 'default',
      name: 'Padrão',
      description: 'Design equilibrado para todos',
      icon: Users,
      color: 'text-blue-500'
    },
    {
      id: 'accessibility',
      name: 'Acessibilidade',
      description: 'Alto contraste, fontes grandes',
      icon: Accessibility,
      color: 'text-yellow-500'
    },
    {
      id: 'young',
      name: 'Jovem',
      description: 'Cores vibrantes e moderno',
      icon: Heart,
      color: 'text-pink-500'
    },
    {
      id: 'professional',
      name: 'Profissional',
      description: 'Elegante e sofisticado',
      icon: Lightbulb,
      color: 'text-purple-500'
    }
  ];

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold truncate">Configurações de Acessibilidade</h2>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
            Personalize a experiência de acordo com suas necessidades
          </p>
        </div>
        <div className="flex flex-col gap-2 xs:flex-row">
          <Button variant="outline" onClick={handleAutoDetect} className="gap-1.5 text-xs px-2 py-1.5 h-auto sm:px-3 sm:py-2 sm:text-sm sm:h-9">
            <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Auto-detectar</span>
            <span className="xs:hidden">Auto</span>
          </Button>
          <Button variant="outline" onClick={handleReset} className="gap-1.5 text-xs px-2 py-1.5 h-auto sm:px-3 sm:py-2 sm:text-sm sm:h-9">
            <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Restaurar</span>
            <span className="xs:hidden">Reset</span>
          </Button>
        </div>
      </div>

      {/* Current Theme Indicator */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-3 pb-3 px-3 sm:pt-4 sm:pb-4 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 min-w-0">
              {themes.find(t => t.id === settings.theme)?.icon && 
                React.createElement(themes.find(t => t.id === settings.theme)!.icon, {
                  className: `h-4 w-4 sm:h-5 sm:w-5 ${themes.find(t => t.id === settings.theme)!.color} flex-shrink-0`
                })
              }
              <span className="font-medium text-sm sm:text-base truncate">
                Tema atual: {themes.find(t => t.id === settings.theme)?.name}
              </span>
            </div>
            <Badge variant="secondary" className="text-xs w-fit self-start sm:self-center">
              {themes.find(t => t.id === settings.theme)?.description}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Mobile-first single column layout */}
      <div className="space-y-4 md:space-y-6">
        {/* Tema da Interface */}
        <Card className="w-full">
          <CardHeader className="pb-3 px-3 sm:pb-6 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Palette className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="truncate">Tema da Interface</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Escolha o estilo visual que melhor atende suas necessidades
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <div className="space-y-2 sm:space-y-3">
              {themes.map((theme) => {
                const Icon = theme.icon;
                return (
                  <button
                    key={theme.id}
                    onClick={() => updateSettings({ theme: theme.id as any })}
                    className={`w-full p-2.5 sm:p-3 rounded-lg border-2 transition-all text-left ${
                      settings.theme === theme.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <Icon className={`h-4 w-4 ${theme.color} flex-shrink-0`} />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">{theme.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {theme.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tipografia */}
        <Card className="w-full">
          <CardHeader className="pb-3 px-3 sm:pb-6 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Type className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="truncate">Tamanho do Texto</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Ajuste o tamanho da fonte para melhor legibilidade
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6 space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label htmlFor="font-size" className="text-sm">Tamanho da fonte</Label>
              <Select 
                value={settings.fontSize} 
                onValueChange={(value) => updateSettings({ fontSize: value as any })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal (16px)</SelectItem>
                  <SelectItem value="large">Grande (18px)</SelectItem>
                  <SelectItem value="extra-large">Extra Grande (22px)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="contrast" className="text-sm">Contraste</Label>
              <Select 
                value={settings.contrast} 
                onValueChange={(value) => updateSettings({ contrast: value as any })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Alto Contraste</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Interação */}
        <Card className="w-full">
          <CardHeader className="pb-3 px-3 sm:pb-6 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <MousePointer className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="truncate">Interação</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Configure como você interage com a interface
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6 space-y-3 sm:space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5 min-w-0 flex-1">
                <Label className="text-sm">Animações reduzidas</Label>
                <p className="text-xs text-muted-foreground">
                  Reduz movimentos na tela
                </p>
              </div>
              <Switch
                checked={settings.reducedMotion}
                onCheckedChange={(checked) => updateSettings({ reducedMotion: checked })}
                className="flex-shrink-0"
              />
            </div>

            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5 min-w-0 flex-1">
                <Label className="text-sm">Foco aprimorado</Label>
                <p className="text-xs text-muted-foreground">
                  Destaque visual mais forte
                </p>
              </div>
              <Switch
                checked={settings.enhancedFocus}
                onCheckedChange={(checked) => updateSettings({ enhancedFocus: checked })}
                className="flex-shrink-0"
              />
            </div>

            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5 min-w-0 flex-1">
                <Label className="text-sm">Interface simplificada</Label>
                <p className="text-xs text-muted-foreground">
                  Remove elementos decorativos
                </p>
              </div>
              <Switch
                checked={settings.simplifiedUI}
                onCheckedChange={(checked) => updateSettings({ simplifiedUI: checked })}
                className="flex-shrink-0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Navegação */}
        <Card className="w-full">
          <CardHeader className="pb-3 px-3 sm:pb-6 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Keyboard className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="truncate">Navegação</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Opções para navegação por teclado e leitores de tela
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6 space-y-3 sm:space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5 min-w-0 flex-1">
                <Label className="text-sm">Navegação por teclado</Label>
                <p className="text-xs text-muted-foreground">
                  Melhora o suporte ao Tab
                </p>
              </div>
              <Switch
                checked={settings.keyboardNavigation}
                onCheckedChange={(checked) => updateSettings({ keyboardNavigation: checked })}
                className="flex-shrink-0"
              />
            </div>

            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5 min-w-0 flex-1">
                <Label className="text-sm">Modo leitor de tela</Label>
                <p className="text-xs text-muted-foreground">
                  Otimiza para NVDA, JAWS, etc.
                </p>
              </div>
              <Switch
                checked={settings.screenReaderMode}
                onCheckedChange={(checked) => updateSettings({ screenReaderMode: checked })}
                className="flex-shrink-0"
              />
            </div>

            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5 min-w-0 flex-1">
                <Label className="text-sm">Suporte a daltonismo</Label>
                <p className="text-xs text-muted-foreground">
                  Ajusta cores para daltonismo
                </p>
              </div>
              <Switch
                checked={settings.colorBlindSupport}
                onCheckedChange={(checked) => updateSettings({ colorBlindSupport: checked })}
                className="flex-shrink-0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Audio */}
        <Card className="w-full">
          <CardHeader className="pb-3 px-3 sm:pb-6 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="truncate">Recursos de Áudio</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Configurações para feedback sonoro e leitura de tela
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5 min-w-0 flex-1">
                <Label className="text-sm">Texto para fala</Label>
                <p className="text-xs text-muted-foreground">
                  Permite que o sistema leia textos em voz alta
                </p>
              </div>
              <Switch
                checked={settings.textToSpeech}
                onCheckedChange={(checked) => updateSettings({ textToSpeech: checked })}
                className="flex-shrink-0"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};