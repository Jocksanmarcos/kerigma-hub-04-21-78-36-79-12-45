import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PatrimonioInventory } from "@/components/patrimonio/PatrimonioInventory";
import { PatrimonioCategorias } from "@/components/patrimonio/PatrimonioCategorias";
import { PatrimonioReservas } from "@/components/patrimonio/PatrimonioReservas";
import { PatrimonioManutencoes } from "@/components/patrimonio/PatrimonioManutencoes";
import { PatrimonioRelatorios } from "@/components/patrimonio/PatrimonioRelatorios";

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

const PatrimonioPage: React.FC = () => {
  usePageSEO({
    title: "Gestão de Patrimônio – Ativos da Igreja",
    description: "Controle de ativos: cadastro, manutenções, empréstimos e histórico.",
    canonical: window.location.origin + "/dashboard/patrimonio",
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Central de Governança de Ativos</h1>
          <p className="text-muted-foreground">Sistema completo de gestão patrimonial: inventário, reservas, manutenções e relatórios.</p>
        </div>
        <Tabs defaultValue="inventario" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
            <TabsTrigger value="inventario">Inventário</TabsTrigger>
            <TabsTrigger value="categorias">Categorias</TabsTrigger>
            <TabsTrigger value="reservas">Reservas</TabsTrigger>
            <TabsTrigger value="manutencoes">Manutenções</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="inventario">
            <PatrimonioInventory />
          </TabsContent>

          <TabsContent value="categorias">
            <PatrimonioCategorias />
          </TabsContent>

          <TabsContent value="reservas">
            <PatrimonioReservas />
          </TabsContent>

          <TabsContent value="manutencoes">
            <PatrimonioManutencoes />
          </TabsContent>

          <TabsContent value="relatorios">
            <PatrimonioRelatorios />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default PatrimonioPage;
