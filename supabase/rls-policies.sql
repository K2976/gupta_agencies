-- ============================================================
-- Gupta Agencies — Row Level Security Policies
-- Run AFTER schema.sql
-- ============================================================

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to check if current user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- USERS TABLE RLS
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Super Admin: full access
CREATE POLICY "super_admin_all_users" ON public.users
  FOR ALL USING (public.is_super_admin());

-- Salesman: read own profile + assigned retailers
CREATE POLICY "salesman_read_users" ON public.users
  FOR SELECT USING (
    public.get_user_role() = 'salesman'
    AND (
      id = auth.uid()                                   -- own profile
      OR assigned_salesman_id = auth.uid()              -- assigned retailers
    )
  );

-- Salesman: create retailer accounts
CREATE POLICY "salesman_create_retailer" ON public.users
  FOR INSERT WITH CHECK (
    public.get_user_role() = 'salesman'
    AND role = 'retailer'
    AND assigned_salesman_id = auth.uid()
  );

-- Salesman: update assigned retailer basic info
CREATE POLICY "salesman_update_retailer" ON public.users
  FOR UPDATE USING (
    public.get_user_role() = 'salesman'
    AND assigned_salesman_id = auth.uid()
    AND role = 'retailer'
  ) WITH CHECK (
    role = 'retailer'
    AND assigned_salesman_id = auth.uid()
  );

-- Retailer: read own profile only
CREATE POLICY "retailer_read_own" ON public.users
  FOR SELECT USING (
    public.get_user_role() = 'retailer'
    AND id = auth.uid()
  );

-- ============================================================
-- BRANDS TABLE RLS
-- ============================================================
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Super Admin: full access
CREATE POLICY "super_admin_all_brands" ON public.brands
  FOR ALL USING (public.is_super_admin());

-- Authenticated users: read active brands
CREATE POLICY "auth_read_active_brands" ON public.brands
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND is_active = true
  );

-- ============================================================
-- PRODUCTS TABLE RLS
-- ============================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Super Admin: full access
CREATE POLICY "super_admin_all_products" ON public.products
  FOR ALL USING (public.is_super_admin());

-- Authenticated users: read active products
CREATE POLICY "auth_read_active_products" ON public.products
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND is_active = true
  );

-- ============================================================
-- ORDERS TABLE RLS
-- ============================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Super Admin: full access
CREATE POLICY "super_admin_all_orders" ON public.orders
  FOR ALL USING (public.is_super_admin());

-- Retailer: read own orders
CREATE POLICY "retailer_read_own_orders" ON public.orders
  FOR SELECT USING (
    public.get_user_role() = 'retailer'
    AND retailer_id = auth.uid()
  );

-- Retailer: create own orders
CREATE POLICY "retailer_create_order" ON public.orders
  FOR INSERT WITH CHECK (
    public.get_user_role() = 'retailer'
    AND retailer_id = auth.uid()
  );

-- Salesman: read orders of assigned retailers
CREATE POLICY "salesman_read_orders" ON public.orders
  FOR SELECT USING (
    public.get_user_role() = 'salesman'
    AND salesman_id = auth.uid()
  );

-- ============================================================
-- ORDER ITEMS TABLE RLS
-- ============================================================
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Super Admin: full access
CREATE POLICY "super_admin_all_order_items" ON public.order_items
  FOR ALL USING (public.is_super_admin());

-- Retailer: read own order items
CREATE POLICY "retailer_read_own_items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.retailer_id = auth.uid()
    )
  );

-- Retailer: create items for own orders
CREATE POLICY "retailer_create_items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.retailer_id = auth.uid()
    )
  );

-- Salesman: read items of assigned retailer orders
CREATE POLICY "salesman_read_order_items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.salesman_id = auth.uid()
    )
  );
