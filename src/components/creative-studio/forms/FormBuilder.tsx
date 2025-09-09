import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { MoveUp, MoveDown, Plus, Trash2 } from "lucide-react";

// Types
type FieldType = "short_text" | "multiple_choice" | "file_upload";

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  key: string;
  options?: string[];
  required?: boolean;
}

interface FormRecord {
  id: string;
  titulo: string;
  estrutura_json: { fields: FormField[] };
  acao_pos_submissao: any;
}

const emptyStructure = { fields: [] as FormField[] };

const FormBuilder: React.FC = () => {
  const { toast } = useToast();
  const [forms, setForms] = useState<FormRecord[]>([]);
  const [selected, setSelected] = useState<FormRecord | null>(null);
  const [newTitle, setNewTitle] = useState("");

  async function loadForms() {
    const { data, error } = await supabase.from("formularios").select("id, titulo, estrutura_json, acao_pos_submissao").order("updated_at", { ascending: false });
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    setForms((data || []) as any);
  }

  useEffect(() => {
    loadForms();
  }, []);

  async function createForm() {
    if (!newTitle.trim()) return;
    const { data, error } = await (supabase as any)
      .from("formularios")
      .insert({ titulo: newTitle.trim(), estrutura_json: emptyStructure as any, acao_pos_submissao: [] as any })
      .select()
      .single();
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    setNewTitle("");
    await loadForms();
    setSelected(data as any);
  }

  function addField(type: FieldType) {
    if (!selected) return;
    const fields = [...(selected.estrutura_json?.fields || [])];
    const id = crypto.randomUUID();
    const key = `campo_${fields.length + 1}`;
    const base: FormField = { id, type, label: "Novo campo", key, required: false };
    if (type === "multiple_choice") base.options = ["Opção 1", "Opção 2"]; 
    const updated = { ...selected, estrutura_json: { fields: [...fields, base] } } as FormRecord;
    setSelected(updated);
  }

  function removeField(fid: string) {
    if (!selected) return;
    const fields = (selected.estrutura_json?.fields || []).filter((f) => f.id !== fid);
    setSelected({ ...selected, estrutura_json: { fields } });
  }

  function moveField(fid: string, dir: -1 | 1) {
    if (!selected) return;
    const fields = [...(selected.estrutura_json?.fields || [])];
    const idx = fields.findIndex((f) => f.id === fid);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= fields.length) return;
    [fields[idx], fields[swap]] = [fields[swap], fields[idx]];
    setSelected({ ...selected, estrutura_json: { fields } });
  }

  async function saveForm() {
    if (!selected) return;
    const { error } = await (supabase as any)
      .from("formularios")
      .update({ titulo: selected.titulo, estrutura_json: selected.estrutura_json as any, acao_pos_submissao: selected.acao_pos_submissao as any })
      .eq("id", selected.id);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    toast({ title: "Formulário salvo" });
    loadForms();
  }

  const FieldPalette = () => (
    <div className="space-y-2">
      <Label>Paleta de Campos</Label>
      <div className="grid grid-cols-1 gap-2">
        <Button variant="secondary" onClick={() => addField("short_text")}>Texto Curto</Button>
        <Button variant="secondary" onClick={() => addField("multiple_choice")}>Múltipla Escolha</Button>
        <Button variant="secondary" onClick={() => addField("file_upload")}>Upload de Ficheiro</Button>
      </div>
    </div>
  );

  const ActionsPanel = () => {
    const [actionType, setActionType] = useState<string>(() => {
      const a = (selected?.acao_pos_submissao || [])[0];
      return a?.type || "none";
    });
    const [mapping, setMapping] = useState<any>(() => {
      const a = (selected?.acao_pos_submissao || [])[0];
      return a?.mapping || { nome_completo: "", email: "", telefone: "", tags: ["Candidato a Batismo"] };
    });

    useEffect(() => {
      const a = (selected?.acao_pos_submissao || [])[0];
      setActionType(a?.type || "none");
      setMapping(a?.mapping || { nome_completo: "", email: "", telefone: "", tags: ["Candidato a Batismo"] });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected?.id]);

    function saveAction() {
      if (!selected) return;
      const actions = actionType === "none" ? [] : [ { type: actionType, mapping } ];
      const updated = { ...selected, acao_pos_submissao: actions } as FormRecord;
      setSelected(updated);
      toast({ title: "Ação configurada" });
    }

    const fieldKeys = useMemo(() => (selected?.estrutura_json?.fields || []).map((f) => f.key), [selected]);

    return (
      <div className="space-y-3">
        <Label>Ações e Integrações</Label>
        <Select value={actionType} onValueChange={setActionType}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma ação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhuma</SelectItem>
            <SelectItem value="create_person">Cadastrar Pessoa</SelectItem>
          </SelectContent>
        </Select>

        {actionType !== "none" && (
          <div className="grid grid-cols-1 gap-3">
            <div>
              <Label>Nome completo ← campo</Label>
              <Select value={mapping.nome_completo} onValueChange={(v) => setMapping((m: any) => ({ ...m, nome_completo: v }))}>
                <SelectTrigger><SelectValue placeholder="mapear" /></SelectTrigger>
                <SelectContent>
                  {fieldKeys.map((k) => (<SelectItem key={k} value={k}>{k}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Email ← campo</Label>
              <Select value={mapping.email} onValueChange={(v) => setMapping((m: any) => ({ ...m, email: v }))}>
                <SelectTrigger><SelectValue placeholder="mapear" /></SelectTrigger>
                <SelectContent>
                  {fieldKeys.map((k) => (<SelectItem key={k} value={k}>{k}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Telefone ← campo</Label>
              <Select value={mapping.telefone} onValueChange={(v) => setMapping((m: any) => ({ ...m, telefone: v }))}>
                <SelectTrigger><SelectValue placeholder="mapear" /></SelectTrigger>
                <SelectContent>
                  {fieldKeys.map((k) => (<SelectItem key={k} value={k}>{k}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tags (separadas por vírgula)</Label>
              <Input value={(mapping.tags || []).join(", ")} onChange={(e) => setMapping((m: any) => ({ ...m, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) }))} />
            </div>
            <Button type="button" onClick={saveAction}>Guardar Ação</Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div className="lg:col-span-1 space-y-3">
        <Card className="sticky top-2">
          <CardHeader><CardTitle>Formulários</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input placeholder="Título do formulário" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
              <Button onClick={createForm}><Plus className="h-4 w-4" /></Button>
            </div>
            <Separator />
            <div className="space-y-2">
              {forms.map((f) => (
                <Button key={f.id} variant={selected?.id === f.id ? "default" : "secondary"} className="w-full justify-start" onClick={() => setSelected(f)}>
                  {f.titulo}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3">
        {!selected ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">Selecione ou crie um formulário.</CardContent></Card>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Editor Visual</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1 space-y-4 sticky top-2">
                    <Card>
                      <CardContent>
                        <FieldPalette />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent>
                        <ActionsPanel />
                      </CardContent>
                    </Card>
                  </div>

                  <div className="md:col-span-2">
                    <div className="rounded-md border border-border p-3 space-y-3">
                      {(selected.estrutura_json?.fields || []).map((f, idx) => (
                        <div key={f.id} className="rounded-md border border-border p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button size="icon" variant="ghost" onClick={() => moveField(f.id, -1)}><MoveUp className="h-4 w-4" /></Button>
                              <Button size="icon" variant="ghost" onClick={() => moveField(f.id, 1)}><MoveDown className="h-4 w-4" /></Button>
                            </div>
                            <Button size="icon" variant="ghost" onClick={() => removeField(f.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-3">
                            <div>
                              <Label>Rótulo</Label>
                              <Input value={f.label} onChange={(e) => {
                                const fields = [...(selected.estrutura_json?.fields || [])];
                                fields[idx] = { ...f, label: e.target.value };
                                setSelected({ ...selected, estrutura_json: { fields } });
                              }} />
                            </div>
                            <div>
                              <Label>Chave</Label>
                              <Input value={f.key} onChange={(e) => {
                                const fields = [...(selected.estrutura_json?.fields || [])];
                                fields[idx] = { ...f, key: e.target.value };
                                setSelected({ ...selected, estrutura_json: { fields } });
                              }} />
                            </div>
                          </div>
                          {f.type === "multiple_choice" && (
                            <div className="mt-3">
                              <Label>Opções (separadas por vírgula)</Label>
                              <Input value={(f.options || []).join(", ")} onChange={(e) => {
                                const fields = [...(selected.estrutura_json?.fields || [])];
                                fields[idx] = { ...f, options: e.target.value.split(",").map((o) => o.trim()).filter(Boolean) };
                                setSelected({ ...selected, estrutura_json: { fields } });
                              }} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Input className="max-w-sm" value={selected.titulo} onChange={(e) => setSelected({ ...selected, titulo: e.target.value })} />
                      <Button onClick={saveForm}>Guardar Formulário</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormBuilder;
