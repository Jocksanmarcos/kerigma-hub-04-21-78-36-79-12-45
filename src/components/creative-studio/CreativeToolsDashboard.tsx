import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FormBuilder from "./forms/FormBuilder";
import DocumentGenerator from "./documents/DocumentGenerator";
import MediaGallery from "./media/MediaGallery";

const CreativeToolsDashboard: React.FC = () => {
  return (
    <div className="w-full">
      <Tabs defaultValue="forms" className="w-full">
        <TabsList className="grid grid-cols-3 w-full mb-4">
          <TabsTrigger value="forms" className="text-xs px-2">Construtor de Formulários</TabsTrigger>
          <TabsTrigger value="documents" className="text-xs px-2">Gerador de Documentos</TabsTrigger>
          <TabsTrigger value="media" className="text-xs px-2">Galeria de Mídia</TabsTrigger>
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

export default CreativeToolsDashboard;
