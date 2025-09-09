import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

async function fetchEventos() {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("eventos")
    .select("id, titulo, data_inicio, local, cover_image_url")
    .gt("data_inicio", now)
    .order("data_inicio", { ascending: true })
    .limit(8);
  if (error) throw error;
  return data || [];
}

export const ProximosGrandesEventos: React.FC = () => {
  const { data = [], isLoading } = useQuery({ queryKey: ["eventos-proximos"], queryFn: fetchEventos, staleTime: 60_000 });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Próximos Eventos</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
        {!isLoading && data.length === 0 && <p className="text-sm text-muted-foreground">Sem eventos no horizonte imediato.</p>}
        <div className="flex gap-4 overflow-x-auto py-2">
          {data.map((ev: any) => (
            <div key={ev.id} className="min-w-[260px] max-w-[260px] rounded-kerigma border bg-card">
              {ev.cover_image_url && (
                <img
                  src={ev.cover_image_url}
                  alt={`Capa do evento ${ev.titulo}`}
                  loading="lazy"
                  className="h-32 w-full object-cover rounded-t-kerigma"
                />
              )}
              <div className="p-3">
                <p className="font-semibold line-clamp-2">{ev.titulo}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(ev.data_inicio).toLocaleString()} {ev.local ? `• ${ev.local}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProximosGrandesEventos;
