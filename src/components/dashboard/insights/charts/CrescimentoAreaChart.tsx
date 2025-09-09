import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

async function fetchGrowth() {
  const growthQuery = `
    SELECT to_char(m, 'YYYY-MM') as mes,
      (SELECT COUNT(*) FROM pessoas p WHERE situacao='ativo' AND date_trunc('month', p.created_at) = m)::int AS membros,
      (SELECT COUNT(*) FROM pessoas p2 WHERE tipo_pessoa='visitante' AND date_trunc('month', p2.created_at) = m)::int AS visitantes
    FROM generate_series(date_trunc('month', now()) - interval '11 months', date_trunc('month', now()), '1 month') m
  `;
  const res = await supabase.rpc("execute_query", { query_text: growthQuery.trim() });
  return (res.data as any[]) ?? [];
}

export const CrescimentoAreaChart: React.FC = () => {
  const { data = [] } = useQuery({ queryKey: ["growth-area"], queryFn: fetchGrowth, staleTime: 60_000 });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Crescimento da Igreja</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="membrosGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="visitantesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis dataKey="mes" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", color: "hsl(var(--popover-foreground))" }} />
              <Area type="monotone" dataKey="membros" name="Membros" stroke="hsl(var(--primary))" fill="url(#membrosGradient)" strokeWidth={2} />
              <Area type="monotone" dataKey="visitantes" name="Visitantes" stroke="hsl(var(--accent))" fill="url(#visitantesGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CrescimentoAreaChart;
