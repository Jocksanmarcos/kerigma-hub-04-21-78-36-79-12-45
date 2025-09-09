import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import KPITrendCard, { KPITrendPoint } from "./KPITrendCard";
import { Users, HeartHandshake, UserPlus, Heart } from "lucide-react";

async function fetchKpis() {
  const q = {
    membrosAtivos: "SELECT COUNT(*)::int AS total FROM pessoas WHERE situacao = 'ativo'",
    celulasAtivas: "SELECT COUNT(*)::int AS total FROM celulas WHERE (status = 'ativa' OR ativa = true)",
    visitantes30d: "SELECT COUNT(*)::int AS total FROM pessoas WHERE tipo_pessoa = 'visitante' AND situacao = 'ativo' AND created_at > now() - interval '30 days'",
    decisoes30d: "SELECT COUNT(*)::int AS total FROM pessoas WHERE estado_espiritual = 'novo_convertido' AND created_at > now() - interval '30 days'",
    trendBase: (filter: string) => `
      WITH dias AS (
        SELECT generate_series(current_date - interval '6 day', current_date, interval '1 day')::date AS dia
      )
      SELECT 
        to_char(d.dia, 'DD/MM') as label,
        COUNT(p.id)::int AS value
      FROM dias d
      LEFT JOIN pessoas p
        ON date_trunc('day', p.created_at) = d.dia
        ${filter}
      GROUP BY d.dia
      ORDER BY d.dia
    `,
  } as const;

  const [membrosRes, celulasRes, visitRes, decRes, membrosTrendRes, visitTrendRes, decTrendRes] = await Promise.all([
    supabase.rpc("execute_query", { query_text: q.membrosAtivos }),
    supabase.rpc("execute_query", { query_text: q.celulasAtivas }),
    supabase.rpc("execute_query", { query_text: q.visitantes30d }),
    supabase.rpc("execute_query", { query_text: q.decisoes30d }),
    supabase.rpc("execute_query", { query_text: q.trendBase("AND p.situacao = 'ativo'") }),
    supabase.rpc("execute_query", { query_text: q.trendBase("AND p.tipo_pessoa = 'visitante' AND p.situacao = 'ativo'") }),
    supabase.rpc("execute_query", { query_text: q.trendBase("AND p.estado_espiritual = 'novo_convertido'") }),
  ]);

  const getTotal = (r: any) => (r?.data?.[0]?.total as number) ?? 0;
  const mapTrend = (r: any): KPITrendPoint[] => (Array.isArray(r?.data) ? r.data : []) as KPITrendPoint[];

  const membrosAtivos = getTotal(membrosRes);
  const celulasAtivas = getTotal(celulasRes);
  const visitantes30d = getTotal(visitRes);
  const decisoes30d = getTotal(decRes);

  const membrosTrend = mapTrend(membrosTrendRes);
  const visitantesTrend = mapTrend(visitTrendRes);
  const decisoesTrend = mapTrend(decTrendRes);
  const celulasTrend: KPITrendPoint[] = membrosTrend.map((p: KPITrendPoint) => ({ label: p.label, value: celulasAtivas }));

  return { membrosAtivos, celulasAtivas, visitantes30d, decisoes30d, membrosTrend, celulasTrend, visitantesTrend, decisoesTrend };
}

export const KPIGrid: React.FC = () => {
  const { data, isLoading } = useQuery({ queryKey: ["kpis-insights"], queryFn: fetchKpis, staleTime: 60_000 });

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
      <KPITrendCard
        title="Membros Ativos"
        value={isLoading ? "…" : data?.membrosAtivos ?? 0}
        Icon={Users}
        colorVariant="primary"
        trend={data?.membrosTrend || []}
      />
      <KPITrendCard
        title="Células Ativas"
        value={isLoading ? "…" : data?.celulasAtivas ?? 0}
        Icon={HeartHandshake}
        colorVariant="accent"
        trend={data?.celulasTrend || []}
      />
      <KPITrendCard
        title="Visitantes (30d)"
        value={isLoading ? "…" : data?.visitantes30d ?? 0}
        Icon={UserPlus}
        colorVariant="secondary"
        trend={data?.visitantesTrend || []}
      />
      <KPITrendCard
        title="Decisões (30d)"
        value={isLoading ? "…" : data?.decisoes30d ?? 0}
        Icon={Heart}
        colorVariant="destructive"
        trend={data?.decisoesTrend || []}
      />
    </div>
  );
};

export default KPIGrid;
