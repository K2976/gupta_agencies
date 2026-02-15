-- ============================================================
-- Gupta Agencies — Storage Buckets & Policies
-- Run AFTER schema.sql + rls-policies.sql
-- Safe to re-run
-- ============================================================

-- Create storage buckets (skip if already exist)
INSERT INTO storage.buckets (id, name, public)
  VALUES ('brand-logos', 'brand-logos', true)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('brand-pdfs', 'brand-pdfs', false)
  ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- BRAND LOGOS — Public read, Admin write
-- ============================================================
DROP POLICY IF EXISTS "public_read_logos" ON storage.objects;
CREATE POLICY "public_read_logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'brand-logos');

DROP POLICY IF EXISTS "admin_upload_logos" ON storage.objects;
CREATE POLICY "admin_upload_logos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'brand-logos' AND public.is_super_admin());

DROP POLICY IF EXISTS "admin_update_logos" ON storage.objects;
CREATE POLICY "admin_update_logos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'brand-logos' AND public.is_super_admin());

DROP POLICY IF EXISTS "admin_delete_logos" ON storage.objects;
CREATE POLICY "admin_delete_logos" ON storage.objects
  FOR DELETE USING (bucket_id = 'brand-logos' AND public.is_super_admin());

-- ============================================================
-- BRAND PDFS — Authenticated read, Admin write
-- ============================================================
DROP POLICY IF EXISTS "auth_read_pdfs" ON storage.objects;
CREATE POLICY "auth_read_pdfs" ON storage.objects
  FOR SELECT USING (bucket_id = 'brand-pdfs' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "admin_upload_pdfs" ON storage.objects;
CREATE POLICY "admin_upload_pdfs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'brand-pdfs' AND public.is_super_admin());

DROP POLICY IF EXISTS "admin_update_pdfs" ON storage.objects;
CREATE POLICY "admin_update_pdfs" ON storage.objects
  FOR UPDATE USING (bucket_id = 'brand-pdfs' AND public.is_super_admin());

DROP POLICY IF EXISTS "admin_delete_pdfs" ON storage.objects;
CREATE POLICY "admin_delete_pdfs" ON storage.objects
  FOR DELETE USING (bucket_id = 'brand-pdfs' AND public.is_super_admin());
