import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Calendar, User, BookOpen, AlertCircle } from 'lucide-react';
import { useLoans, useReturnBook } from '@/hooks/useBooks';
import { Skeleton } from '@/components/ui/skeleton';
import { format, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const BibliotecaEmprestimos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { data: emprestimos, isLoading } = useLoans();
  const returnBookMutation = useReturnBook();

  const filteredEmprestimos = emprestimos?.filter(emprestimo => {
    const status = getStatus(emprestimo);
    const matchesSearch = 
      emprestimo.book?.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emprestimo.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatus = (emprestimo: any) => {
    if (emprestimo.return_date) return 'Devolvido';
    if (emprestimo.due_date && new Date(emprestimo.due_date) < new Date()) return 'Atrasado';
    return 'Ativo';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo':
        return 'bg-blue-500';
      case 'Atrasado':
        return 'bg-red-500';
      case 'Devolvido':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDaysRemaining = (dueDate: string | null) => {
    if (!dueDate) return null;
    return differenceInDays(parseISO(dueDate), new Date());
  };

  const handleReturn = async (loanId: string) => {
    try {
      await returnBookMutation.mutateAsync(loanId);
    } catch (error) {
      console.error('Erro ao devolver livro:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Empréstimos</CardTitle>
          <CardDescription>
            Gerencie todos os empréstimos da biblioteca
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por livro ou usuário..."
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
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="atrasado">Atrasados</SelectItem>
                <SelectItem value="devolvido">Devolvidos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-4">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/6" />
                  <Skeleton className="h-4 w-1/6" />
                  <Skeleton className="h-4 w-1/6" />
                  <Skeleton className="h-4 w-1/6" />
                  <Skeleton className="h-4 w-1/6" />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Livro</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Data Empréstimo</TableHead>
                    <TableHead>Data Prevista</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmprestimos.map((emprestimo) => {
                    const status = getStatus(emprestimo);
                    const daysRemaining = getDaysRemaining(emprestimo.due_date);
                    
                    return (
                      <TableRow key={emprestimo.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            <div>
                              <p className="font-medium">{emprestimo.book?.titulo || 'Livro não encontrado'}</p>
                              <p className="text-sm text-muted-foreground">
                                {emprestimo.book?.autor || 'Autor não informado'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-600" />
                            <span>Usuário {emprestimo.user_id.slice(0, 8)}...</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-600" />
                            {format(parseISO(emprestimo.loan_date), 'dd/MM/yyyy', { locale: ptBR })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-600" />
                            <div>
                              {emprestimo.due_date ? 
                                format(parseISO(emprestimo.due_date), 'dd/MM/yyyy', { locale: ptBR }) : 
                                'Não definida'
                              }
                              {status === 'Ativo' && daysRemaining !== null && (
                                <span className={`text-xs ml-2 block ${
                                  daysRemaining < 0 ? 'text-red-600' : 
                                  daysRemaining <= 3 ? 'text-yellow-600' : 'text-green-600'
                                }`}>
                                  ({daysRemaining > 0 ? `${daysRemaining} dias` : `${Math.abs(daysRemaining)} dias atrasado`})
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={`${getStatusColor(status)} text-white`}
                          >
                            {status}
                            {status === 'Atrasado' && (
                              <AlertCircle className="h-3 w-3 ml-1" />
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {status !== 'Devolvido' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleReturn(emprestimo.id)}
                                disabled={returnBookMutation.isPending}
                              >
                                Devolver
                              </Button>
                            )}
                            <Button size="sm" variant="ghost">
                              Detalhes
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {!isLoading && filteredEmprestimos.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum empréstimo encontrado</h3>
              <p className="text-muted-foreground">
                Não há empréstimos que correspondam aos critérios de busca.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BibliotecaEmprestimos;