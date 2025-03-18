

-- Create project_documents storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('project_documents', 'project_documents', true, false)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the bucket
-- Allow public access to view files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'project_documents');

-- Allow authenticated users to insert files
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project_documents');

-- Allow users to update their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'project_documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project_documents' AND (storage.foldername(name))[1] = auth.uid()::text);

