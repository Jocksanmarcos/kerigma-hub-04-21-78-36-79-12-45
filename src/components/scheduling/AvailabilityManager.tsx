import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Plus, Trash2 } from "lucide-react";

interface AvailabilityManagerProps {
  title?: string;
}

type Entry = {
  id: string;
  data_inicio: string;
  data_fim: string;
  disponivel: boolean;
  motivo: string | null;
};

export const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({ title = "Minha Disponibilidade" }) => {
  const { toast } = useToast();
  const [personId, setPersonId] = useState<string | null>(null);
  const [items, setItems] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [inicio, setInicio] = useState<string>("");
  const [fim, setFim] = useState<string>("");
  const [motivo, setMotivo] = useState<string>("");

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: pessoa, error: pessoaErr } = await supabase
          .from('pessoas')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        if (pessoaErr) throw pessoaErr;
        if (!pessoa) return;
        setPersonId(pessoa.id);
        await loadEntries(pessoa.id);
      } catch (e: any) {
        toast({ title: 'Erro ao iniciar', description: e.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const loadEntries = async (pessoaId?: string) => {
    const pid = pessoaId || personId;
    if (!pid) return;
    const { data, error } = await supabase
      .from('disponibilidade_voluntarios')
      .select('id, data_inicio, data_fim, disponivel, motivo')
      .eq('pessoa_id', pid)
      .order('data_inicio', { ascending: false });
    if (error) throw error;
    setItems((data as any[]) || []);
  };

  const addEntry = async () => {
    try {
      if (!personId) return;
      if (!inicio || !fim) {
        toast({ title: 'Preencha as datas', variant: 'destructive' });
        return;
      }
      if (new Date(inicio) > new Date(fim)) {
        toast({ title: 'Intervalo inválido', description: 'Data inicial após a final.' , variant: 'destructive' });
        return;
      }
      const { error } = await supabase
        .from('disponibilidade_voluntarios')
        .insert({
          pessoa_id: personId,
          data_inicio: inicio,
          data_fim: fim,
          disponivel: false,
          motivo: motivo || null,
        });
      if (error) throw error;
      toast({ title: 'Indisponibilidade registrada' });
      setInicio(''); setFim(''); setMotivo('');
      await loadEntries();
    } catch (e: any) {
      toast({ title: 'Erro ao salvar', description: e.message, variant: 'destructive' });
    }
  };

  const removeEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('disponibilidade_voluntarios')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'Registro removido' });
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (e: any) {
      toast({ title: 'Erro ao remover', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Form */}
        <div className="grid sm:grid-cols-3 gap-3 items-end">
          <div>
            <Label htmlFor="inicio">Início</Label>
            <Input id="inicio" type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="fim">Fim</Label>
            <Input id="fim" type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
          </div>
          <div className="sm:col-span-3 grid sm:grid-cols-[1fr_auto] gap-3">
            <Input
              placeholder="Motivo (visível apenas para liderança)"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
            <Button onClick={addEntry} className="h-10">
              <Plus className="h-4 w-4 mr-2" /> Registrar
            </Button>
          </div>
        </div>

        <Separator />

        {/* List */}
        {loading ? (
          <div className="text-sm text-muted-foreground">Carregando...</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted-foreground">Nenhum período de indisponibilidade cadastrado.</div>
        ) : (
          <div className="space-y-2">
            {items.map((i) => (
              <div key={i.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border rounded-lg p-3">
                <div>
                  <div className="font-medium">
                    {new Date(i.data_inicio).toLocaleDateString('pt-BR')} — {new Date(i.data_fim).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {i.motivo || 'Sem motivo informado'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => removeEntry(i.id)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Remover
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AvailabilityManager;
