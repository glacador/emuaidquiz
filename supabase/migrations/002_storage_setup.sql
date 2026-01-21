-- Create storage bucket for quiz images
INSERT INTO storage.buckets (id, name, public)
VALUES ('quiz-images', 'quiz-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to quiz images
CREATE POLICY "Public read access to quiz images"
ON storage.objects FOR SELECT
USING (bucket_id = 'quiz-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload quiz images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'quiz-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to update images
CREATE POLICY "Authenticated users can update quiz images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'quiz-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete quiz images"
ON storage.objects FOR DELETE
USING (bucket_id = 'quiz-images' AND auth.role() = 'authenticated');
