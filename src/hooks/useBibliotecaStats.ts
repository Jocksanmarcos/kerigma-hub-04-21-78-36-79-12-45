import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BibliotecaStats {
  totalLivros: number;
  livrosDisponiveis: number;
  emprestimosAtivos: number;
  emprestimosAtrasados: number;
  categoriasMaisPopulares: Array<{
    categoria: string;
    count: number;
  }>;
  ultimosEmprestimos: Array<{
    id: string;
    book: {
      title: string;
      author?: string;
    };
    loan_date: string;
    due_date?: string;
    user_id: string;
  }>;
}

export const useBibliotecaStats = () => {
  return useQuery({
    queryKey: ["biblioteca-stats"],
    queryFn: async (): Promise<BibliotecaStats> => {
      // Buscar total de livros
      const { data: livrosData, error: livrosError } = await supabase
        .from("biblioteca_livros")
        .select("id, status, categoria", { count: 'exact' })
        .eq("ativo", true);

      if (livrosError) throw livrosError;

      // Contar livros por status
      const livrosDisponiveis = livrosData?.filter(l => l.status === 'Disponível').length || 0;

      // Buscar empréstimos ativos
      const { data: emprestimosData, error: emprestimosError } = await supabase
        .from("loans")
        .select("id, due_date", { count: 'exact' })
        .is("return_date", null);

      if (emprestimosError) throw emprestimosError;

      const emprestimosAtrasados = emprestimosData?.filter(e => 
        e.due_date && new Date(e.due_date) < new Date()
      ).length || 0;

      // Categorias mais populares
      const categoryCounts = livrosData?.reduce((acc: Record<string, number>, livro) => {
        const categoria = livro.categoria || 'Não categorizado';
        acc[categoria] = (acc[categoria] || 0) + 1;
        return acc;
      }, {}) || {};

      const categoriasMaisPopulares = Object.entries(categoryCounts)
        .map(([categoria, count]) => ({ categoria, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Buscar últimos empréstimos com informações dos livros
      const { data: recentLoans, error: loansError } = await supabase
        .from("loans")
        .select("id, loan_date, due_date, user_id, book_id")
        .order("loan_date", { ascending: false })
        .limit(5);

      if (loansError) throw loansError;

      // Buscar informações dos livros para os empréstimos
      const ultimosEmprestimos = [];
      if (recentLoans) {
        for (const loan of recentLoans) {
          const { data: bookData } = await supabase
            .from("biblioteca_livros")
            .select("titulo, autor")
            .eq("id", loan.book_id)
            .single();
          
          ultimosEmprestimos.push({
            id: loan.id,
            book: {
              title: bookData?.titulo || 'Título não encontrado',
              author: bookData?.autor
            },
            loan_date: loan.loan_date,
            due_date: loan.due_date,
            user_id: loan.user_id
          });
        }
      }

      return {
        totalLivros: livrosData?.length || 0,
        livrosDisponiveis,
        emprestimosAtivos: emprestimosData?.length || 0,
        emprestimosAtrasados,
        categoriasMaisPopulares,
        ultimosEmprestimos
      };
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });
};