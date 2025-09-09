-- Tabela para as oportunidades de voluntariado
CREATE TABLE public.volunteer_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  required_slots INTEGER DEFAULT 1,
  filled_slots INTEGER DEFAULT 0,
  -- Referências adaptadas ao schema existente
  event_id UUID, -- Referência a eventos (será ajustada se necessário)
  ministry_id UUID, -- Referência a ministérios/grupos
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  location TEXT,
  requirements TEXT[], -- Array de requisitos específicos
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela para as inscrições dos voluntários  
CREATE TABLE public.volunteer_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.volunteer_opportunities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'inscrito' CHECK (status IN ('inscrito', 'confirmado', 'recusado', 'cancelado')),
  message TEXT, -- Mensagem opcional do voluntário
  admin_notes TEXT, -- Notas administrativas
  signed_up_at TIMESTAMPTZ DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(opportunity_id, user_id) -- Garante que uma pessoa não se inscreva duas vezes na mesma vaga
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.volunteer_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_signups ENABLE ROW LEVEL SECURITY;

-- Função auxiliar para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_volunteer_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  -- Verifica se é admin no sistema existente
  RETURN EXISTS (
    SELECT 1 FROM public.pessoas p 
    WHERE p.user_id = user_uuid 
    AND p.situacao = 'ativo'
  ) OR is_sede_admin(user_uuid) OR is_pastor_missao(user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Políticas RLS para volunteer_opportunities
CREATE POLICY "Todos podem ver oportunidades ativas" ON public.volunteer_opportunities
  FOR SELECT USING (is_active = true OR is_volunteer_admin());

CREATE POLICY "Admins podem criar oportunidades" ON public.volunteer_opportunities  
  FOR INSERT WITH CHECK (is_volunteer_admin());

CREATE POLICY "Criadores e admins podem editar oportunidades" ON public.volunteer_opportunities
  FOR UPDATE USING (created_by = auth.uid() OR is_volunteer_admin());

CREATE POLICY "Admins podem deletar oportunidades" ON public.volunteer_opportunities
  FOR DELETE USING (is_volunteer_admin());

-- Políticas RLS para volunteer_signups  
CREATE POLICY "Usuários podem ver próprias inscrições e admins veem todas" ON public.volunteer_signups
  FOR SELECT USING (user_id = auth.uid() OR is_volunteer_admin());

CREATE POLICY "Usuários autenticados podem se inscrever" ON public.volunteer_signups
  FOR INSERT WITH CHECK (user_id = auth.uid() AND auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem atualizar próprias inscrições" ON public.volunteer_signups  
  FOR UPDATE USING (user_id = auth.uid() OR is_volunteer_admin());

CREATE POLICY "Usuários podem cancelar próprias inscrições" ON public.volunteer_signups
  FOR DELETE USING (user_id = auth.uid() OR is_volunteer_admin());

-- Triggers para atualizar updated_at
CREATE TRIGGER update_volunteer_opportunities_updated_at
  BEFORE UPDATE ON public.volunteer_opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_volunteer_signups_updated_at  
  BEFORE UPDATE ON public.volunteer_signups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Função para atualizar filled_slots automaticamente
CREATE OR REPLACE FUNCTION public.update_opportunity_filled_slots()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    UPDATE public.volunteer_opportunities 
    SET filled_slots = (
      SELECT COUNT(*) 
      FROM public.volunteer_signups 
      WHERE opportunity_id = COALESCE(NEW.opportunity_id, OLD.opportunity_id)
      AND status IN ('inscrito', 'confirmado')
    )
    WHERE id = COALESCE(NEW.opportunity_id, OLD.opportunity_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para atualizar filled_slots
CREATE TRIGGER update_filled_slots_on_signup_change
  AFTER INSERT OR UPDATE OR DELETE ON public.volunteer_signups
  FOR EACH ROW
  EXECUTE FUNCTION update_opportunity_filled_slots();

-- Índices para performance
CREATE INDEX idx_volunteer_opportunities_active ON public.volunteer_opportunities(is_active);
CREATE INDEX idx_volunteer_opportunities_dates ON public.volunteer_opportunities(start_date, end_date);
CREATE INDEX idx_volunteer_signups_opportunity ON public.volunteer_signups(opportunity_id);
CREATE INDEX idx_volunteer_signups_user ON public.volunteer_signups(user_id);
CREATE INDEX idx_volunteer_signups_status ON public.volunteer_signups(status);