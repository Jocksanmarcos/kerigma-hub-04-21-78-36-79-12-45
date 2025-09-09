-- Seed initial profiles (idempotent)
INSERT INTO public.profiles (name, description, level, active)
SELECT 'Admin', 'Administrador do sistema', 5, true
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE name = 'Admin');

INSERT INTO public.profiles (name, description, level, active)
SELECT 'Pastor', 'Perfil pastoral', 4, true
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE name = 'Pastor');

INSERT INTO public.profiles (name, description, level, active)
SELECT 'Tesoureiro', 'Responsável financeiro', 4, true
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE name = 'Tesoureiro');

INSERT INTO public.profiles (name, description, level, active)
SELECT 'Líder de Célula', 'Coordena células', 3, true
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE name = 'Líder de Célula');

-- New profile: Equipe de Eventos
INSERT INTO public.profiles (name, description, level, active)
SELECT 'Equipe de Eventos', 'Equipe dedicada ao check-in seguro de eventos', 2, true
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE name = 'Equipe de Eventos');

-- Seed new permissions (idempotent)
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

-- Assign permissions to "Equipe de Eventos" (idempotent)
WITH ep AS (
  SELECT id AS profile_id FROM public.profiles WHERE name = 'Equipe de Eventos' LIMIT 1
), p1 AS (
  SELECT id AS permission_id FROM public.permissions WHERE action = 'perform' AND subject = 'event_check_in' LIMIT 1
), p2 AS (
  SELECT id AS permission_id FROM public.permissions WHERE action = 'read' AND subject = 'event_attendee_list' LIMIT 1
)
INSERT INTO public.profile_permissions (profile_id, permission_id, granted)
SELECT ep.profile_id, p1.permission_id, true FROM ep, p1
WHERE ep.profile_id IS NOT NULL AND p1.permission_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM public.profile_permissions WHERE profile_id = ep.profile_id AND permission_id = p1.permission_id
);

WITH ep AS (
  SELECT id AS profile_id FROM public.profiles WHERE name = 'Equipe de Eventos' LIMIT 1
), p2 AS (
  SELECT id AS permission_id FROM public.permissions WHERE action = 'read' AND subject = 'event_attendee_list' LIMIT 1
)
INSERT INTO public.profile_permissions (profile_id, permission_id, granted)
SELECT ep.profile_id, p2.permission_id, true FROM ep, p2
WHERE ep.profile_id IS NOT NULL AND p2.permission_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM public.profile_permissions WHERE profile_id = ep.profile_id AND permission_id = p2.permission_id
);
