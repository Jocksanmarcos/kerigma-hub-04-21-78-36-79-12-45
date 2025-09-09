-- Usar a função existente update_updated_at_column para os triggers
CREATE TRIGGER update_louvor_musicas_updated_at
  BEFORE UPDATE ON public.louvor_musicas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_louvor_presets_updated_at
  BEFORE UPDATE ON public.louvor_presets_ambiente
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();