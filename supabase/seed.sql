-- ============================================================
-- Gupta Agencies — Seed Data
-- ============================================================
-- NOTE: The super_admin user must first be created via Supabase Auth
-- (email: admin@guptaagencies.com, password: Admin@123456)
-- Then insert the corresponding row here with the auth user's UUID.
--
-- Replace 'YOUR_ADMIN_AUTH_UUID' with the actual UUID from auth.users.
-- ============================================================

-- Insert all distributor brands
INSERT INTO public.brands (name, is_active) VALUES
  ('Madhurima', true),
  ('Patanjali', true),
  ('Neha Mehendi', true),
  ('Dr Fixit', true),
  ('Araldite', true),
  ('Gainda', true),
  ('Ratan Broom', true),
  ('Bonn Products Pvt Ltd', true),
  ('Johnson''s Baby', true),
  ('Punjabi Chokha Hing', true),
  ('Cycle Pure Agarbatti', true),
  ('Oyes Puff', true);
