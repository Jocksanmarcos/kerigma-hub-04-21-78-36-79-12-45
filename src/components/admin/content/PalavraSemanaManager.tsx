import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Book,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PalavraSemana {
  id: string;
  versiculo: string;
  referencia: string;
  reflexao?: string;
  data_inicio: string;
  data_fim?: string;
  ativo: boolean;
  created_at: string;
}

export const PalavraSemanaManager: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPalavra, setEditingPalavra] = useState<PalavraSemana | null>(null);
  const [formData, setFormData] = useState({
    versiculo: '',
    referencia: '',
    reflexao: '',
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: '',
    ativo: true
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar palavras da semana
  const { data: palavras, isLoading } = useQuery({
    queryKey: ['palavra-semana'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('palavra_semana')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PalavraSemana[];
    }
  });

  // Mutação para salvar palavra da semana
  const savePalavra = useMutation({
    mutationFn: async (data: any) => {
      if (editingPalavra) {
        const { error } = await supabase
          .from('palavra_semana')
          .update(data)
          .eq('id', editingPalavra.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('palavra_semana')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: `Palavra da semana ${editingPalavra ? 'atualizada' : 'criada'} com sucesso!` });
      queryClient.invalidateQueries({ queryKey: ['palavra-semana'] });
      closeDialog();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro ao salvar palavra da semana', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  // Mutação para deletar palavra da semana
  const deletePalavra = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('palavra_semana')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Palavra da semana excluída com sucesso!' });
      queryClient.invalidateQueries({ queryKey: ['palavra-semana'] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro ao excluir palavra da semana', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  const openDialog = (palavra?: PalavraSemana) => {
    if (palavra) {
      setEditingPalavra(palavra);
      setFormData({
        versiculo: palavra.versiculo,
        referencia: palavra.referencia,
        reflexao: palavra.reflexao || '',
        data_inicio: palavra.data_inicio,
        data_fim: palavra.data_fim || '',
        ativo: palavra.ativo
      });
    } else {
      setEditingPalavra(null);
      setFormData({
        versiculo: '',
        referencia: '',
        reflexao: '',
        data_inicio: new Date().toISOString().split('T')[0],
        data_fim: '',
        ativo: true
      });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingPalavra(null);
  };

  const handleSubmit = () => {
    const data = {
      ...formData,
      data_fim: formData.data_fim || null,
      reflexao: formData.reflexao || null
    };
    savePalavra.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Palavra da Semana</h2>
          <p className="text-muted-foreground">Gerencie os versículos e reflexões semanais</p>
        </div>
        <Button onClick={() => openDialog()} className="bg-kerigma-gradient">
          <Plus className="h-4 w-4 mr-2" />
          Nova Palavra da Semana
        </Button>
      </div>

      {/* Lista de Palavras da Semana */}
      <div className="grid grid-cols-1 gap-4">
        {palavras?.map((palavra) => (
          <Card key={palavra.id} className="hover:shadow-kerigma transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <Book className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">{palavra.referencia}</h3>
                    {palavra.ativo ? (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </div>
                  
                  <blockquote className="border-l-4 border-primary pl-4 mb-4">
                    <p className="text-lg italic text-muted-foreground">
                      "{palavra.versiculo}"
                    </p>
                  </blockquote>
                  
                  {palavra.reflexao && (
                    <div className="mb-4">
                      <h4 className="font-medium text-sm mb-2">Reflexão:</h4>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {palavra.reflexao}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Início: {new Date(palavra.data_inicio).toLocaleDateString()}</span>
                    </div>
                    {palavra.data_fim && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Fim: {new Date(palavra.data_fim).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button variant="outline" size="sm" onClick={() => openDialog(palavra)}>
                    <Edit2 className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => deletePalavra.mutate(palavra.id)}
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de Criação/Edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPalavra ? 'Editar Palavra da Semana' : 'Nova Palavra da Semana'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="referencia">Referência Bíblica</Label>
                <Input
                  id="referencia"
                  value={formData.referencia}
                  onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                  placeholder="Ex: João 3:16"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="versiculo">Versículo</Label>
              <Textarea
                id="versiculo"
                rows={3}
                value={formData.versiculo}
                onChange={(e) => setFormData({ ...formData, versiculo: e.target.value })}
                placeholder="Digite o texto completo do versículo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reflexao">Reflexão (opcional)</Label>
              <Textarea
                id="reflexao"
                rows={4}
                value={formData.reflexao}
                onChange={(e) => setFormData({ ...formData, reflexao: e.target.value })}
                placeholder="Uma reflexão ou meditação sobre o versículo"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_inicio">Data de Início</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="data_fim">Data de Fim (opcional)</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={formData.data_fim}
                  onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
              />
              <Label htmlFor="ativo">Ativo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={savePalavra.isPending}>
              {savePalavra.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};