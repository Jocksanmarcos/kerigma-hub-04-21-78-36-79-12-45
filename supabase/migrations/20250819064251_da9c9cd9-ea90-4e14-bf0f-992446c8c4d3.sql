-- Fix the biblioteca_reservas status constraint to allow proper status values
ALTER TABLE biblioteca_reservas DROP CONSTRAINT IF EXISTS biblioteca_reservas_status_check;

-- Add the updated constraint with correct status values
ALTER TABLE biblioteca_reservas ADD CONSTRAINT biblioteca_reservas_status_check 
CHECK (status IN ('Ativa', 'Atendida', 'Recusada', 'Expirada', 'Cancelada'));

-- Also update any existing notification function to use correct status values
UPDATE biblioteca_reservas 
SET status = 'Recusada' 
WHERE status NOT IN ('Ativa', 'Atendida', 'Recusada', 'Expirada', 'Cancelada');