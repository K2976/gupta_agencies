-- ============================================================
-- Gupta Agencies — Seed Data (Brands)
-- Run AFTER schema.sql + rls-policies.sql
-- Safe to re-run (uses ON CONFLICT)
-- ============================================================

INSERT INTO public.brands (name, is_active) VALUES
  ('Araldite', true),
  ('Dr. Fixit', true),
  ('Madhurima', true),
  ('Patanjali', true),
  ('Neha Mehendi', true),
  ('Gainda', true),
  ('Ratan Broom', true),
  ('Bonn Products Pvt Ltd', true),
  ('Johnson''s Baby', true),
  ('Punjabi Chokha Hing', true),
  ('Cycle Pure Agarbatti', true),
  ('Oyes Puff', true);
