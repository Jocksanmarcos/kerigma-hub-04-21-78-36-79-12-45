import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, BookOpen, Calendar, Loader2, Hash } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useQuizzes, QuizQuestion } from '@/hooks/useQuizzes';
import { QuizForm } from '@/components/admin/quizzes/QuizForm';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles } from 'lucide-react';

const JornadaQuizzesPage: React.FC = () => {
  const { quizzes, loading, saving, createQuiz, updateQuiz, deleteQuiz, refreshQuizzes } = useQuizzes();
  const [showForm, setShowForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<QuizQuestion | null>(null);
  const [deletingQuiz, setDeletingQuiz] = useState<QuizQuestion | null>(null);
  const [referenceId, setReferenceId] = useState('');
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    document.title = "Gestão de Quizzes – Kerigma Hub";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Gerencie perguntas e quizzes da Jornada de Crescimento");
  }, []);

  const handleCreateQuiz = () => {
    setEditingQuiz(null);
    setShowForm(true);
  };

  const handleEditQuiz = (quiz: QuizQuestion) => {
    setEditingQuiz(quiz);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingQuiz(null);
  };

  const handleFormSubmit = async (formData: any) => {
    if (editingQuiz) {
      return await updateQuiz(editingQuiz.id, formData);
    } else {
      return await createQuiz(formData);
    }
  };

  const handleDeleteQuiz = (quiz: QuizQuestion) => {
    setDeletingQuiz(quiz);
  };

  const confirmDelete = async () => {
    if (deletingQuiz) {
      const success = await deleteQuiz(deletingQuiz.id);
      if (success) {
        setDeletingQuiz(null);
      }
    }
  };

  const handleGenerateQuizWithAI = async () => {
    try {
      if (!referenceId || referenceId.trim() === '') {
        toast({
          title: "Erro",
          description: "Por favor, insira uma referência bíblica.",
          variant: "destructive",
        });
        return;
      }

      setIsGeneratingQuiz(true);
      toast({
        title: "Gerando quiz...",
        description: `Gerando quiz para ${referenceId}... Isso pode levar alguns segundos.`,
      });

      const { data, error } = await supabase.functions.invoke('gerar-quiz-ia', {
        body: { chapterId: referenceId }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "✅ Sucesso!",
        description: data.message,
      });

      // Recarrega a lista de perguntas
      await refreshQuizzes();
      setReferenceId(''); // Limpa o campo

    } catch (error) {
      console.error("Erro ao gerar quiz com IA:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao gerar o quiz. Verifique os logs da função.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const renderOpcoesPreview = (opcoes: any) => {
    if (!opcoes || typeof opcoes !== 'object') return 'Nenhuma opção';
    
    const opcoesList = Array.isArray(opcoes) ? opcoes : [];
    if (opcoesList.length === 0) return 'Nenhuma opção';
    
    return opcoesList
      .slice(0, 2)
      .map(opcao => `${opcao.id}. ${opcao.texto}`)
      .join('; ') + (opcoesList.length > 2 ? '...' : '');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              Gestão de Quizzes
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie o banco de perguntas da Jornada de Crescimento
            </p>
          </div>
          <Button onClick={handleCreateQuiz}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Nova Pergunta
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Perguntas</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quizzes.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Referências Únicas</CardTitle>
              <Hash className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(quizzes.map(q => q.reference_id)).size}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Adicionadas Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {quizzes.filter(q => {
                  const today = new Date();
                  const questionDate = new Date(q.criado_em);
                  return questionDate.toDateString() === today.toDateString();
                }).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {quizzes.filter(q => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return new Date(q.criado_em) > weekAgo;
                }).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Quiz Generator */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-primary" />
              Gerador de Quiz com IA
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Gere automaticamente perguntas de múltipla escolha baseadas em capítulos bíblicos
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label htmlFor="reference-input" className="text-sm font-medium mb-2 block">
                  Referência Bíblica (ID)
                </label>
                <Input
                  id="reference-input"
                  type="text"
                  placeholder="Ex: JHN.3 para João 3, ROM.8 para Romanos 8"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use o formato ID da API.Bible (ex: GEN, EXO, PSA, MAT, JHN, ROM)
                </p>
              </div>
              <Button 
                onClick={handleGenerateQuizWithAI}
                disabled={isGeneratingQuiz || !referenceId.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                {isGeneratingQuiz ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar Perguntas com IA
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Perguntas Cadastradas</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pergunta</TableHead>
                    <TableHead>Referência</TableHead>
                    <TableHead>Opções</TableHead>
                    <TableHead>Resposta</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizzes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <BookOpen className="h-12 w-12 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            Nenhuma pergunta cadastrada ainda.
                          </p>
                          <Button variant="outline" onClick={handleCreateQuiz}>
                            Criar primeira pergunta
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    quizzes.map((quiz) => (
                      <TableRow key={quiz.id}>
                        <TableCell className="max-w-[300px]">
                          <div className="truncate" title={quiz.texto_pergunta}>
                            {quiz.texto_pergunta}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{quiz.reference_id}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <div className="text-sm text-muted-foreground truncate">
                            {renderOpcoesPreview(quiz.opcoes)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{quiz.resposta_correta}</Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(quiz.criado_em), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditQuiz(quiz)}
                              disabled={saving}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteQuiz(quiz)}
                              disabled={saving}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form Dialog */}
      <QuizForm
        isOpen={showForm}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        editingQuiz={editingQuiz}
        loading={saving}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingQuiz} onOpenChange={() => setDeletingQuiz(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta pergunta? Esta ação não pode ser desfeita.
              <br />
              <br />
              <strong>Pergunta:</strong> {deletingQuiz?.texto_pergunta}
              <br />
              <strong>Referência:</strong> {deletingQuiz?.reference_id}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default JornadaQuizzesPage;