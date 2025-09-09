import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Book {
  id: string;
  titulo: string;
  autor?: string;
  editora?: string;
  isbn?: string;
  ano_publicacao?: number;
  numero_copias?: number;
  numero_paginas?: number;
  categoria?: string;
  imagem_capa_url?: string;
  sinopse?: string;
  localizacao_fisica?: string;
  qr_code_interno?: string;
  status: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Loan {
  id: string;
  book_id: string;
  user_id: string;
  loan_date: string;
  due_date?: string;
  return_date?: string;
  managed_by?: string;
  book?: Book;
}

export const useBooks = () => {
  return useQuery({
    queryKey: ["biblioteca-livros"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("biblioteca_livros")
        .select("*")
        .eq("ativo", true)
        .order("titulo");

      if (error) throw error;
      return data as Book[];
    },
  });
};

export const useLoans = () => {
  return useQuery({
    queryKey: ["loans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loans")
        .select(`
          *,
          book:biblioteca_livros(*)
        `)
        .order("loan_date", { ascending: false });

      if (error) throw error;
      return data as any[];
    },
  });
};

export const useUserLoans = () => {
  return useQuery({
    queryKey: ["user-loans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loans")
        .select(`
          *,
          book:biblioteca_livros(*)
        `)
        .is("return_date", null)
        .order("due_date");

      if (error) throw error;
      return data as any[];
    },
  });
};

export const useCreateBook = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (bookData: {
      titulo: string;
      autor?: string;
      editora?: string;
      isbn?: string;
      ano_publicacao?: number;
      categoria?: string;
      sinopse?: string;
      imagem_capa_url?: string;
      status: string;
      numero_copias?: number;
    }) => {
      const { data, error } = await supabase
        .from("biblioteca_livros")
        .insert([{
          ...bookData,
          ativo: true,
          numero_copias: bookData.numero_copias || 1
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biblioteca-livros"] });
      toast({
        title: "Livro cadastrado",
        description: "Novo livro foi adicionado à biblioteca",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao cadastrar livro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateBook = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Book> }) => {
      const { data, error } = await supabase
        .from("biblioteca_livros")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biblioteca-livros"] });
      toast({
        title: "Livro atualizado",
        description: "Informações do livro foram atualizadas",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar livro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useCreateLoan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (loanData: {
      book_id: string;
      user_id: string;
      due_date?: string;
    }) => {
      const { data, error } = await supabase
        .from("loans")
        .insert([loanData])
        .select()
        .single();

      if (error) throw error;

      // Update book status to emprestado
      await supabase
        .from("biblioteca_livros")
        .update({ status: 'Emprestado' })
        .eq("id", loanData.book_id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["biblioteca-livros"] });
      queryClient.invalidateQueries({ queryKey: ["user-loans"] });
      toast({
        title: "Empréstimo realizado",
        description: "Livro foi emprestado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao realizar empréstimo",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useReturnBook = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (loanId: string) => {
      // Get loan info first
      const { data: loan, error: loanError } = await supabase
        .from("loans")
        .select("book_id")
        .eq("id", loanId)
        .single();

      if (loanError) throw loanError;

      // Update loan with return date
      const { data, error } = await supabase
        .from("loans")
        .update({ return_date: new Date().toISOString() })
        .eq("id", loanId)
        .select()
        .single();

      if (error) throw error;

      // Update book status back to disponivel
      await supabase
        .from("biblioteca_livros")
        .update({ status: 'Disponível' })
        .eq("id", loan.book_id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["biblioteca-livros"] });
      queryClient.invalidateQueries({ queryKey: ["user-loans"] });
      toast({
        title: "Devolução realizada",
        description: "Livro foi devolvido com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao devolver livro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useCreatePublicReservation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (reservationData: {
      livro_id: string;
      nome: string;
      email: string;
      telefone?: string | null;
      observacoes?: string | null;
    }) => {
      // Use edge function to bypass RLS issues
      const { data, error } = await supabase.functions.invoke('biblioteca-solicitar-emprestimo', {
        body: reservationData
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Erro desconhecido');
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biblioteca-reservas"] });
      toast({
        title: "Solicitação enviada!",
        description: "Sua solicitação de empréstimo foi registrada. Entraremos em contato em breve.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao enviar solicitação",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};