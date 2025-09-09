import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { format, addMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Agendamento {
  id: string;
  titulo: string | null;
  data_hora_inicio: string;
}

interface PlanoCulto {
  id: string;
  tema_culto: string;
  agendamento_id: string | null;
  agendamentos?: {
    titulo: string | null;
    data_hora_inicio: string | null;
  } | null;
  dirigente?: { nome_completo: string }[] | null;
  pregador?: { nome_completo: string }[] | null;
}

interface EscalaServicoRow {
  id: string;
  plano_id: string;
  funcao: string;
  pessoas?: { nome_completo: string } | null;
}

const FUNCOES_PADRAO = [
  "Dirigente",
  "Pregador",
  "Líder de Louvor",
  "Vocal",
  "Teclado",
  "Guitarra",
  "Baixo",
  "Bateria",
  "Diácono",
];

const roleMatch = (funcao: string, alvo: string) => {
  const f = funcao.toLowerCase();
  const a = alvo.toLowerCase();
  return f.includes(a) || a.includes(f);
};

const nameFromPlano = (plano: PlanoCulto, role: string) => {
  if (role === "Dirigente") return plano.dirigente?.[0]?.nome_completo || "—";
  if (role === "Pregador") return plano.pregador?.[0]?.nome_completo || "—";
  return "";
};

const monthLabel = (d: Date) => format(d, "MMMM 'de' yyyy", { locale: ptBR });

const MonthlyMatrixView: React.FC = () => {
  const { toast } = useToast();
  const [mesBase, setMesBase] = useState<Date>(startOfMonth(new Date()));
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [planos, setPlanos] = useState<PlanoCulto[]>([]);
  const [escala, setEscala] = useState<EscalaServicoRow[]>([]);
  const [loading, setLoading] = useState(false);

  const primeiroDia = startOfMonth(mesBase);
  const ultimoDia = endOfMonth(mesBase);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        
        // Use a timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout: A operação demorou muito para responder')), 15000)
        );
        
        // 1) Agendamentos do mês with simpler query to avoid RLS recursion
        const agendamentosPromise = supabase
          .from("agendamentos")
          .select("id, titulo, data_hora_inicio")
          .gte("data_hora_inicio", primeiroDia.toISOString())
          .lt("data_hora_inicio", addMonths(primeiroDia, 1).toISOString())
          .order("data_hora_inicio", { ascending: true });

        const { data: ags, error: e1 } = await Promise.race([
          agendamentosPromise,
          timeoutPromise
        ]) as any;
        
        if (e1) {
          console.error('Erro ao buscar agendamentos:', e1);
          throw new Error(`Erro ao carregar agendamentos: ${e1.message}`);
        }
        
        const agIds = (ags || []).map((a) => a.id);
        setAgendamentos((ags as any) || []);

        if (agIds.length === 0) {
          setPlanos([]);
          setEscala([]);
          return;
        }

        // 2) Planos de culto vinculados a esses agendamentos
        const planosPromise = supabase
          .from("culto_planos")
          .select(`
            id, tema_culto, agendamento_id,
            agendamentos ( titulo, data_hora_inicio ),
            dirigente:pessoas!dirigente_id ( nome_completo ),
            pregador:pessoas!pregador_id ( nome_completo )
          `)
          .in("agendamento_id", agIds);
          
        const { data: pls, error: e2 } = await Promise.race([
          planosPromise,
          timeoutPromise
        ]) as any;
        
        if (e2) {
          console.error('Erro ao buscar planos de culto:', e2);
          throw new Error(`Erro ao carregar planos de culto: ${e2.message}`);
        }
        
        const planIds = (pls || []).map((p: any) => p.id);
        setPlanos((pls as any) || []);

        // 3) Escalas de serviço para estes planos
        let escalasData: any[] = [];
        if (planIds.length > 0) {
          const escalasPromise = supabase
            .from("escalas_servico")
            .select(`id, plano_id, funcao, pessoas: pessoas ( nome_completo )`)
            .in("plano_id", planIds);
            
          const { data: esc, error: e3 } = await Promise.race([
            escalasPromise,
            timeoutPromise
          ]) as any;
          
          if (e3) {
            console.error('Erro ao buscar escalas:', e3);
            // Don't throw here, escalas são opcionais
            setEscala([]);
          } else {
            escalasData = esc || [];
            setEscala(escalasData);
          }
        } else {
          setEscala([]);
        }
        
        console.log('Matriz carregada com sucesso:', {
          agendamentos: agIds.length,
          planos: planIds.length,
          escalas: escalasData.length
        });
        
      } catch (err: any) {
        console.error('Erro ao carregar matriz:', err);
        const errorMessage = err.message || 'Erro desconhecido ao carregar dados';
        toast({ 
          title: "Erro ao carregar matriz", 
          description: errorMessage, 
          variant: "destructive" 
        });
        
        // Reset data on error
        setAgendamentos([]);
        setPlanos([]);
        setEscala([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [mesBase, toast]);

  const colunas = useMemo(() => {
    // Colunas = agendamentos que têm um plano vinculado
    const byAgId: Record<string, PlanoCulto | undefined> = {};
    planos.forEach((p) => { if (p.agendamento_id) byAgId[p.agendamento_id] = p; });
    const cols = agendamentos
      .filter((a) => byAgId[a.id])
      .map((a) => ({
        ag: a,
        plano: byAgId[a.id]!,
      }));
    return cols;
  }, [agendamentos, planos]);

  const getNomePara = (plano: PlanoCulto, role: string) => {
    // 1) Dirigente/Pregador direto do plano
    const direto = nameFromPlano(plano, role);
    if (direto) return direto;

    // 2) Buscar em escalas_servico por função
    const match = escala.find(
      (e) => e.plano_id === plano.id && roleMatch(e.funcao || "", role)
    );
    return match?.pessoas?.nome_completo || "—";
  };

  const gerarPDF = async () => {
    try {
      const pdfMake = (await import("pdfmake/build/pdfmake.js")) as any;
      const pdfFonts = await import("pdfmake/build/vfs_fonts.js");
      (pdfMake as any).default.vfs = (pdfFonts as any).default.pdfMake.vfs;

      const body: any[] = [];
      // Header row
      body.push([
        { text: "Função", style: "th" },
        ...colunas.map((c) => ({ text: format(new Date(c.ag.data_hora_inicio), "dd/MM (EEE)", { locale: ptBR }), style: "th" }))
      ]);
      // Rows
      FUNCOES_PADRAO.forEach((func) => {
        body.push([
          { text: func, style: "tdBold" },
          ...colunas.map((c) => ({ text: getNomePara(c.plano, func) || "—", style: "td" }))
        ]);
      });

      const docDef = {
        pageOrientation: "landscape",
        content: [
          { text: `Escala Mensal – ${monthLabel(primeiroDia)}`, style: "title", margin: [0,0,0,10] },
          { table: { headerRows: 1, widths: ["*", ...colunas.map(() => "*")], body } }
        ],
        styles: {
          title: { fontSize: 16, bold: true },
          th: { bold: true, fillColor: "#F3F4F6" },
          td: { fontSize: 10 },
          tdBold: { bold: true }
        }
      } as any;
      (pdfMake as any).default.createPdf(docDef).download(`escala-${format(primeiroDia, "yyyy-MM")}.pdf`);
    } catch (e: any) {
      toast({ title: "Erro ao gerar PDF", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Visão Matriz – {monthLabel(primeiroDia)}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setMesBase((d) => addMonths(d, -1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setMesBase((d) => addMonths(d, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={gerarPDF} className="flex items-center gap-2">
              <Download className="h-4 w-4" /> PDF do mês
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando matriz...</div>
          ) : colunas.length === 0 ? (
            <div className="text-center py-8">Sem cultos com plano neste mês.</div>
          ) : (
            <div className="overflow-auto">
              <div className="min-w-[800px]">
                <div className="grid" style={{ gridTemplateColumns: `220px repeat(${colunas.length}, minmax(180px, 1fr))` }}>
                  {/* Cabeçalho */}
                  <div className="sticky left-0 bg-background font-semibold p-2 border">Função</div>
                  {colunas.map((c) => (
                    <div key={c.ag.id} className="p-2 border text-sm">
                      <div className="font-semibold">{format(new Date(c.ag.data_hora_inicio), "dd 'de' MMMM", { locale: ptBR })}</div>
                      <div className="text-muted-foreground truncate">{c.plano.tema_culto || c.ag.titulo || "Culto"}</div>
                    </div>
                  ))}

                  {/* Linhas */}
                  {FUNCOES_PADRAO.map((f) => (
                    <React.Fragment key={f}>
                      <div className="sticky left-0 bg-muted/40 p-2 border font-medium">{f}</div>
                      {colunas.map((c) => (
                        <div key={`${f}-${c.plano.id}`} className="p-2 border text-sm">
                          {getNomePara(c.plano, f)}
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyMatrixView;
