import React, { useState } from "react";
import { useLiveEditor } from "./LiveEditorProvider";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus } from "lucide-react";

const BLOCK_OPTIONS = [
  { value: "image", label: "Imagem", content: { url: "https://picsum.photos/1200/600", alt: "Imagem" } },
  { value: "video", label: "Vídeo", content: { url: "https://www.youtube.com/embed/dQw4w9WgXcQ" } },
  { value: "events_carousel", label: "Carrossel de Eventos", content: { limit: 6 } },
  { value: "courses_list", label: "Lista de Cursos EAD", content: { limit: 6 } },
  { value: "cells_map", label: "Mapa de Células", content: { mostrar_mapa: true } },
  { value: "visitor_form", label: "Formulário de Visitante", content: {} },
];

const VisualBlockInserter: React.FC = () => {
  const { isAdmin, editMode, addBlock } = useLiveEditor();
  const [open, setOpen] = useState(false);

  if (!isAdmin || !editMode) return null;

  return (
    <div className="fixed left-6 bottom-6 z-[1000]">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button size="lg" className="rounded-full shadow-lg">
            <Plus className="h-5 w-5 mr-2" /> Adicionar Bloco
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {BLOCK_OPTIONS.map((opt) => (
            <DropdownMenuItem key={opt.value} onClick={() => addBlock({ type: opt.value, content_json: opt.content })}>
              {opt.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default VisualBlockInserter;