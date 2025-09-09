-- Drop existing triggers that are conflicting
DROP TRIGGER IF EXISTS update_participantes_celulas_updated_at ON public.participantes_celulas;
DROP TRIGGER IF EXISTS update_biblioteca_recursos_updated_at ON public.biblioteca_recursos_celulas;
DROP TRIGGER IF EXISTS update_visitantes_celulas_updated_at ON public.visitantes_celulas;
DROP TRIGGER IF EXISTS update_relatorios_semanais_updated_at ON public.relatorios_semanais_celulas;

-- Recreate triggers with proper names
CREATE TRIGGER participantes_celulas_updated_at BEFORE UPDATE ON public.participantes_celulas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER biblioteca_recursos_celulas_updated_at BEFORE UPDATE ON public.biblioteca_recursos_celulas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER visitantes_celulas_updated_at BEFORE UPDATE ON public.visitantes_celulas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER relatorios_semanais_celulas_updated_at BEFORE UPDATE ON public.relatorios_semanais_celulas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();