-- Create storage bucket for cell resources
INSERT INTO storage.buckets (id, name, public) 
VALUES ('recursos-celulas', 'recursos-celulas', true);

-- Create storage policies for cell resources
CREATE POLICY "Users can upload cell resources" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'recursos-celulas' AND auth.uid() IS NOT NULL);

CREATE POLICY "Cell resources are viewable by authenticated users" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'recursos-celulas' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own cell resources" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'recursos-celulas' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own cell resources" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'recursos-celulas' AND auth.uid() IS NOT NULL);