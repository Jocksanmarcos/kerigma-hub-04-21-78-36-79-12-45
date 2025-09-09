import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ExportEscalaButtonProps {
  planId: string;
  planTitle?: string;
}

export const ExportEscalaButton: React.FC<ExportEscalaButtonProps> = ({ planId, planTitle = "Escala" }) => {
  const { toast } = useToast();

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("escalas_servico")
      .select(`
        id,
        funcao,
        status_confirmacao,
        observacoes,
        resultado_presenca,
        presenca_registrada_em,
        pessoas(nome_completo, email)
      `)
      .eq("plano_id", planId)
      .order("funcao", { ascending: true });

    if (error) throw error;
    return data || [];
  };

  const toCSV = (rows: any[]) => {
    const headers = [
      "Nome",
      "Email",
      "Função",
      "Status Convite",
      "Presença",
      "Registrado em",
      "Observações"
    ];

    const csvRows = rows.map((r) => [
      r.pessoas?.nome_completo || "",
      r.pessoas?.email || "",
      r.funcao || "",
      r.status_confirmacao || "",
      r.resultado_presenca || "",
      r.presenca_registrada_em ? new Date(r.presenca_registrada_em).toLocaleString("pt-BR") : "",
      (r.observacoes || "").replace(/\n|\r/g, " ")
    ]);

    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    return new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  };

  const handleExport = async () => {
    try {
      const rows = await fetchData();
      if (!rows.length) {
        toast({ title: "Sem dados", description: "Nenhum item na escala para exportar." });
        return;
      }
      const blob = toCSV(rows);
      const fileName = `${planTitle.toLowerCase().replace(/\s+/g, '-')}-escala.csv`;

      // Web Share API (quando suportado)
      // @ts-ignore - navigator.canShare pode não existir no tipo
      if (navigator.canShare && navigator.canShare({ files: [new File([blob], fileName, { type: blob.type })] })) {
        const file = new File([blob], fileName, { type: blob.type });
        // @ts-ignore
        await navigator.share({
          title: `Escala — ${planTitle}`,
          text: "Escala exportada",
          files: [file]
        });
        return;
      }

      // Fallback: download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error(error);
      toast({ title: "Erro ao exportar", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleExport} className="h-9">
        <Download className="h-4 w-4 mr-2" />
        Exportar CSV
      </Button>
      {/* Espaço reservado para compartilhar link quando houver página pública da escala */}
      <Button variant="ghost" disabled className="h-9">
        <Share2 className="h-4 w-4 mr-2" />
        Compartilhar
      </Button>
    </div>
  );
};

export default ExportEscalaButton;
