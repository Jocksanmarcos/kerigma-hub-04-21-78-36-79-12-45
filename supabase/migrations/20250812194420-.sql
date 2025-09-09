-- Fix infinite recursion in agendamentos RLS policies
-- First, drop all existing policies to start clean
DROP POLICY IF EXISTS "Enable delete for authenticated users on agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Enable insert for authenticated users on agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Enable read access for authenticated users on agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Enable update for authenticated users on agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Participants can view their agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Users can manage agendamentos in own calendars" ON agendamentos;
DROP POLICY IF EXISTS "Users can view agendamentos from accessible calendars" ON agendamentos;

-- Create simple, non-recursive policies for agendamentos
-- 1. Allow authenticated users to read all agendamentos (simplest approach to avoid recursion)
CREATE POLICY "agendamentos_select_policy" ON agendamentos
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 2. Allow calendar owners and admins to manage agendamentos
CREATE POLICY "agendamentos_manage_policy" ON agendamentos
  FOR ALL
  USING (
    auth.uid() IS NOT NULL AND (
      is_admin() OR
      EXISTS (
        SELECT 1 FROM calendarios c 
        WHERE c.id = agendamentos.calendario_id 
        AND c.proprietario_id = get_current_person_id()
      )
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      is_admin() OR
      EXISTS (
        SELECT 1 FROM calendarios c 
        WHERE c.id = agendamentos.calendario_id 
        AND c.proprietario_id = get_current_person_id()
      )
    )
  );