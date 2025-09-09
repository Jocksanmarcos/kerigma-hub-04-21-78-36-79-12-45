import React, { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle2, FileText, Wallet, UserRound } from "lucide-react";

export type InboxItem = {
  tipo_tarefa: string;
  descricao: string;
  link_acao: string;
  data_criacao: string | null;
};

async function fetchPendingActions(): Promise<InboxItem[]> {
  try {
    const { data, error } = await supabase.rpc("get_user_pending_actions");
    if (error) {
      console.error('Error fetching pending actions:', error);
      return [];
    }
    return (data as InboxItem[]).sort((a, b) => {
      const da = a.data_criacao ? new Date(a.data_criacao).getTime() : 0;
      const db = b.data_criacao ? new Date(b.data_criacao).getTime() : 0;
      return db - da;
    });
  } catch (error) {
    console.error('Error fetching pending actions:', error);
    return [];
  }
}

function renderIcon(tipo: string) {
  const t = (tipo || "").toLowerCase();
  if (t.includes("fin")) return <Wallet className="h-4 w-4" />;
  if (t.includes("relat")) return <FileText className="h-4 w-4" />;
  if (t.includes("jorn") || t.includes("visit")) return <UserRound className="h-4 w-4" />;
  return <CheckCircle2 className="h-4 w-4" />;
}

export const IntelligentInboxWidget: React.FC = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["intelligent-inbox"],
    queryFn: fetchPendingActions,
    staleTime: 60_000,
    gcTime: 300_000,
  });

  // Realtime: atualiza a lista quando dados relacionados mudarem
  useEffect(() => {
    const channel = supabase
      .channel("inbox-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "relatorios_semanais_celulas" },
        () => queryClient.invalidateQueries({ queryKey: ["intelligent-inbox"] })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lancamentos_financeiros_v2" },
        () => queryClient.invalidateQueries({ queryKey: ["intelligent-inbox"] })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "visitantes_celulas" },
        () => queryClient.invalidateQueries({ queryKey: ["intelligent-inbox"] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

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
          {(data || []).map((t, idx) => (
            <li key={idx} className="flex items-center gap-3 p-3 rounded-kerigma bg-muted/40">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                {renderIcon(t.tipo_tarefa)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{t.descricao}</p>
                  <Badge variant="outline">{t.tipo_tarefa}</Badge>
                </div>
                {t.data_criacao && (
                  <p className="text-xs text-muted-foreground truncate">
                    {new Date(t.data_criacao).toLocaleString()}
                  </p>
                )}
              </div>
              {t.link_acao ? (
                <Button asChild size="sm" variant="secondary">
                  <a href={t.link_acao}>Abrir</a>
                </Button>
              ) : (
                <Button size="sm" variant="secondary" disabled>
                  Abrir
                </Button>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default IntelligentInboxWidget;
