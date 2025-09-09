import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

async function fetchSaudeCelulas() {
  const query = `
    SELECT COALESCE(saude_celula, 'Desconhecida') AS status, COUNT(*)::int AS total
    FROM celulas
    GROUP BY saude_celula
    ORDER BY status
  `;
  const res = await supabase.rpc("execute_query", { query_text: query.trim() });
  return (res.data as any[]) ?? [];
}

export const SaudeCelulasBar: React.FC = () => {
  const { data = [] } = useQuery({ queryKey: ["saude-celulas-bar"], queryFn: fetchSaudeCelulas, staleTime: 60_000 });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Saúde das Células</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis dataKey="status" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", color: "hsl(var(--popover-foreground))" }} />
              <Bar dataKey="total" name="Células" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SaudeCelulasBar;
