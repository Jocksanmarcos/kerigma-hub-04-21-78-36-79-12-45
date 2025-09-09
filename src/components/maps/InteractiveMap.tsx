import React, { useEffect, useRef, useState } from 'react';
import { MapPin, ExternalLink, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface InteractiveMapProps {
  address?: string;
  coordinates?: {lat: number; lng: number};
  className?: string;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  address = "Comunidade Batista Nacional Kerigma - São Luís/MA",
  coordinates = { lat: -2.553380003177845, lng: -44.22306216334706 }, // CBN Kerigma
  className = ""
}) => {
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Mostrar o mapa Google Maps diretamente (sem necessidade de token)
    setShowTokenInput(true);
  }, []);

  const initializeMap = async (token: string) => {
    if (!mapContainer.current || map.current) return;

    try {
      // Verificar se o container existe e está no DOM
      if (!mapContainer.current || !mapContainer.current.isConnected) {
        console.warn('Map container not available');
        return;
      }

      // Importar Mapbox GL JS dinamicamente
      const mapboxgl = await import('mapbox-gl');
      
      if (!mapboxgl.default) {
        throw new Error('Mapbox GL JS failed to load');
      }

      mapboxgl.default.accessToken = token;
      
      // Verificar se o token é válido
      if (!token || token.length < 10) {
        throw new Error('Invalid Mapbox token');
      }
      
      map.current = new mapboxgl.default.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [coordinates.lng, coordinates.lat],
        zoom: 15,
        attributionControl: false
      });

      // Aguardar o mapa carregar antes de adicionar elementos
      map.current.on('load', () => {
        try {
          // Adicionar marcador
          new mapboxgl.default.Marker({
            color: 'hsl(var(--primary))'
          })
          .setLngLat([coordinates.lng, coordinates.lat])
          .setPopup(
            new mapboxgl.default.Popup({ offset: 25 })
              .setHTML(`
                <div class="p-2">
                  <h3 class="font-semibold">CBN Kerigma</h3>
                  <p class="text-sm text-gray-600">${address}</p>
                </div>
              `)
          )
          .addTo(map.current);

          // Adicionar controles de navegação
          map.current.addControl(new mapboxgl.default.NavigationControl(), 'top-right');
        } catch (markerError) {
          console.error('Erro ao adicionar marcador:', markerError);
        }
      });

      setShowTokenInput(false);
      toast({ title: "Mapa carregado com sucesso!" });

    } catch (error) {
      console.error('Erro ao carregar o mapa:', error);
      toast({
        title: "Erro ao carregar mapa",
        description: "Verifique sua conexão e token do Mapbox.",
        variant: "destructive"
      });
    }
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapboxToken.trim()) {
      toast({
        title: "Token necessário",
        description: "Por favor, insira um token válido do Mapbox.",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem('mapbox_token', mapboxToken);
    initializeMap(mapboxToken);
  };

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  const openInWaze = () => {
    const url = `https://waze.com/ul?q=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  if (showTokenInput) {
    // Mostrar mapa Google Maps incorporado diretamente (sem API key necessária)
    const googleMapsEmbedUrl = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}&hl=pt&z=15&output=embed`;
    
    return (
      <Card className={`border-2 border-primary/20 shadow-2xl overflow-hidden ${className}`}>
        <div className="relative">
          <iframe
            src={googleMapsEmbedUrl}
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Mapa da CBN Kerigma"
            className="w-full h-96"
          />
          
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">CBN Kerigma</span>
            </div>
            <p className="text-xs text-muted-foreground">{address}</p>
          </div>

          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={openInGoogleMaps}
              className="bg-white/90 backdrop-blur-sm hover:bg-white"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Abrir no Google Maps
            </Button>
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={openInWaze}
              className="bg-white/90 backdrop-blur-sm hover:bg-white"
            >
              <Navigation className="h-4 w-4 mr-1" />
              Abrir no Waze
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`border-2 border-primary/20 shadow-2xl overflow-hidden ${className}`}>
      <div className="relative">
        <div 
          ref={mapContainer} 
          className="aspect-video w-full h-96 bg-muted/50"
          style={{ minHeight: '400px' }}
        />
        
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">CBN Kerigma</span>
          </div>
          <p className="text-xs text-muted-foreground">{address}</p>
        </div>

        <div className="absolute bottom-4 right-4 flex gap-2">
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={openInGoogleMaps}
            className="bg-white/90 backdrop-blur-sm hover:bg-white"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Google Maps
          </Button>
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={openInWaze}
            className="bg-white/90 backdrop-blur-sm hover:bg-white"
          >
            <Navigation className="h-4 w-4 mr-1" />
            Waze
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default InteractiveMap;