-- Corrigir triggers que já existem
DROP TRIGGER IF EXISTS update_louvor_musicas_updated_at ON public.louvor_musicas;
DROP TRIGGER IF EXISTS update_louvor_presets_updated_at ON public.louvor_presets_ambiente;

-- Recriar os triggers
CREATE TRIGGER update_louvor_musicas_updated_at
  BEFORE UPDATE ON public.louvor_musicas
  FOR EACH ROW
  EXECUTE FUNCTION update_louvor_updated_at();

CREATE TRIGGER update_louvor_presets_updated_at
  BEFORE UPDATE ON public.louvor_presets_ambiente
  FOR EACH ROW
  EXECUTE FUNCTION update_louvor_updated_at();