-- ============================================================
-- Gupta Agencies — B2B Distributor Ordering System
-- Supabase PostgreSQL Schema
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE public.users (
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

CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_assigned_salesman ON public.users(assigned_salesman_id);
CREATE INDEX idx_users_email ON public.users(email);

-- ============================================================
-- BRANDS TABLE
-- ============================================================
CREATE TABLE public.brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  pdf_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_brands_name ON public.brands(name);
CREATE INDEX idx_brands_active ON public.brands(is_active);

-- ============================================================
-- PRODUCTS TABLE (SKUs)
-- ============================================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  sku_code TEXT NOT NULL,
  product_name TEXT NOT NULL,
  mrp DECIMAL(10,2) NOT NULL,
  dealer_price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_products_sku ON public.products(sku_code);
CREATE INDEX idx_products_brand ON public.products(brand_id);
CREATE INDEX idx_products_name ON public.products(product_name);
CREATE INDEX idx_products_active ON public.products(is_active);

-- Full-text search index
CREATE INDEX idx_products_search ON public.products
  USING GIN (to_tsvector('english', product_name || ' ' || sku_code));

-- Trigram index for fuzzy search
CREATE INDEX idx_products_name_trgm ON public.products USING GIN (product_name gin_trgm_ops);
CREATE INDEX idx_products_sku_trgm ON public.products USING GIN (sku_code gin_trgm_ops);

-- ============================================================
-- ORDERS TABLE
-- ============================================================
CREATE TABLE public.orders (
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

CREATE INDEX idx_orders_retailer ON public.orders(retailer_id);
CREATE INDEX idx_orders_salesman ON public.orders(salesman_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);

-- ============================================================
-- ORDER ITEMS TABLE
-- ============================================================
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_order_items_product ON public.order_items(product_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SEARCH FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION search_products(search_query TEXT)
RETURNS TABLE (
  id UUID,
  brand_id UUID,
  brand_name TEXT,
  sku_code TEXT,
  product_name TEXT,
  mrp DECIMAL,
  dealer_price DECIMAL,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.brand_id, b.name AS brand_name,
    p.sku_code, p.product_name, p.mrp, p.dealer_price, p.is_active
  FROM public.products p
  JOIN public.brands b ON b.id = p.brand_id
  WHERE p.is_active = true AND b.is_active = true
    AND (
      p.product_name ILIKE '%' || search_query || '%'
      OR p.sku_code ILIKE '%' || search_query || '%'
      OR b.name ILIKE '%' || search_query || '%'
    )
  ORDER BY
    CASE
      WHEN p.product_name ILIKE search_query || '%' THEN 1
      WHEN p.sku_code ILIKE search_query || '%' THEN 2
      WHEN b.name ILIKE search_query || '%' THEN 3
      ELSE 4
    END,
    p.product_name
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- DASHBOARD FUNCTIONS
-- ============================================================

-- Admin dashboard stats
CREATE OR REPLACE FUNCTION get_admin_dashboard()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_orders_today', (SELECT COUNT(*) FROM orders WHERE created_at >= CURRENT_DATE),
    'orders_this_month', (SELECT COUNT(*) FROM orders WHERE created_at >= date_trunc('month', CURRENT_DATE)),
    'pending_orders', (SELECT COUNT(*) FROM orders WHERE status = 'pending'),
    'total_retailers', (SELECT COUNT(*) FROM users WHERE role = 'retailer' AND is_active = true),
    'total_salesmen', (SELECT COUNT(*) FROM users WHERE role = 'salesman' AND is_active = true),
    'total_brands', (SELECT COUNT(*) FROM brands WHERE is_active = true),
    'orders_by_status', (
      SELECT json_object_agg(status, cnt)
      FROM (SELECT status, COUNT(*) as cnt FROM orders GROUP BY status) s
    ),
    'recent_orders', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT o.id, o.total_amount, o.status, o.created_at,
               u.business_name as retailer_name
        FROM orders o
        JOIN users u ON u.id = o.retailer_id
        ORDER BY o.created_at DESC LIMIT 10
      ) t
    )
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Salesman dashboard stats
CREATE OR REPLACE FUNCTION get_salesman_dashboard(salesman_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_retailers', (SELECT COUNT(*) FROM users WHERE assigned_salesman_id = salesman_uuid AND is_active = true),
    'orders_today', (
      SELECT COUNT(*) FROM orders
      WHERE salesman_id = salesman_uuid AND created_at >= CURRENT_DATE
    ),
    'orders_this_month', (
      SELECT COUNT(*) FROM orders
      WHERE salesman_id = salesman_uuid AND created_at >= date_trunc('month', CURRENT_DATE)
    ),
    'pending_orders', (
      SELECT COUNT(*) FROM orders
      WHERE salesman_id = salesman_uuid AND status = 'pending'
    ),
    'recent_orders', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT o.id, o.total_amount, o.status, o.created_at,
               u.business_name as retailer_name
        FROM orders o
        JOIN users u ON u.id = o.retailer_id
        WHERE o.salesman_id = salesman_uuid
        ORDER BY o.created_at DESC LIMIT 10
      ) t
    )
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Retailer dashboard stats
CREATE OR REPLACE FUNCTION get_retailer_dashboard(retailer_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_orders', (SELECT COUNT(*) FROM orders WHERE retailer_id = retailer_uuid),
    'pending_orders', (SELECT COUNT(*) FROM orders WHERE retailer_id = retailer_uuid AND status = 'pending'),
    'recent_orders', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT o.id, o.total_amount, o.status, o.created_at
        FROM orders o
        WHERE o.retailer_id = retailer_uuid
        ORDER BY o.created_at DESC LIMIT 10
      ) t
    )
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
