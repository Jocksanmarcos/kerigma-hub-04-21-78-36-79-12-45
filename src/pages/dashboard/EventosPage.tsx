import React, { useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { EventosList } from "@/components/eventos/EventosList";
import { EventCreationWizard } from "@/components/eventos/EventCreationWizard";
const usePageSEO = ({ title, description, canonical }: { title: string; description: string; canonical?: string }) => {
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
};

const EventosPage: React.FC = () => {
  usePageSEO({
    title: "Central de Eventos & Inscrições",
    description: "Gestão completa de eventos: criação, inscrições, pagamentos e check-in.",
    canonical: window.location.origin + "/dashboard/eventos",
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Central de Eventos</h1>
            <p className="text-muted-foreground">Crie eventos, gerencie inscrições e check-in</p>
          </div>
          <EventCreationWizard />
        </div>
        <EventosList />
      </div>
    </AppLayout>
  );
};

export default EventosPage;
