-- Seed initial data for Governance: profiles and permissions, including new Event Team profile

-- PROFILES
INSERT INTO public.profiles (name, description, level, active)
SELECT 'Admin', 'Administrador com acesso total ao sistema', 5, true
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE name = 'Admin');

INSERT INTO public.profiles (name, description, level, active)
SELECT 'Pastor', 'Acesso pastoral avançado', 4, true
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE name = 'Pastor');

INSERT INTO public.profiles (name, description, level, active)
SELECT 'Tesoureiro', 'Gestão financeira e relatórios', 3, true
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE name = 'Tesoureiro');

INSERT INTO public.profiles (name, description, level, active)
SELECT 'Líder de Célula', 'Gestão de células e discipulado', 2, true
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE name = 'Líder de Célula');

-- NEW PROFILE: Equipe de Eventos
INSERT INTO public.profiles (name, description, level, active)
SELECT 'Equipe de Eventos', 'Equipe dedicada ao check-in de eventos', 2, true
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE name = 'Equipe de Eventos');

-- PERMISSIONS
-- New permissions for Event Check-in module
INSERT INTO public.permissions (action, subject)
SELECT 'perform', 'event_check_in'
WHERE NOT EXISTS (
  SELECT 1 FROM public.permissions WHERE action = 'perform' AND subject = 'event_check_in'
);

INSERT INTO public.permissions (action, subject)
SELECT 'read', 'event_attendee_list'
WHERE NOT EXISTS (
  SELECT 1 FROM public.permissions WHERE action = 'read' AND subject = 'event_attendee_list'
);

-- ASSIGN PERMISSIONS TO "Equipe de Eventos"
-- perform:event_check_in
INSERT INTO public.profile_permissions (profile_id, permission_id, granted)
SELECT p.id, perm.id, true
FROM public.profiles p
JOIN public.permissions perm
  ON perm.action = 'perform' AND perm.subject = 'event_check_in'
WHERE p.name = 'Equipe de Eventos'
AND NOT EXISTS (
  SELECT 1 FROM public.profile_permissions pp
  WHERE pp.profile_id = p.id AND pp.permission_id = perm.id
);

-- read:event_attendee_list
INSERT INTO public.profile_permissions (profile_id, permission_id, granted)
SELECT p.id, perm.id, true
FROM public.profiles p
JOIN public.permissions perm
  ON perm.action = 'read' AND perm.subject = 'event_attendee_list'
WHERE p.name = 'Equipe de Eventos'
AND NOT EXISTS (
  SELECT 1 FROM public.profile_permissions pp
  WHERE pp.profile_id = p.id AND pp.permission_id = perm.id
);
