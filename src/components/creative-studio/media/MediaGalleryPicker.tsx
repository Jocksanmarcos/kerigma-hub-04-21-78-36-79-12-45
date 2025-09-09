import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import type { MediaItem } from "./MediaGallery";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (item: MediaItem) => void;
}

const MediaGalleryPicker: React.FC<Props> = ({ open, onOpenChange, onSelect }) => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data } = await supabase.from("galeria_midia").select("id, arquivo_url, tipo, tags").order("created_at", { ascending: false });
      setItems((data || []) as any);
    })();
  }, [open]);

  const filtered = useMemo(() => {
    if (!q) return items;
    const s = q.toLowerCase();
    return items.filter((i) => i.tags?.join(" ").toLowerCase().includes(s) || i.arquivo_url.toLowerCase().includes(s));
  }, [items, q]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Selecionar da Galeria</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Pesquisar" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[60vh] overflow-auto">
            {filtered.map((m) => (
              <button key={m.id} className="rounded-md border border-border overflow-hidden hover:ring-2 ring-primary" onClick={() => { onSelect(m); onOpenChange(false); }}>
                {m.tipo === "imagem" ? (
                  <img src={m.arquivo_url} alt="Mídia" className="h-36 w-full object-cover" loading="lazy" />
                ) : (
                  <video src={m.arquivo_url} className="h-36 w-full object-cover" preload="metadata" />)
                }
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaGalleryPicker;
