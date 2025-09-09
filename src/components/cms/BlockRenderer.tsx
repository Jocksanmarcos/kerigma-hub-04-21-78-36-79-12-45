import React from "react";
import CarouselEventos from "./blocks/CarouselEventos";
import ListaCursosEAD from "./blocks/ListaCursosEAD";
import MapaCelulas from "./blocks/MapaCelulas";
import FormularioVisitante from "./blocks/FormularioVisitante";

interface CMSBlock {
  id: string;
  type: string;
  content_json: any;
  order: number;
  page_id: string;
}

export const BlockRenderer: React.FC<{ block: CMSBlock; onChange?: (content: any) => void }> = ({ block, onChange }) => {
  switch (block.type) {
    case "image":
      return (
        <div className="space-y-2">
          <input
            className="w-full rounded border border-border bg-background p-2"
            placeholder="URL da imagem"
            defaultValue={block.content_json?.url || ""}
            onBlur={(e) => onChange?.({ url: e.currentTarget.value })}
          />
          {block.content_json?.url && (
            <img src={block.content_json.url} alt={block.content_json?.alt || "Imagem do conteúdo"} className="max-h-64 w-full object-cover rounded" loading="lazy" />
          )}
        </div>
      );
    case "video":
      return (
        <div className="space-y-2">
          <input
            className="w-full rounded border border-border bg-background p-2"
            placeholder="URL do vídeo (YouTube/Vimeo)"
            defaultValue={block.content_json?.url || ""}
            onBlur={(e) => onChange?.({ url: e.currentTarget.value })}
          />
          {block.content_json?.url && (
            <div className="aspect-video w-full">
              <iframe className="h-full w-full rounded" src={block.content_json.url} title="Vídeo" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          )}
        </div>
      );
    case "events_carousel":
      return <CarouselEventos content={block.content_json} />;
    case "courses_list":
      return <ListaCursosEAD content={block.content_json} />;
    case "cells_map":
      return <MapaCelulas content={block.content_json} />;
    case "visitor_form":
      return <FormularioVisitante content={block.content_json} />;
    default:
      return <div className="text-sm text-muted-foreground">Bloco não suportado: {block.type}</div>;
  }
};
