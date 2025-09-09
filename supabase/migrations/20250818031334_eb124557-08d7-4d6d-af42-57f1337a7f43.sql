-- Cria a tabela para os livros
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT,
  cover_url TEXT, -- URL para a imagem da capa do livro
  description TEXT,
  category TEXT,
  publisher TEXT, -- Editora
  publication_year INT,
  
  -- Campos Chave para o nosso sistema
  format TEXT NOT NULL DEFAULT 'fisico' CHECK (format IN ('fisico', 'digital')),
  status TEXT NOT NULL DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'emprestado', 'em manutencao')),
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Adiciona um comentário para explicar a tabela
COMMENT ON TABLE books IS 'Catálogo de livros da biblioteca da igreja.';

-- Cria a tabela para os empréstimos
CREATE TABLE loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  loan_date TIMESTAMPTZ DEFAULT now(), -- Data em que o empréstimo foi feito
  due_date TIMESTAMPTZ, -- Data prevista para devolução
  return_date TIMESTAMPTZ, -- Data em que foi efetivamente devolvido (NULL se ainda emprestado)
  
  -- Quem registou o empréstimo (um admin)
  managed_by UUID REFERENCES auth.users(id), 

  CONSTRAINT unique_active_loan UNIQUE (book_id, return_date)
);

-- Adiciona um comentário
COMMENT ON TABLE loans IS 'Registo de empréstimos de livros físicos aos membros.';

-- Ativa a Row Level Security (RLS) para cada tabela
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para a tabela 'books'
-- QUALQUER utilizador autenticado pode ver TODOS os livros
CREATE POLICY "Allow authenticated read access to all books"
ON books FOR SELECT
TO authenticated
USING (true);

-- APENAS admins podem criar, atualizar ou apagar livros
CREATE POLICY "Allow admin to manage books"
ON books FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Políticas de segurança para a tabela 'loans'
-- Um utilizador pode ver APENAS os SEUS próprios empréstimos
CREATE POLICY "Allow user to see their own loans"
ON loans FOR SELECT
USING (auth.uid() = user_id);

-- APENAS admins podem ver TODOS os empréstimos e geri-los
CREATE POLICY "Allow admin to manage all loans"
ON loans FOR ALL
USING (is_admin())
WITH CHECK (is_admin());