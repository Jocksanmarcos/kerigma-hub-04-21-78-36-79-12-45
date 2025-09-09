-- Create storage buckets for document uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('documentos', 'documentos', false),
  ('ensino', 'ensino', false),
  ('financeiro', 'financeiro', false),
  ('patrimonio', 'patrimonio', false);

-- Create RLS policies for document uploads
CREATE POLICY "Usuários autenticados podem fazer upload de documentos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'documentos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem ver seus próprios documentos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documentos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuários podem atualizar seus próprios documentos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'documentos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuários podem deletar seus próprios documentos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'documentos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policies for ensino bucket (teaching materials)
CREATE POLICY "Professores podem fazer upload de materiais de ensino" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'ensino' AND user_has_permission('create', 'ensino'));

CREATE POLICY "Usuários podem ver materiais de ensino" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'ensino');

CREATE POLICY "Professores podem gerenciar materiais de ensino" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'ensino' AND user_has_permission('manage', 'ensino'));

-- Policies for financeiro bucket
CREATE POLICY "Tesoureiros podem fazer upload de documentos financeiros" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'financeiro' AND user_has_permission('create', 'financeiro'));

CREATE POLICY "Usuários com permissão podem ver documentos financeiros" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'financeiro' AND user_has_permission('read', 'financeiro'));

CREATE POLICY "Tesoureiros podem gerenciar documentos financeiros" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'financeiro' AND user_has_permission('manage', 'financeiro'));

-- Policies for patrimonio bucket
CREATE POLICY "Usuários podem fazer upload de documentos de patrimônio" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'patrimonio' AND user_has_permission('create', 'patrimonio'));

CREATE POLICY "Usuários podem ver documentos de patrimônio" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'patrimonio' AND user_has_permission('read', 'patrimonio'));