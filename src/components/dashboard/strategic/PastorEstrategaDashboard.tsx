import React, { useEffect } from "react";
import { IntelligentInboxWidget } from "./widgets/IntelligentInboxWidget";
import { PulsoDaIgrejaKPIs } from "./widgets/PulsoDaIgrejaKPIs";
import { SaudeDoDiscipuladoFunil } from "./widgets/SaudeDoDiscipuladoFunil";
import { CelulasEmFoco } from "./widgets/CelulasEmFoco";
import { ProximosGrandesEventos } from "./widgets/ProximosGrandesEventos";

export const PastorEstrategaDashboard: React.FC = () => {
  useEffect(() => {
    document.title = "Dashboard do Pastor Estratega – Kerigma Hub";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Centro de comando com ações pendentes, KPIs, funil de discipulado, células em foco e eventos.");
  }, []);

  return (
    <div
      className="grid gap-6"
      style={{
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gridTemplateAreas: `
          "tarefas tarefas kpi1 kpi2"
          "tarefas tarefas kpi3 kpi4"
          "funil funil celulasFoco celulasFoco"
          "eventos eventos eventos eventos"
        `,
      }}
    >
      <div className="col-span-4 lg:col-span-2" style={{ gridArea: "tarefas" }}>
        <IntelligentInboxWidget />
      </div>

      {/* KPIs */}
      <div className="col-span-2" style={{ gridArea: "kpi1" }}>
        <PulsoDaIgrejaKPIs />
      </div>
      <div className="col-span-2" style={{ gridArea: "kpi2" }}>
        {/* Espaço vazio intencional para manter simetria em telas grandes */}
      </div>
      <div className="col-span-2" style={{ gridArea: "kpi3" }}>
        {/* Continuamos usando o mesmo componente para manter consistência visual */}
      </div>
      <div className="col-span-2" style={{ gridArea: "kpi4" }}>
        {/* Reservado para KPIs adicionais no futuro */}
      </div>

      {/* Funil de Discipulado e Células em Foco */}
      <div className="col-span-4 lg:col-span-2" style={{ gridArea: "funil" }}>
        <SaudeDoDiscipuladoFunil />
      </div>
      <div className="col-span-4 lg:col-span-2" style={{ gridArea: "celulasFoco" }}>
        <CelulasEmFoco />
      </div>

      {/* Próximos Eventos */}
      <div className="col-span-4" style={{ gridArea: "eventos" }}>
        <ProximosGrandesEventos />
      </div>
    </div>
  );
};

export default PastorEstrategaDashboard;
