-- ============================================================
-- Gupta Agencies — Complete Database Schema
-- Brand → Product → SKU hierarchy
-- Run this FIRST on a fresh Supabase project
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- 1. USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'salesman', 'retailer')),
  business_name TEXT,
  owner_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  gst TEXT,
  assigned_salesman_id UUID REFERENCES public.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_assigned_salesman ON public.users(assigned_salesman_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- ============================================================
-- 2. BRANDS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  pdf_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brands_name ON public.brands(name);
CREATE INDEX IF NOT EXISTS idx_brands_active ON public.brands(is_active);

-- ============================================================
-- 3. PRODUCTS TABLE (product-level grouping under a brand)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON public.products USING GIN (name gin_trgm_ops);

-- ============================================================
-- 4. SKUS TABLE (variants under a product)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.skus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku_code TEXT NOT NULL,
  variant_label TEXT NOT NULL,
  case_size TEXT,
  mrp DECIMAL(10,2) NOT NULL,
  dealer_price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_skus_sku_code ON public.skus(sku_code);
CREATE INDEX IF NOT EXISTS idx_skus_product ON public.skus(product_id);
CREATE INDEX IF NOT EXISTS idx_skus_active ON public.skus(is_active);
CREATE INDEX IF NOT EXISTS idx_skus_variant_trgm ON public.skus USING GIN (variant_label gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_skus_sku_trgm ON public.skus USING GIN (sku_code gin_trgm_ops);

-- ============================================================
-- 5. ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  retailer_id UUID NOT NULL REFERENCES public.users(id),
  salesman_id UUID REFERENCES public.users(id),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'delivered')),
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_retailer ON public.orders(retailer_id);
CREATE INDEX IF NOT EXISTS idx_orders_salesman ON public.orders(salesman_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

-- ============================================================
-- 6. ORDER ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sku_id UUID NOT NULL REFERENCES public.skus(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_sku ON public.order_items(sku_id);

-- ============================================================
-- 7. UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_users_updated_at') THEN
    CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_brands_updated_at') THEN
    CREATE TRIGGER trigger_brands_updated_at BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_products_updated_at') THEN
    CREATE TRIGGER trigger_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_skus_updated_at') THEN
    CREATE TRIGGER trigger_skus_updated_at BEFORE UPDATE ON public.skus FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_orders_updated_at') THEN
    CREATE TRIGGER trigger_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;
END $$;

-- ============================================================
-- 8. HELPER FUNCTIONS FOR RLS
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- 9. SEARCH FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.search_skus(search_query TEXT)
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
-- 10. DASHBOARD FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_admin_dashboard()
RETURNS JSON AS $$
DECLARE result JSON;
BEGIN
  SELECT json_build_object(
    'total_orders_today', (SELECT COUNT(*) FROM public.orders WHERE created_at >= CURRENT_DATE),
    'orders_this_month', (SELECT COUNT(*) FROM public.orders WHERE created_at >= date_trunc('month', CURRENT_DATE)),
    'pending_orders', (SELECT COUNT(*) FROM public.orders WHERE status = 'pending'),
    'total_retailers', (SELECT COUNT(*) FROM public.users WHERE role = 'retailer' AND is_active = true),
    'total_salesmen', (SELECT COUNT(*) FROM public.users WHERE role = 'salesman' AND is_active = true),
    'total_brands', (SELECT COUNT(*) FROM public.brands WHERE is_active = true),
    'orders_by_status', (SELECT COALESCE(json_object_agg(status, cnt), '{}'::json) FROM (SELECT status, COUNT(*) as cnt FROM public.orders GROUP BY status) s),
    'recent_orders', COALESCE((
      SELECT json_agg(row_to_json(t)) FROM (
        SELECT o.id, o.total_amount, o.status, o.created_at, u.business_name as retailer_name
        FROM public.orders o JOIN public.users u ON u.id = o.retailer_id
        ORDER BY o.created_at DESC LIMIT 10
      ) t
    ), '[]'::json)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_salesman_dashboard(salesman_uuid UUID)
RETURNS JSON AS $$
DECLARE result JSON;
BEGIN
  SELECT json_build_object(
    'total_retailers', (SELECT COUNT(*) FROM public.users WHERE assigned_salesman_id = salesman_uuid AND is_active = true),
    'orders_today', (SELECT COUNT(*) FROM public.orders WHERE salesman_id = salesman_uuid AND created_at >= CURRENT_DATE),
    'orders_this_month', (SELECT COUNT(*) FROM public.orders WHERE salesman_id = salesman_uuid AND created_at >= date_trunc('month', CURRENT_DATE)),
    'pending_orders', (SELECT COUNT(*) FROM public.orders WHERE salesman_id = salesman_uuid AND status = 'pending'),
    'recent_orders', COALESCE((
      SELECT json_agg(row_to_json(t)) FROM (
        SELECT o.id, o.total_amount, o.status, o.created_at, u.business_name as retailer_name
        FROM public.orders o JOIN public.users u ON u.id = o.retailer_id
        WHERE o.salesman_id = salesman_uuid
        ORDER BY o.created_at DESC LIMIT 10
      ) t
    ), '[]'::json)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_retailer_dashboard(retailer_uuid UUID)
RETURNS JSON AS $$
DECLARE result JSON;
BEGIN
  SELECT json_build_object(
    'total_orders', (SELECT COUNT(*) FROM public.orders WHERE retailer_id = retailer_uuid),
    'pending_orders', (SELECT COUNT(*) FROM public.orders WHERE retailer_id = retailer_uuid AND status = 'pending'),
    'recent_orders', COALESCE((
      SELECT json_agg(row_to_json(t)) FROM (
        SELECT o.id, o.total_amount, o.status, o.created_at
        FROM public.orders o WHERE o.retailer_id = retailer_uuid
        ORDER BY o.created_at DESC LIMIT 10
      ) t
    ), '[]'::json)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
