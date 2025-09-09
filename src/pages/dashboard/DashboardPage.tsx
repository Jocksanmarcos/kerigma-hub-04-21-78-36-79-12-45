import React, { useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";

import { KPIGrid } from "@/components/dashboard/insights/KPIGrid";
import { CrescimentoAreaChart } from "@/components/dashboard/insights/charts/CrescimentoAreaChart";
import { DistribuicaoFinanceiraDonut } from "@/components/dashboard/insights/charts/DistribuicaoFinanceiraDonut";
import { SaudeCelulasBar } from "@/components/dashboard/insights/charts/SaudeCelulasBar";
import { IntelligentInboxWidget } from "@/components/dashboard/strategic/widgets/IntelligentInboxWidget";
import { SaudeDoDiscipuladoFunil } from "@/components/dashboard/strategic/widgets/SaudeDoDiscipuladoFunil";

function usePageSEO({ title, description, canonical }: { title: string; description: string; canonical?: string }) {
  useEffect(() => {
    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", description);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = description;
      document.head.appendChild(m);
    }
    if (canonical) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
    }
  }, [title, description, canonical]);
}

const DashboardPage: React.FC = () => {
  usePageSEO({
    title: "Dashboard de Insights Visuais – Kerigma Hub",
    description: "KPIs vivos, gráficos de alto impacto e widgets estratégicos para decisões inteligentes.",
    canonical: window.location.origin + "/dashboard",
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* KPIs */}
        <KPIGrid />

          {/* Charts row */}
          <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <CrescimentoAreaChart />
            </div>
            <div className="xl:col-span-1">
              <DistribuicaoFinanceiraDonut />
            </div>
          </div>

          {/* Strategic widgets */}
          <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <SaudeCelulasBar />
            </div>
            <div className="xl:col-span-1">
              <SaudeDoDiscipuladoFunil />
            </div>
          </div>

        <IntelligentInboxWidget />
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
