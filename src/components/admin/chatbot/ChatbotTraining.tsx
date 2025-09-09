import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Brain,
  ThumbsUp,
  ThumbsDown,
  Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TrainingItem {
  id: string;
  question: string;
  answer: string;
  source_type: string;
  confidence_score: number;
  user_feedback: number | null;
  active: boolean;
  created_at: string;
}

export const ChatbotTraining: React.FC = () => {
  const [trainingData, setTrainingData] = useState<TrainingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TrainingItem | null>(null);
  const [newItem, setNewItem] = useState({
    question: '',
    answer: '',
    source_type: 'manual'
  });
  
  const { toast } = useToast();

  const fetchTrainingData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chatbot_training')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrainingData(data || []);
    } catch (error) {
      console.error('Error fetching training data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de treinamento.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveTrainingItem = async () => {
    try {
      const itemData = {
        question: newItem.question,
        answer: newItem.answer,
        source_type: newItem.source_type,
        confidence_score: 1.0,
        active: true
      };

      let error;
      if (editingItem) {
        const { error: updateError } = await supabase
          .from('chatbot_training')
          .update(itemData)
          .eq('id', editingItem.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('chatbot_training')
          .insert([itemData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: editingItem ? "Treinamento atualizado com sucesso." : "Treinamento adicionado com sucesso.",
      });

      setIsAddModalOpen(false);
      setEditingItem(null);
      setNewItem({
        question: '',
        answer: '',
        source_type: 'manual'
      });
      
      fetchTrainingData();
    } catch (error) {
      console.error('Error saving training item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o item de treinamento.",
        variant: "destructive"
      });
    }
  };

  const deleteTrainingItem = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item de treinamento?')) return;

    try {
      const { error } = await supabase
        .from('chatbot_training')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Item de treinamento excluído com sucesso.",
      });

      fetchTrainingData();
    } catch (error) {
      console.error('Error deleting training item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o item.",
        variant: "destructive"
      });
    }
  };

  const updateFeedback = async (id: string, feedback: number) => {
    try {
      const { error } = await supabase
        .from('chatbot_training')
        .update({ user_feedback: feedback })
        .eq('id', id);

      if (error) throw error;
      fetchTrainingData();
    } catch (error) {
      console.error('Error updating feedback:', error);
    }
  };

  const filteredTrainingData = trainingData.filter(item => 
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEdit = (item: TrainingItem) => {
    setEditingItem(item);
    setNewItem({
      question: item.question,
      answer: item.answer,
      source_type: item.source_type
    });
    setIsAddModalOpen(true);
  };

  const getSourceTypeColor = (sourceType: string) => {
    switch (sourceType) {
      case 'manual': return 'bg-blue-500';
      case 'conversation': return 'bg-green-500';
      case 'imported': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  useEffect(() => {
    fetchTrainingData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Treinamento do Chatbot</h2>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingItem(null);
              setNewItem({
                question: '',
                answer: '',
                source_type: 'manual'
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Treinamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Editar Treinamento' : 'Adicionar Treinamento'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Pergunta</label>
                <Textarea
                  value={newItem.question}
                  onChange={(e) => setNewItem({...newItem, question: e.target.value})}
                  placeholder="Ex: Quais são os horários dos cultos?"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Resposta</label>
                <Textarea
                  value={newItem.answer}
                  onChange={(e) => setNewItem({...newItem, answer: e.target.value})}
                  placeholder="Ex: Os cultos acontecem aos domingos às 9h e 18h, e às quartas-feiras às 20h."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={saveTrainingItem}>
                  {editingItem ? 'Atualizar' : 'Salvar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar perguntas e respostas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Training Items */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Carregando dados de treinamento...
          </div>
        ) : filteredTrainingData.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Nenhum treinamento encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'Tente ajustar os termos de busca.'
                  : 'Comece adicionando perguntas e respostas para treinar o chatbot.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTrainingData.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className={`${getSourceTypeColor(item.source_type)} text-white text-xs`}
                      >
                        {item.source_type}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">Confiança:</span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round((item.confidence_score || 0) * 100)}%
                        </Badge>
                      </div>
                      {renderStars(item.user_feedback)}
                    </div>
                    <div>
                      <h3 className="font-medium text-sm mb-2">Pergunta:</h3>
                      <p className="text-sm text-muted-foreground">{item.question}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm mb-2">Resposta:</h3>
                      <p className="text-sm text-muted-foreground">{item.answer}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateFeedback(item.id, 5)}
                      title="Marcar como excelente"
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateFeedback(item.id, 1)}
                      title="Marcar como ruim"
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTrainingItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};