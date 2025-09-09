import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Clock, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CelulaAPI {
  nome_celula: string;
  latitude: number;
  longitude: number;
  lider_nome: string | null;
}

interface MapaCelulasProps {
  content?: {
    titulo?: string;
    subtitulo?: string;
    mostrar_mapa?: boolean;
    filtros_habilitados?: boolean;
  };
}

const MapaCelulas: React.FC<MapaCelulasProps> = ({ content = {} }) => {
  const [celulas, setCelulas] = useState<CelulaAPI[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    titulo = "Nossas Células",
    subtitulo = "Encontre uma célula perto de você e faça parte da nossa comunidade",
    mostrar_mapa = true,
    filtros_habilitados = false // Desabilitado pois a API não retorna saude_celula
  } = content;

  useEffect(() => {
    loadCelulas();
  }, []);

  async function loadCelulas() {
    try {
      const { data, error } = await supabase.functions.invoke('api-cells');
      
      if (error) {
        console.error("Erro ao carregar células:", error);
        return;
      }

      setCelulas(data || []);
    } catch (error) {
      console.error("Erro ao carregar células:", error);
    } finally {
      setLoading(false);
    }
  }

  const getSaudeColor = (saude: string) => {
    switch (saude?.toLowerCase()) {
      case "verde":
        return "bg-green-100 text-green-800 border-green-200";
      case "amarelo":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "vermelho":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSaudeIcon = (saude: string) => {
    switch (saude?.toLowerCase()) {
      case "verde":
        return <Heart className="h-4 w-4 fill-current" />;
      case "amarelo":
        return <Heart className="h-4 w-4" />;
      case "vermelho":
        return <Heart className="h-4 w-4" />;
      default:
        return <Heart className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="h-8 bg-muted animate-pulse rounded mb-2"></div>
          <div className="h-4 bg-muted animate-pulse rounded max-w-md mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">{titulo}</h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">{subtitulo}</p>
      </div>

      {/* Grid de Células */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {celulas.map((celula, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{celula.nome_celula}</CardTitle>
                <Badge variant="secondary">
                  <Heart className="h-4 w-4 mr-1" />
                  Ativa
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Localizada em:</p>
                  <p className="text-muted-foreground">
                    Lat: {celula.latitude.toFixed(4)}, Long: {celula.longitude.toFixed(4)}
                  </p>
                </div>
              </div>

              {celula.lider_nome && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Líder: {celula.lider_nome}
                  </span>
                </div>
              )}

              <Button className="w-full" variant="outline">
                Saiba Mais
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {celulas.length === 0 && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma célula encontrada</h3>
            <p className="text-muted-foreground">
              Não há células ativas cadastradas no momento.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default MapaCelulas;