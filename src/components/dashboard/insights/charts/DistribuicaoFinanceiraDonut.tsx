import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

async function fetchFinanceDistribution() {
  try {
    const query = `
      SELECT COALESCE(categoria, 'Outros') AS categoria, SUM(valor)::numeric AS total
      FROM lancamentos_financeiros_v2
      WHERE tipo = 'receita' AND LOWER(status) IN ('confirmado','aprovado','pago')
        AND date_trunc('month', created_at) = date_trunc('month', now())
      GROUP BY categoria
      ORDER BY total DESC
    `;
    const res = await supabase.rpc("execute_query", { query_text: query.trim() });
    return (res.data as any[]) ?? [];
  } catch (_) {
    return [] as any[];
  }
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "hsl(var(--destructive))", "hsl(var(--muted-foreground))"];

export const DistribuicaoFinanceiraDonut: React.FC = () => {
  const { data = [] } = useQuery({ queryKey: ["finance-donut"], queryFn: fetchFinanceDistribution, staleTime: 60_000 });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Distribuição Financeira</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem dados suficientes para a distribuição deste mês.</p>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="total" nameKey="categoria" innerRadius={60} outerRadius={90} paddingAngle={2}>
                  {data.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", color: "hsl(var(--popover-foreground))" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DistribuicaoFinanceiraDonut;
