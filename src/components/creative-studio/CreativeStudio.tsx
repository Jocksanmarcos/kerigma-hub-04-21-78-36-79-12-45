import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FormBuilder from "./forms/FormBuilder";
import DocumentGenerator from "./documents/DocumentGenerator";
import MediaGallery from "./media/MediaGallery";

const CreativeStudio: React.FC = () => {
  return (
    <div className="w-full">
      <Tabs defaultValue="forms" className="w-full">
        <TabsList className="w-full mb-4 flex gap-1">
          <TabsTrigger value="forms" className="flex-1 text-xs px-2 truncate">
            Construtor de Formulários
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex-1 text-xs px-2 truncate">
            Gerador de Documentos
          </TabsTrigger>
          <TabsTrigger value="media" className="flex-1 text-xs px-2 truncate">
            Galeria de Mídia
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forms" className="mt-0">
          <FormBuilder />
        </TabsContent>

        <TabsContent value="documents" className="mt-0">
          <DocumentGenerator />
        </TabsContent>

        <TabsContent value="media" className="mt-0">
          <MediaGallery />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreativeStudio;
