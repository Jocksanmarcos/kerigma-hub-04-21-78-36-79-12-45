-- Vincular o usuário jocksan.marcos@gmail.com existente
UPDATE public.pessoas 
SET user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'jocksan.marcos@gmail.com' 
  LIMIT 1
)
WHERE email = 'jocksan.marcos@gmail.com' 
AND user_id IS NULL;