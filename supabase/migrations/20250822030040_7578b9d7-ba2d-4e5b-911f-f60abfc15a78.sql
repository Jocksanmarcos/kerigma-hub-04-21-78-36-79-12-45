-- Fix RLS policy for vinculos_familiares to allow family creation and member addition
DROP POLICY IF EXISTS "Usuarios podem criar vinculos em suas familias" ON public.vinculos_familiares;

CREATE POLICY "Usuarios podem criar vinculos familiares" 
ON public.vinculos_familiares 
FOR INSERT 
WITH CHECK (
  -- Admin can create any family link
  is_admin() OR 
  user_has_permission('manage', 'familias') OR
  -- User can create links for families where they are already a member
  EXISTS (
    SELECT 1 FROM public.pessoas p 
    WHERE p.user_id = auth.uid() AND p.familia_id = vinculos_familiares.familia_id
  ) OR
  -- User can create family links when they are creating their own family
  EXISTS (
    SELECT 1 FROM public.pessoas p 
    WHERE p.user_id = auth.uid() AND p.id = vinculos_familiares.pessoa_id
  )
);