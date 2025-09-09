import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

export type MediaItem = {
  id: string;
  arquivo_url: string;
  tipo: "imagem" | "video";
  tags: string[];
};

const MediaGallery: React.FC = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [query, setQuery] = useState("");

  async function load() {
    const { data, error } = await supabase.from("galeria_midia").select("id, arquivo_url, tipo, tags").order("created_at", { ascending: false });
    if (!error) setItems(data as any);
  }
  useEffect(() => { load(); }, []);

  async function handleUpload(ev: React.ChangeEvent<HTMLInputElement>) {
    const files = ev.target.files; if (!files || !files.length) return;
    for (const file of Array.from(files)) {
      const path = `${Date.now()}_${file.name}`;
      const { data: up, error: uerr } = await supabase.storage.from("galeria").upload(path, file, { upsert: false });
      if (uerr) { toast({ title: "Upload falhou", description: uerr.message, variant: "destructive" }); continue; }
      const { data: pub } = supabase.storage.from("galeria").getPublicUrl(path);
      const tipo = file.type.startsWith("video") ? "video" : "imagem";
      const { error: ierr } = await supabase.from("galeria_midia").insert({ arquivo_url: pub.publicUrl, tipo, tags: [] });
      if (ierr) toast({ title: "Erro", description: ierr.message, variant: "destructive" });
    }
    toast({ title: "Upload concluído" });
    ev.currentTarget.value = "";
    load();
  }

  const filtered = useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter((i) => i.tags?.join(" ").toLowerCase().includes(q) || i.arquivo_url.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1 flex gap-2">
              <Input placeholder="Pesquisar por tags ou URL" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div>
              <Button asChild>
                <label className="cursor-pointer inline-flex items-center gap-2"><Upload className="h-4 w-4" /> Upload
                  <input type="file" onChange={handleUpload} accept="image/*,video/*" multiple className="hidden" />
                </label>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filtered.map((m) => (
          <div key={m.id} className="group rounded-md border border-border overflow-hidden">
            {m.tipo === "imagem" ? (
              <img src={m.arquivo_url} alt="Mídia da galeria" className="h-36 w-full object-cover" loading="lazy" />
            ) : (
              <video src={m.arquivo_url} className="h-36 w-full object-cover" preload="metadata" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaGallery;
