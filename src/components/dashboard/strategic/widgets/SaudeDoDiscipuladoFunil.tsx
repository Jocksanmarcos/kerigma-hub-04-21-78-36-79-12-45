import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, FunnelChart, Funnel, Tooltip, LabelList } from "recharts";

async function fetchJornada() {
  const { data, error } = await supabase
    .from("pessoas")
    .select("status_discipulado")
    .eq("situacao", "ativo");
  if (error) throw error;
  const counts: Record<string, number> = {};
  (data || []).forEach((p: any) => {
    const k = p.status_discipulado || "desconhecido";
    counts[k] = (counts[k] || 0) + 1;
  });
  const orderedKeys = ["visitante", "novo_convertido", "em_andamento", "membro", "lider", "desconhecido"];
  const result = orderedKeys
    .filter((k) => counts[k])
    .map((k) => ({ name: k.replace("_", " "), value: counts[k] }));
  return result;
}

export const SaudeDoDiscipuladoFunil: React.FC = () => {
  const { data = [], isLoading } = useQuery({ queryKey: ["jornada-funil"], queryFn: fetchJornada, staleTime: 60_000 });

  const hasData = useMemo(() => (data || []).some((d) => d.value > 0), [data]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Jornada de Discipulado</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {!hasData ? (
          <p className="text-sm text-muted-foreground">Sem dados suficientes para o funil.</p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip cursor={false} />
                <Funnel dataKey="value" data={data} isAnimationActive={false}>
                  <LabelList position="right" fill="hsl(var(--foreground))" stroke="none" dataKey="name" />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SaudeDoDiscipuladoFunil;
