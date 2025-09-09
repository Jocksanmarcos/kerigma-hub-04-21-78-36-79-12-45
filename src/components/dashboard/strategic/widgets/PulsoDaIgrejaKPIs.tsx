import React from "react";
import { useQuery } from "@tanstack/react-query";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Users, UserPlus, Flag, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

async function fetchKpis() {
  const membrosRes = await supabase.rpc("execute_query", { query_text: "SELECT COUNT(*)::int AS total FROM pessoas WHERE situacao = 'ativo'" });
  const visitantes30dRes = await supabase.rpc("execute_query", { query_text: "SELECT COUNT(*)::int AS total FROM pessoas WHERE tipo_pessoa = 'visitante' AND situacao = 'ativo' AND created_at > now() - interval '30 days'" });
  const decisoes30dRes = await supabase.rpc("execute_query", { query_text: "SELECT COUNT(*)::int AS total FROM pessoas WHERE estado_espiritual = 'novo_convertido' AND created_at > now() - interval '30 days'" });
  const finRes = await supabase.rpc("obter_estatisticas_financeiras");

  const membros = (membrosRes.data?.[0]?.total as number) ?? 0;
  const visitantes30d = (visitantes30dRes.data?.[0]?.total as number) ?? 0;
  const decisoes30d = (decisoes30dRes.data?.[0]?.total as number) ?? 0;

  let saudeOrcamentaria = 0;
  if (finRes.data && finRes.data[0]) {
    const rec = Number(finRes.data[0].receitas_mes || 0);
    const desp = Number(finRes.data[0].despesas_mes || 0);
    const total = rec + desp;
    saudeOrcamentaria = total > 0 ? Math.round((rec / total) * 100) : 0;
  }

  return { membros, visitantes30d, decisoes30d, saudeOrcamentaria };
}

export const PulsoDaIgrejaKPIs: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["pulso-kpis"],
    queryFn: fetchKpis,
    staleTime: 60_000,
  });

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      <StatsCard
        title="Membros Ativos"
        value={isLoading ? "…" : data?.membros ?? 0}
        icon={Users}
        variant="primary"
      />
      <StatsCard
        title="Visitantes (30d)"
        value={isLoading ? "…" : data?.visitantes30d ?? 0}
        icon={UserPlus}
        variant="default"
      />
      <StatsCard
        title="Decisões (30d)"
        value={isLoading ? "…" : data?.decisoes30d ?? 0}
        icon={Flag}
        variant="default"
      />
      <StatsCard
        title="Saúde Orçamentária (%)"
        value={isLoading ? "…" : `${data?.saudeOrcamentaria ?? 0}%`}
        icon={DollarSign}
        variant="secondary"
      />
    </div>
  );
};

export default PulsoDaIgrejaKPIs;
