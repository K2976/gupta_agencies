-- ============================================================
-- MIGRATION: Brand → Product → SKU (3-level hierarchy)
-- Run this on an EXISTING database to migrate data.
-- For FRESH installs, use the updated schema.sql instead.
-- ============================================================

BEGIN;

-- ============================================================
-- STEP 1: Create new "products" table (product-level grouping)
-- ============================================================
CREATE TABLE public.products_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_new_brand ON public.products_new(brand_id);
CREATE INDEX idx_products_new_name ON public.products_new(name);
CREATE INDEX idx_products_new_active ON public.products_new(is_active);

-- ============================================================
-- STEP 2: Auto-create product groupings from existing SKUs
-- Groups by extracting the product name prefix (before the size)
-- e.g., "Standard Epoxy Adhesive 5g" → "Standard Epoxy Adhesive"
-- ============================================================
INSERT INTO public.products_new (brand_id, name)
SELECT DISTINCT
  p.brand_id,
  -- Extract product name by removing trailing size portion
  CASE
    WHEN p.product_name ~ '\s+\d+(\.\d+)?\s*(g|kg|ml|ltr|mm|cm|KG|Gun)' THEN
      TRIM(regexp_replace(p.product_name, '\s+\d+(\.\d+)?\s*(g|kg|ml|ltr|mm|cm|KG|Gun).*$', '', 'i'))
    WHEN p.product_name ~ '\s+(P\d+|Grit\s+\d+)' THEN
      TRIM(regexp_replace(p.product_name, '\s+(P\d+|Grit\s+\d+).*$', '', 'i'))
    ELSE p.product_name
  END AS extracted_name
FROM public.products p
ORDER BY extracted_name;

-- ============================================================
-- STEP 3: Rename existing "products" → "skus"
-- ============================================================
ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
ALTER TABLE public.products RENAME TO skus;

-- Rename columns
ALTER TABLE public.skus RENAME COLUMN product_name TO variant_label;

-- Add new columns
ALTER TABLE public.skus ADD COLUMN product_id UUID;
ALTER TABLE public.skus ADD COLUMN case_size TEXT;

-- ============================================================
-- STEP 4: Populate product_id on SKUs by matching names
-- ============================================================
UPDATE public.skus s
SET product_id = pn.id
FROM public.products_new pn
WHERE pn.brand_id = s.brand_id
  AND (
    -- Match by extracted name prefix
    CASE
      WHEN s.variant_label ~ '\s+\d+(\.\d+)?\s*(g|kg|ml|ltr|mm|cm|KG|Gun)' THEN
        TRIM(regexp_replace(s.variant_label, '\s+\d+(\.\d+)?\s*(g|kg|ml|ltr|mm|cm|KG|Gun).*$', '', 'i'))
      WHEN s.variant_label ~ '\s+(P\d+|Grit\s+\d+)' THEN
        TRIM(regexp_replace(s.variant_label, '\s+(P\d+|Grit\s+\d+).*$', '', 'i'))
      ELSE s.variant_label
    END = pn.name
  );

-- For any SKUs that didn't match, create individual product entries
INSERT INTO public.products_new (brand_id, name)
SELECT DISTINCT s.brand_id, s.variant_label
FROM public.skus s
WHERE s.product_id IS NULL
  AND s.brand_id IS NOT NULL;

-- Update remaining unmatched SKUs
UPDATE public.skus s
SET product_id = pn.id
FROM public.products_new pn
WHERE s.product_id IS NULL
  AND pn.brand_id = s.brand_id
  AND pn.name = s.variant_label;

-- Now update variant_label to be just the size/variant portion
UPDATE public.skus s
SET variant_label = TRIM(
  CASE
    WHEN s.variant_label ~ '\s+\d+(\.\d+)?\s*(g|kg|ml|ltr|mm|cm|KG|Gun)' THEN
      regexp_replace(
        s.variant_label,
        '^.*?(\d+(\.\d+)?\s*(g|kg|ml|ltr|mm|cm|KG|Gun).*)$',
        '\1', 'i'
      )
    WHEN s.variant_label ~ '\s+(P\d+|Grit\s+\d+)' THEN
      regexp_replace(s.variant_label, '^.*?(P\d+|Grit\s+\d+.*)$', '\1', 'i')
    ELSE s.variant_label
  END
);

-- ============================================================
-- STEP 5: Add constraints and finalize skus table
-- ============================================================
-- Make product_id NOT NULL now that all rows are populated
ALTER TABLE public.skus ALTER COLUMN product_id SET NOT NULL;

-- Add FK constraint
ALTER TABLE public.skus ADD CONSTRAINT skus_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES public.products_new(id) ON DELETE CASCADE;

