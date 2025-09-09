import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, FileCheck2, Search } from "lucide-react";

interface PresencaManagerProps {
  planId: string;
}

type Row = {
  id: string;
  funcao: string;
  status_confirmacao: string;
  resultado_presenca: 'presente' | 'falta' | 'justificado' | null;
  presenca_registrada_em: string | null;
  observacoes: string | null;
  pessoas: { nome_completo: string; email: string | null } | null;
};

const statusBadgeVariant = (status?: string) => {
  switch (status) {
    case 'Confirmado':
      return 'default' as const;
    case 'Recusado':
      return 'destructive' as const;
    case 'Convidado':
    default:
      return 'secondary' as const;
  }
};

const presencaBadge = (p: Row['resultado_presenca']) => {
  if (p === 'presente') return <Badge>Presente</Badge>;
  if (p === 'falta') return <Badge variant="destructive">Falta</Badge>;
  if (p === 'justificado') return <Badge variant="outline">Justificado</Badge>;
  return <Badge variant="secondary">Pendente</Badge>;
};

export const PresencaManager: React.FC<PresencaManagerProps> = ({ planId }) => {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('escalas_servico')
        .select(`
          id,
          funcao,
          status_confirmacao,
          resultado_presenca,
          presenca_registrada_em,
          observacoes,
          pessoas(nome_completo, email)
        `)
        .eq('plano_id', planId)
        .order('funcao', { ascending: true });
      if (error) throw error;
      setRows((data as any[]) || []);
    } catch (e: any) {
      toast({ title: 'Erro ao carregar', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [planId]);

  const grouped = useMemo(() => {
    const filtered = rows.filter(r => {
      const term = search.trim().toLowerCase();
      if (!term) return true;
      return (
        r.funcao?.toLowerCase().includes(term) ||
        r.pessoas?.nome_completo?.toLowerCase().includes(term)
      );
    });
    return filtered.reduce((acc: Record<string, Row[]>, r) => {
      acc[r.funcao] = acc[r.funcao] || [];
      acc[r.funcao].push(r);
      return acc;
    }, {});
  }, [rows, search]);

  const marcar = async (id: string, status: Row['resultado_presenca']) => {
    try {
      const { error } = await supabase
        .from('escalas_servico')
        .update({ 
          resultado_presenca: status, 
          presenca_registrada_em: new Date().toISOString() 
        })
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'Presença atualizada' });
      setRows(prev => prev.map(r => r.id === id ? { 
        ...r, 
        resultado_presenca: status, 
        presenca_registrada_em: new Date().toISOString() 
      } as Row : r));
    } catch (e: any) {
      toast({ title: 'Erro ao atualizar', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Presenças da Escala</span>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou função"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="text-sm text-muted-foreground">Carregando...</div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-sm text-muted-foreground">Nenhum convocado nesta escala.</div>
        ) : (
          Object.entries(grouped).map(([funcao, list]) => (
            <div key={funcao} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{funcao}</h4>
              </div>
              <div className="space-y-2">
                {list.map(item => (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{item.pessoas?.nome_completo || '—'}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <Badge variant={statusBadgeVariant(item.status_confirmacao)}>{item.status_confirmacao}</Badge>
                        {presencaBadge(item.resultado_presenca)}
                        {item.presenca_registrada_em && (
                          <span className="text-muted-foreground">em {new Date(item.presenca_registrada_em).toLocaleString('pt-BR')}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="default" onClick={() => marcar(item.id, 'presente')}>
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Presente
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => marcar(item.id, 'falta')}>
                        <XCircle className="h-4 w-4 mr-1" /> Falta
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => marcar(item.id, 'justificado')}>
                        <FileCheck2 className="h-4 w-4 mr-1" /> Justificado
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Separator />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default PresencaManager;
