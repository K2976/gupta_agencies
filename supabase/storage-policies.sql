-- ============================================================
-- Gupta Agencies — Supabase Storage Bucket & Policies
-- Run in Supabase SQL Editor after schema + RLS
-- ============================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('brand-logos', 'brand-logos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('brand-pdfs', 'brand-pdfs', false);

-- ============================================================
-- BRAND LOGOS BUCKET — Public read, Admin write
-- ============================================================

-- Anyone can read logos (public bucket)
CREATE POLICY "public_read_logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'brand-logos');

-- Only super_admin can upload logos
CREATE POLICY "admin_upload_logos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'brand-logos'
    AND public.is_super_admin()
  );

-- Only super_admin can update logos
CREATE POLICY "admin_update_logos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'brand-logos'
    AND public.is_super_admin()
  );

-- Only super_admin can delete logos
CREATE POLICY "admin_delete_logos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'brand-logos'
    AND public.is_super_admin()
  );

-- ============================================================
-- BRAND PDFS BUCKET — Authenticated read, Admin write
-- ============================================================

-- Authenticated users can read PDFs
CREATE POLICY "auth_read_pdfs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'brand-pdfs'
    AND auth.uid() IS NOT NULL
  );

-- Only super_admin can upload PDFs
CREATE POLICY "admin_upload_pdfs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'brand-pdfs'
    AND public.is_super_admin()
  );

-- Only super_admin can update PDFs
CREATE POLICY "admin_update_pdfs" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'brand-pdfs'
    AND public.is_super_admin()
  );

-- Only super_admin can delete PDFs
CREATE POLICY "admin_delete_pdfs" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'brand-pdfs'
    AND public.is_super_admin()
  );
