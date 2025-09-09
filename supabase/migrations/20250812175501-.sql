-- Corrigir políticas RLS para agendamentos e calendarios
-- Primeiro, vamos remover políticas problemáticas e criar novas

-- Remover políticas existentes para agendamentos
DROP POLICY IF EXISTS "Users can view agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "Users can create agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "Users can update agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "Users can delete agendamentos" ON public.agendamentos;

-- Remover políticas existentes para calendarios
DROP POLICY IF EXISTS "Users can view calendarios" ON public.calendarios;
DROP POLICY IF EXISTS "Users can create calendarios" ON public.calendarios;
DROP POLICY IF EXISTS "Users can update calendarios" ON public.calendarios;
DROP POLICY IF EXISTS "Users can delete calendarios" ON public.calendarios;

-- Criar políticas simples para agendamentos (sem recursão)
CREATE POLICY "Enable read access for authenticated users on agendamentos"
ON public.agendamentos
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users on agendamentos"
ON public.agendamentos
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users on agendamentos"
ON public.agendamentos
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users on agendamentos"
ON public.agendamentos
FOR DELETE
TO authenticated
USING (true);

-- Criar políticas simples para calendarios (sem recursão)
CREATE POLICY "Enable read access for authenticated users on calendarios"
ON public.calendarios
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users on calendarios"
ON public.calendarios
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users on calendarios"
ON public.calendarios
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users on calendarios"
ON public.calendarios
FOR DELETE
TO authenticated
USING (true);