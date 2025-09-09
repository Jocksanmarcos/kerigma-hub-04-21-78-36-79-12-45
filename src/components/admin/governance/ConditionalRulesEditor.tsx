import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const ConditionalRulesEditor: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: '',
    description: '',
    action: 'read',
    subject: 'all',
    resource_type: '',
    scope: 'global',
    profile_id: '',
    user_id: '',
    condition: '{"time_restriction":"08:00-18:00"}'
  });

  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('id,name').eq('active', true).order('level');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: rules } = useQuery({
    queryKey: ['abac-rules'],
    queryFn: async () => {
      const { data, error } = await supabase.from('abac_rules').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const createRule = useMutation({
    mutationFn: async () => {
      let conditionJson: any = {};
      try { conditionJson = JSON.parse(form.condition || '{}'); } catch {}
      const payload: any = {
        name: form.name,
        description: form.description || null,
        action: form.action,
        subject: form.subject,
        resource_type: form.resource_type || null,
        scope: form.scope,
        condition: conditionJson,
      };
      if (form.scope === 'profile' && form.profile_id) payload.profile_id = form.profile_id;
      if (form.scope === 'user' && form.user_id) payload.user_id = form.user_id;
      const { error } = await supabase.from('abac_rules').insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abac-rules'] });
      toast({ title: 'Regra criada', description: 'Regra ABAC salva com sucesso.' });
      setForm({ ...form, name: '', description: '', resource_type: '', condition: '{"time_restriction":"08:00-18:00"}' });
    },
    onError: () => toast({ title: 'Erro', description: 'Não foi possível salvar a regra.', variant: 'destructive' })
  });

  const toggleActive = useMutation({
    mutationFn: async (rule: any) => {
      const { error } = await supabase.from('abac_rules').update({ active: !rule.active }).eq('id', rule.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['abac-rules'] })
  });
  const tAction = (a: string) => ({
    read: 'Ler',
    create: 'Criar',
    update: 'Atualizar',
    delete: 'Excluir',
    manage: 'Gerenciar',
  } as Record<string, string>)[a] || a;

  const tScope = (s: string) => ({
    global: 'Global',
    profile: 'Perfil',
    user: 'Usuário',
  } as Record<string, string>)[s] || s;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nova Regra ABAC</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Horário Comercial" />
            </div>
            <div className="space-y-2">
              <Label>Ação</Label>
              <Select value={form.action} onValueChange={(v) => setForm({ ...form, action: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read">Ler</SelectItem>
                    <SelectItem value="create">Criar</SelectItem>
                    <SelectItem value="update">Atualizar</SelectItem>
                    <SelectItem value="delete">Excluir</SelectItem>
                    <SelectItem value="manage">Gerenciar</SelectItem>
                  </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assunto</Label>
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Ex: financeiro" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Descrição</Label>
              <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Recurso (opcional)</Label>
              <Input value={form.resource_type} onChange={(e) => setForm({ ...form, resource_type: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Escopo</Label>
              <Select value={form.scope} onValueChange={(v) => setForm({ ...form, scope: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="profile">Perfil</SelectItem>
                  <SelectItem value="user">Usuário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.scope === 'profile' && (
              <div className="space-y-2">
                <Label>Perfil</Label>
                <Select value={form.profile_id} onValueChange={(v) => setForm({ ...form, profile_id: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {profiles?.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {form.scope === 'user' && (
              <div className="space-y-2">
                <Label>ID do Usuário</Label>
                <Input value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} placeholder="UUID do usuário" />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Condição (JSON)</Label>
            <Textarea rows={3} value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} />
          </div>
          <div className="flex justify-end">
            <Button onClick={() => createRule.mutate()} disabled={!form.name || !form.action || !form.subject || createRule.isPending}>
              {createRule.isPending ? 'Salvando...' : 'Salvar Regra'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regras Existentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(rules || []).map((rule: any) => (
            <div key={rule.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{rule.name}</span>
                  <Badge variant={rule.active ? 'default' : 'secondary'}>{rule.active ? 'Ativa' : 'Inativa'}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">{tAction(rule.action)} {rule.subject} {rule.resource_type ? `(${rule.resource_type})` : ''} • {tScope(rule.scope)}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => toggleActive.mutate(rule)}>
                  {rule.active ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
