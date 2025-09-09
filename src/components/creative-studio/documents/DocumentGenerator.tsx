import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

function replacePlaceholders(template: string, data: Record<string, any>) {
  return template.replace(/{{\s*([^}]+)\s*}}/g, (_, key) => {
    const value = key.split(".").reduce((acc: any, k: string) => acc?.[k], data);
    return value == null ? "" : String(value);
  });
}

const DocumentGenerator: React.FC = () => {
  const { toast } = useToast();
  const [models, setModels] = useState<any[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<any | null>(null);
  const [personQuery, setPersonQuery] = useState("");
  const [people, setPeople] = useState<any[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("documentos_modelos").select("id, titulo, conteudo_template").order("updated_at", { ascending: false });
      if (!error) setModels(data || []);
    })();
  }, []);

  useEffect(() => {
    setSelectedModel(models.find((m) => m.id === selectedModelId) || null);
  }, [selectedModelId, models]);

  async function searchPeople(q: string) {
    setPersonQuery(q);
    if (!q || q.length < 2) { setPeople([]); return; }
    const { data, error } = await supabase
      .from("pessoas")
      .select("id, nome_completo, email, data_batismo, congregacao_id")
      .ilike("nome_completo", `%${q}%`)
      .limit(10);
    if (!error) setPeople(data || []);
  }

  const filledHtml = useMemo(() => {
    if (!selectedModel) return "";
    const base = selectedModel.conteudo_template as string;
    const data = selectedPerson || {};
    return replacePlaceholders(base, data);
  }, [selectedModel, selectedPerson]);

  function handlePrint() {
    if (!filledHtml) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!doctype html><html><head><meta charset='utf-8' /><title>Documento</title></head><body>${filledHtml}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div className="lg:col-span-1 space-y-3 sticky top-2">
        <Card>
          <CardHeader><CardTitle>Modelos</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {models.map((m) => (
              <Button key={m.id} variant={selectedModelId === m.id ? "default" : "secondary"} className="w-full justify-start" onClick={() => setSelectedModelId(m.id)}>
                {m.titulo}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pessoa</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Input placeholder="Nome do membro" value={personQuery} onChange={(e) => searchPeople(e.target.value)} />
            {people.length > 0 && (
              <div className="rounded-md border border-border max-h-60 overflow-auto">
                {people.map((p) => (
                  <button key={p.id} className="w-full text-left px-3 py-2 hover:bg-muted" onClick={() => { setSelectedPerson(p); setPersonQuery(p.nome_completo); setPeople([]); }}>
                    {p.nome_completo}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3">
        {!selectedModel ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">Selecione um modelo de documento.</CardContent></Card>
        ) : (
          <Card>
            <CardHeader><CardTitle>Pré-visualização</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-md border border-border p-4 bg-background max-h-[60vh] overflow-auto" dangerouslySetInnerHTML={{ __html: filledHtml }} />
              <div className="flex gap-2">
                <Button onClick={handlePrint}>Gerar PDF</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DocumentGenerator;
