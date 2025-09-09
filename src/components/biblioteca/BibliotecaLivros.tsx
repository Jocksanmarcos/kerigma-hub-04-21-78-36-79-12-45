import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import { useBooks, useUpdateBook } from '@/hooks/useBooks';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CadastroLivroDialog from './CadastroLivroDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const BibliotecaLivros = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  const { data: livros, isLoading } = useBooks();
  const updateBookMutation = useUpdateBook();
  const { toast } = useToast();

  const filteredLivros = livros?.filter(livro => {
    const matchesSearch = 
      livro.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      livro.autor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      livro.categoria?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || livro.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Disponível':
        return 'bg-green-500';
      case 'Emprestado':
        return 'bg-yellow-500';
      case 'Em Manutenção':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    return status;
  };

  const categorias = livros ? [...new Set(livros.map(l => l.categoria).filter(Boolean))] : [];

  const handleViewBook = (livro: any) => {
    setSelectedBook(livro);
    setShowViewDialog(true);
  };

  const handleEditBook = (livro: any) => {
    setSelectedBook(livro);
    setShowEditDialog(true);
  };

  const handleDeleteBook = async (livro: any) => {
    try {
      await updateBookMutation.mutateAsync({
        id: livro.id,
        updates: { ativo: false }
      });
      toast({
        title: "Livro excluído",
        description: "O livro foi removido do acervo com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir livro",
        description: "Não foi possível excluir o livro. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Acervo da Biblioteca</CardTitle>
          <CardDescription>
            Gerencie todos os livros da biblioteca
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, autor ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="Disponível">Disponível</SelectItem>
                <SelectItem value="Emprestado">Emprestado</SelectItem>
                <SelectItem value="Em Manutenção">Em Manutenção</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLivros.map((livro) => (
                <Card key={livro.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{livro.titulo}</CardTitle>
                        <CardDescription className="mt-1">
                          por {livro.autor || 'Autor não informado'}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`${getStatusColor(livro.status)} text-white`}
                      >
                        {getStatusLabel(livro.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {livro.imagem_capa_url && (
                      <div className="mb-4">
                        <img 
                          src={livro.imagem_capa_url} 
                          alt={livro.titulo}
                          className="w-full h-32 object-cover rounded-md"
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Categoria:</span> {livro.categoria || 'Não informada'}
                      </div>
                      <div>
                        <span className="font-medium">Editora:</span> {livro.editora || 'Não informada'}
                      </div>
                      <div>
                        <span className="font-medium">Ano:</span> {livro.ano_publicacao || 'Não informado'}
                      </div>
                    </div>

                    {livro.sinopse && (
                      <div className="mt-3">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {livro.sinopse}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => handleViewBook(livro)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditBook(livro)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o livro "{livro.titulo}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteBook(livro)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredLivros.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum livro encontrado</h3>
              <p className="text-muted-foreground">
                Tente ajustar os filtros ou adicione novos livros à biblioteca.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para visualizar detalhes do livro */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Livro</DialogTitle>
          </DialogHeader>
          {selectedBook && (
            <div className="space-y-4">
              {selectedBook.imagem_capa_url && (
                <div className="flex justify-center">
                  <img 
                    src={selectedBook.imagem_capa_url} 
                    alt={selectedBook.titulo}
                    className="w-32 h-48 object-cover rounded-md"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Título:</strong> {selectedBook.titulo}
                </div>
                <div>
                  <strong>Autor:</strong> {selectedBook.autor || 'Não informado'}
                </div>
                <div>
                  <strong>Editora:</strong> {selectedBook.editora || 'Não informada'}
                </div>
                <div>
                  <strong>Ano:</strong> {selectedBook.ano_publicacao || 'Não informado'}
                </div>
                <div>
                  <strong>Categoria:</strong> {selectedBook.categoria || 'Não informada'}
                </div>
                <div>
                  <strong>Status:</strong> {selectedBook.status}
                </div>
                <div>
                  <strong>ISBN:</strong> {selectedBook.isbn || 'Não informado'}
                </div>
                <div>
                  <strong>Páginas:</strong> {selectedBook.numero_paginas || 'Não informado'}
                </div>
              </div>
              {selectedBook.sinopse && (
                <div>
                  <strong>Sinopse:</strong>
                  <p className="mt-2 text-sm text-muted-foreground">{selectedBook.sinopse}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para editar livro */}
      <CadastroLivroDialog 
        open={showEditDialog} 
        onOpenChange={setShowEditDialog}
        bookToEdit={selectedBook}
      />
    </div>
  );
};

export default BibliotecaLivros;