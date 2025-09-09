import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { PartyPopper, AlertTriangle, Info } from "lucide-react";
async function fetchCelulas() {
  const { data, error } = await supabase
    .from("celulas")
    .select("id, nome, saude_celula, bairro, dia_semana, horario")
    .limit(100);
  if (error) throw error;
  return data || [];
}

export const CelulasEmFoco: React.FC = () => {
  const { data = [], isLoading } = useQuery({ queryKey: ["celulas-foco"], queryFn: fetchCelulas, staleTime: 60_000 });

  const { celebrar, cuidar } = useMemo(() => {
    const arr = (data as any[]) || [];
    const verdes = arr.filter((c) => (c.saude_celula || "").toLowerCase().includes("verde"));
    const amarelas = arr.filter((c) => (c.saude_celula || "").toLowerCase().includes("amare"));
    const vermelhas = arr.filter((c) => (c.saude_celula || "").toLowerCase().includes("verme"));

    const mapItem = (c: any) => {
      const saude = (c.saude_celula || "").toLowerCase();
      let icone_contexto: "celebrar" | "atencao" | "alerta" = "atencao";
      let motivo = "Status em acompanhamento";
      if (saude.includes("verde")) {
        icone_contexto = "celebrar";
        motivo = "Crescimento saudável e boa frequência";
      } else if (saude.includes("verme")) {
        icone_contexto = "alerta";
        motivo = "Baixa frequência ou relatórios pendentes";
      } else if (saude.includes("amare")) {
        icone_contexto = "atencao";
        motivo = "Manter atenção aos indicadores";
      }
      return {
        ...c,
        link_para_detalhes: `/admin/celulas`,
        icone_contexto,
        motivo,
      };
    };

    return {
      celebrar: [...verdes, ...amarelas].slice(0, 3).map(mapItem),
      cuidar: [...vermelhas, ...amarelas.reverse()].slice(0, 3).map(mapItem),
    };
  }, [data]);

  const Item = ({ item }: { item: any }) => {
    const Icon = item.icone_contexto === "celebrar" ? PartyPopper : item.icone_contexto === "alerta" ? AlertTriangle : Info;
    return (
      <Link
        to={item.link_para_detalhes}
        className="block p-3 rounded-kerigma bg-muted/40 hover:bg-muted transition-colors"
        aria-label={`Abrir detalhes da célula ${item.nome}`}
      >
        <div className="flex items-center justify-between">
          <p className="font-medium truncate flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            {item.nome}
          </p>
          <Badge variant="outline">{item.saude_celula || "—"}</Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {item.bairro || ""} {item.dia_semana ? `• ${item.dia_semana}` : ""} {item.horario ? `• ${item.horario}` : ""}
        </p>
        <p className="text-[11px] text-muted-foreground mt-1 truncate">{item.motivo}</p>
      </Link>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Células a Celebrar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
          {!isLoading && (celebrar || []).length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma célula em destaque no momento.</p>
          )}
          {(celebrar || []).map((c: any) => (
            <Item key={c.id} item={c} />
          ))}
        </CardContent>
      </Card>

      <Card className="h-full">
        <CardHeader>
          <CardTitle>Células a Cuidar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
          {!isLoading && (cuidar || []).length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma célula em atenção no momento.</p>
          )}
          {(cuidar || []).map((c: any) => (
            <Item key={c.id} item={c} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default CelulasEmFoco;
