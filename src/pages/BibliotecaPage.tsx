import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, BookOpen, Library, Users, TrendingUp, ArrowLeft } from 'lucide-react';
import { useBooks } from '@/hooks/useBooks';
import { useBibliotecaStats } from '@/hooks/useBibliotecaStats';
import BookCard from '@/components/biblioteca/BookCard';
import { Skeleton } from '@/components/ui/skeleton';
import { SolicitacaoEmprestimoDialog } from '@/components/biblioteca/SolicitacaoEmprestimoDialog';
import type { Book } from '@/hooks/useBooks';

const BibliotecaPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showSolicitacaoDialog, setShowSolicitacaoDialog] = useState(false);

  const { data: books, isLoading: booksLoading } = useBooks();
  const { data: stats, isLoading: statsLoading } = useBibliotecaStats();

  // Filtrar livros
  const filteredBooks = books?.filter(book => {
    const matchesSearch = 
      book.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.autor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.categoria?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || book.categoria === categoryFilter;
    const matchesStatus = statusFilter === 'all' || book.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  }) || [];

  // Obter categorias únicas
  const categories = books ? [...new Set(books.map(book => book.categoria).filter(Boolean))] : [];

  // Função para lidar com solicitação de empréstimo
  const handleRequestLoan = (book: Book) => {
    setSelectedBook(book);
    setShowSolicitacaoDialog(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <div className="bg-background border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para a Página Inicial
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-12 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Library className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">
              Biblioteca da Igreja
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore nosso acervo de livros cristãos, estudos bíblicos e recursos espirituais.
            Encontre seu próximo livro para crescimento espiritual.
          </p>
          
          {/* Estatísticas rápidas */}
          {statsLoading ? (
            <div className="flex justify-center gap-8 mt-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="text-center">
                  <Skeleton className="h-8 w-16 mx-auto mb-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : stats && (
            <div className="flex justify-center gap-8 mt-8 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{stats.totalLivros}</div>
                <div className="text-sm text-muted-foreground">Livros no Acervo</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.livrosDisponiveis}</div>
                <div className="text-sm text-muted-foreground">Disponíveis</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{stats.emprestimosAtivos}</div>
                <div className="text-sm text-muted-foreground">Emprestados</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Filtros */}
      <section className="py-8 px-4 border-b">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtrar Livros
              </CardTitle>
              <CardDescription>
                Use os filtros abaixo para encontrar exatamente o que procura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Busca por texto */}
                <div className="lg:col-span-2">
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

                {/* Filtro por categoria */}
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Categorias</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Filtro por status */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
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

              {/* Botão para limpar filtros */}
              <div className="flex gap-4 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                    setStatusFilter('all');
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>

              {/* Contador de resultados */}
              <div className="mt-4 text-sm text-muted-foreground">
                {booksLoading ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  `Mostrando ${filteredBooks.length} de ${books?.length || 0} livros`
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Grade de Livros */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {booksLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <Card key={i} className="h-96">
                  <CardHeader>
                    <Skeleton className="w-full h-48 mb-4" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map(book => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  showActions={true}
                  onRequestLoan={handleRequestLoan}
                />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum livro encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  Tente ajustar os filtros ou use termos de busca diferentes.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                    setStatusFilter('all');
                  }}
                >
                  Limpar Filtros
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Dialog de Solicitação de Empréstimo */}
      <SolicitacaoEmprestimoDialog
        open={showSolicitacaoDialog}
        onOpenChange={setShowSolicitacaoDialog}
        book={selectedBook}
      />

      {/* Seção de Categorias Populares */}
      {stats && stats.categoriasMaisPopulares.length > 0 && (
        <section className="py-8 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Categorias Populares</h2>
              <p className="text-muted-foreground">
                Explore nossas categorias com mais livros disponíveis
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3">
              {stats.categoriasMaisPopulares.map((categoria, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => setCategoryFilter(categoria.categoria)}
                >
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-medium">{categoria.categoria}</span>
                  <Badge variant="secondary" className="text-xs">
                    {categoria.count} livros
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default BibliotecaPage;