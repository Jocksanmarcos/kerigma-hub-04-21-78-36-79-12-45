import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SchedulingDashboard } from "@/components/scheduling/SchedulingDashboard";

interface PlanoWithAgenda {
  id: string;
  tema_culto: string;
  agendamentos?: {
    data_hora_inicio: string | null;
    titulo: string | null;
  } | null;
}

const ConvocacaoInteligenteTab: React.FC = () => {
  const { toast } = useToast();
  const [planos, setPlanos] = useState<PlanoWithAgenda[]>([]);
  const [selecionado, setSelecionado] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("culto_planos")
          .select(`id, tema_culto, agendamentos ( data_hora_inicio, titulo )`)
          .order("created_at", { ascending: false })
          .limit(50);
        if (error) throw error;
        setPlanos((data as any) || []);
        if (data && data.length) setSelecionado(data[0].id);
      } catch (e: any) {
        toast({ title: "Erro ao carregar planos", description: e.message, variant: "destructive" });
      }
    };
    load();
  }, []);

  const plano = planos.find(p => p.id === selecionado);
  const serviceDate = plano?.agendamentos?.data_hora_inicio?.split("T")[0] || new Date().toISOString().split("T")[0];
  const title = plano ? `${plano.tema_culto}` : "Culto";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Plano de Culto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <Select value={selecionado} onValueChange={setSelecionado}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um plano" />
              </SelectTrigger>
              <SelectContent>
                {planos.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.tema_culto} {p.agendamentos?.data_hora_inicio ? `— ${new Date(p.agendamentos.data_hora_inicio).toLocaleDateString('pt-BR')}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selecionado && (
        <SchedulingDashboard 
          planId={selecionado}
          planTitle={title}
          serviceDate={serviceDate}
          userRole="leader"
        />
      )}
    </div>
  );
};

export default ConvocacaoInteligenteTab;
