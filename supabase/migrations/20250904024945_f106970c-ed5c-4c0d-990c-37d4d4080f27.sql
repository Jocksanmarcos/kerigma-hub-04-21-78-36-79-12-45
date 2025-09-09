-- Create storage bucket for uploads if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the uploads bucket
CREATE POLICY "Usuários autenticados podem fazer upload"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'uploads' AND auth.uid() IS NOT NULL);

CREATE POLICY "Arquivos são públicos para visualização"
ON storage.objects
FOR SELECT
USING (bucket_id = 'uploads');

CREATE POLICY "Usuários podem atualizar próprios arquivos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuários podem deletar próprios arquivos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);