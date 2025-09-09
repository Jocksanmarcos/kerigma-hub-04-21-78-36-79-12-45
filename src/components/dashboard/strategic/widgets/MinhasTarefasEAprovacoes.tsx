import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle2, FileText, Wallet } from "lucide-react";

interface TaskItem {
  id: string;
  type: "Relatório" | "Financeiro" | "Ensino" | "Jornada";
  title: string;
  subtitle?: string;
  created_at?: string;
  severity?: "alta" | "media" | "baixa";
  link?: string;
}

async function fetchTasks(): Promise<TaskItem[]> {
  const tasks: TaskItem[] = [];

  // Financeiro: lançamentos pendentes de confirmação/aprovação
  try {
    const { data } = await supabase
      .from("lancamentos_financeiros_v2")
      .select("id, descricao, valor, status, created_at")
      .eq("status", "pendente")
      .limit(5);

    (data || []).forEach((l: any) =>
      tasks.push({
        id: `fin-${l.id}`,
        type: "Financeiro",
        title: l.descricao || "Lançamento financeiro pendente",
        subtitle: l.valor ? `R$ ${Number(l.valor).toFixed(2)}` : undefined,
        created_at: l.created_at,
        severity: "alta",
        link: "/dashboard/financeiro",
      })
    );
  } catch (_) {}

  // Células: relatórios semanais pendentes
  try {
    const { data } = await supabase
      .from("relatorios_semanais_celulas")
      .select("id, celula_id, data_reuniao, status")
      .eq("status", "pendente")
      .order("data_reuniao", { ascending: false })
      .limit(5);

    (data || []).forEach((r: any) =>
      tasks.push({
        id: `rel-${r.id}`,
        type: "Relatório",
        title: `Relatório da célula ${r.celula_id?.slice(0, 6) || ""}`,
        subtitle: r.data_reuniao ? new Date(r.data_reuniao).toLocaleDateString() : undefined,
        created_at: r.data_reuniao,
        severity: "media",
        link: "/dashboard/celulas",
      })
    );
  } catch (_) {}

  // Ordenar por data (desc) e limitar feed consolidado
  const sorted = tasks.sort((a, b) => (new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()));
  return sorted.slice(0, 8);
}

export const MinhasTarefasEAprovacoes: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["inbox-acao-pendente"],
    queryFn: fetchTasks,
    staleTime: 60_000,
    gcTime: 300_000,
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl">Caixa de Entrada: Ações Pendentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" /> Falha ao carregar ações.
          </div>
        )}

        {!isLoading && (data?.length || 0) === 0 && (
          <p className="text-sm text-muted-foreground">Sem ações pendentes no momento.</p>
        )}

        <ul className="space-y-3">
          {(data || []).map((t) => (
            <li key={t.id} className="flex items-center gap-3 p-3 rounded-kerigma bg-muted/40">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                {t.type === "Financeiro" ? (
                  <Wallet className="h-4 w-4" />
                ) : t.type === "Relatório" ? (
                  <FileText className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{t.title}</p>
                  <Badge variant="outline">{t.type}</Badge>
                </div>
                {(t.subtitle || t.created_at) && (
                  <p className="text-xs text-muted-foreground truncate">
                    {t.subtitle} {t.subtitle && t.created_at ? " • " : ""}
                    {t.created_at ? new Date(t.created_at).toLocaleString() : ""}
                  </p>
                )}
              </div>
              {t.link ? (
                <Button asChild size="sm" variant="secondary">
                  <a href={t.link}>Ver</a>
                </Button>
              ) : (
                <Button size="sm" variant="secondary" disabled>
                  Ver
                </Button>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default MinhasTarefasEAprovacoes;
