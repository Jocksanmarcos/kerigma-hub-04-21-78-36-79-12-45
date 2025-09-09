import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, User, Calendar, Tag } from 'lucide-react';
import type { Book } from '@/hooks/useBooks';

interface BookCardProps {
  book: Book;
  showActions?: boolean;
  onRequestLoan?: (book: Book) => void;
}

const BookCard = ({ book, showActions = false, onRequestLoan }: BookCardProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'disponivel':
        return (
          <Badge className="bg-green-500 text-white hover:bg-green-600">
            Disponível
          </Badge>
        );
      case 'emprestado':
        return (
          <Badge className="bg-red-500 text-white hover:bg-red-600">
            Emprestado
          </Badge>
        );
      case 'em manutencao':
        return (
          <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">
            Em Manutenção
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        );
    }
  };

  const getFormatBadge = (status: string) => {
    switch (status) {
      case 'Disponível':
        return (
          <Badge className="bg-green-500 text-white hover:bg-green-600">
            Disponível
          </Badge>
        );
      case 'Emprestado':
        return (
          <Badge className="bg-red-500 text-white hover:bg-red-600">
            Emprestado
          </Badge>
        );
      case 'Em Manutenção':
        return (
          <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">
            Em Manutenção
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        );
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200 group">
      <CardHeader className="pb-3">
        {book.imagem_capa_url && (
          <div className="w-full h-48 mb-4 overflow-hidden rounded-md bg-muted">
            <img 
              src={book.imagem_capa_url} 
              alt={`Capa do livro ${book.titulo}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        
        <div className="space-y-2">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2">
            {book.titulo}
          </h3>
          
          {book.autor && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{book.autor}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        <div className="flex flex-wrap gap-2">
          {getFormatBadge(book.status)}
        </div>

        {book.categoria && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Tag className="h-3 w-3" />
            <span>{book.categoria}</span>
          </div>
        )}

        {book.ano_publicacao && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{book.ano_publicacao}</span>
          </div>
        )}

        {book.editora && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Editora:</span> {book.editora}
          </div>
        )}

        {book.sinopse && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {book.sinopse}
          </p>
        )}

        {showActions && (
          <div className="pt-2 border-t">
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full"
              disabled={book.status !== 'Disponível'}
              onClick={() => onRequestLoan?.(book)}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {book.status === 'Disponível' ? 'Solicitar Empréstimo' : 'Indisponível'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookCard;