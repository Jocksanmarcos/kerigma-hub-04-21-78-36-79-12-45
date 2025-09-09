import React from "react";
import { DynamicPageRenderer } from "@/components/cms/DynamicPageRenderer";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Image as ImageIcon } from "lucide-react";

const PublicGaleriaPageDynamic: React.FC = () => {
  return (
    <DynamicPageRenderer
      slug="galeria"
      defaultTitle="Galeria"
      defaultDescription="Veja momentos especiais da nossa comunidade através das fotos e vídeos dos nossos eventos."
      defaultHeroTitle="Galeria"
      defaultHeroSubtitle="Momentos especiais da nossa comunidade"
      fallbackContent={
        <div className="space-y-8">
          <div className="text-center">
            <p className="text-muted-foreground mb-8">
              Aqui você encontrará fotos e vídeos dos nossos eventos e atividades.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Camera className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Eventos</h3>
                <p className="text-muted-foreground">Fotos dos nossos eventos especiais</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <ImageIcon className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Células</h3>
                <p className="text-muted-foreground">Momentos das nossas células</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Camera className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Cultos</h3>
                <p className="text-muted-foreground">Registros dos nossos cultos</p>
              </CardContent>
            </Card>
          </div>
        </div>
      }
    />
  );
};

export default PublicGaleriaPageDynamic;