-- Drop old brand_id column (brand now flows through products_new)
ALTER TABLE public.skus DROP COLUMN brand_id;

-- ============================================================
-- STEP 6: Rename products_new → products
-- ============================================================
ALTER TABLE public.products_new RENAME TO products;

-- Rename indexes
ALTER INDEX idx_products_new_brand RENAME TO idx_products_brand;
ALTER INDEX idx_products_new_name RENAME TO idx_products_name;
ALTER INDEX idx_products_new_active RENAME TO idx_products_active;

-- ============================================================
-- STEP 7: Update order_items FK (product_id → sku_id)
-- ============================================================
ALTER TABLE public.order_items RENAME COLUMN product_id TO sku_id;
ALTER TABLE public.order_items ADD CONSTRAINT order_items_sku_id_fkey
  FOREIGN KEY (sku_id) REFERENCES public.skus(id);

-- Rename index
ALTER INDEX idx_order_items_product RENAME TO idx_order_items_sku;

-- ============================================================
-- STEP 8: Update indexes on skus table
-- ============================================================
-- Drop old indexes that reference wrong table name / columns
DROP INDEX IF EXISTS idx_products_sku;
DROP INDEX IF EXISTS idx_products_brand;
DROP INDEX IF EXISTS idx_products_name;
DROP INDEX IF EXISTS idx_products_active;
DROP INDEX IF EXISTS idx_products_search;
DROP INDEX IF EXISTS idx_products_name_trgm;
DROP INDEX IF EXISTS idx_products_sku_trgm;

-- Create new indexes on skus
CREATE UNIQUE INDEX idx_skus_sku_code ON public.skus(sku_code);
CREATE INDEX idx_skus_product ON public.skus(product_id);
CREATE INDEX idx_skus_active ON public.skus(is_active);
CREATE INDEX idx_skus_variant_trgm ON public.skus USING GIN (variant_label gin_trgm_ops);
CREATE INDEX idx_skus_sku_trgm ON public.skus USING GIN (sku_code gin_trgm_ops);

-- Product-level search indexes
CREATE INDEX idx_products_name_trgm ON public.products USING GIN (name gin_trgm_ops);

-- ============================================================
-- STEP 9: Add updated_at trigger to products
-- ============================================================
CREATE TRIGGER trigger_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Drop old trigger on skus (references renamed table, may need recreation)
DROP TRIGGER IF EXISTS trigger_products_updated_at ON public.skus;
CREATE TRIGGER trigger_skus_updated_at
  BEFORE UPDATE ON public.skus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- STEP 10: Update search function
-- ============================================================
DROP FUNCTION IF EXISTS search_products(TEXT);

CREATE OR REPLACE FUNCTION search_skus(search_query TEXT)
RETURNS TABLE (
  id UUID,
  product_id UUID,
  product_name TEXT,
  brand_id UUID,
  brand_name TEXT,
  sku_code TEXT,
  variant_label TEXT,
  case_size TEXT,
  mrp DECIMAL,
  dealer_price DECIMAL,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id, s.product_id, p.name AS product_name,
    p.brand_id, b.name AS brand_name,
    s.sku_code, s.variant_label, s.case_size,
    s.mrp, s.dealer_price, s.is_active
  FROM public.skus s
  JOIN public.products p ON p.id = s.product_id
  JOIN public.brands b ON b.id = p.brand_id
  WHERE s.is_active = true AND p.is_active = true AND b.is_active = true
    AND (
      p.name ILIKE '%' || search_query || '%'
      OR s.variant_label ILIKE '%' || search_query || '%'
      OR s.sku_code ILIKE '%' || search_query || '%'
      OR b.name ILIKE '%' || search_query || '%'
    )
  ORDER BY
    CASE
      WHEN p.name ILIKE search_query || '%' THEN 1
      WHEN s.sku_code ILIKE search_query || '%' THEN 2
      WHEN b.name ILIKE search_query || '%' THEN 3
      ELSE 4
    END,
    p.name, s.variant_label
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- STEP 11: Update RLS policies
-- ============================================================

-- Drop old product policies
DROP POLICY IF EXISTS "super_admin_all_products" ON public.skus;
DROP POLICY IF EXISTS "auth_read_active_products" ON public.skus;

-- SKUs table RLS
ALTER TABLE public.skus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "super_admin_all_skus" ON public.skus
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "auth_read_active_skus" ON public.skus
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND is_active = true
  );

-- Products table RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "super_admin_all_products" ON public.products
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "auth_read_active_products" ON public.products
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND is_active = true
  );

COMMIT;
