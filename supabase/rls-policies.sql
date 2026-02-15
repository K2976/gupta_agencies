-- ============================================================
-- Gupta Agencies — Row Level Security Policies
-- Run AFTER schema.sql
-- Safe to re-run (drops existing policies first)
-- ============================================================

-- ============================================================
-- USERS TABLE RLS
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "super_admin_all_users" ON public.users;
CREATE POLICY "super_admin_all_users" ON public.users
  FOR ALL USING (public.is_super_admin());

DROP POLICY IF EXISTS "salesman_read_users" ON public.users;
CREATE POLICY "salesman_read_users" ON public.users
  FOR SELECT USING (
    public.get_user_role() = 'salesman'
    AND (id = auth.uid() OR assigned_salesman_id = auth.uid())
  );

DROP POLICY IF EXISTS "salesman_create_retailer" ON public.users;
CREATE POLICY "salesman_create_retailer" ON public.users
  FOR INSERT WITH CHECK (
    public.get_user_role() = 'salesman'
    AND role = 'retailer'
    AND assigned_salesman_id = auth.uid()
  );

DROP POLICY IF EXISTS "salesman_update_retailer" ON public.users;
CREATE POLICY "salesman_update_retailer" ON public.users
  FOR UPDATE USING (
    public.get_user_role() = 'salesman'
    AND assigned_salesman_id = auth.uid()
    AND role = 'retailer'
  ) WITH CHECK (
    role = 'retailer' AND assigned_salesman_id = auth.uid()
  );

DROP POLICY IF EXISTS "retailer_read_own" ON public.users;
CREATE POLICY "retailer_read_own" ON public.users
  FOR SELECT USING (
    public.get_user_role() = 'retailer' AND id = auth.uid()
  );

-- ============================================================
-- BRANDS TABLE RLS
-- ============================================================
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "super_admin_all_brands" ON public.brands;
CREATE POLICY "super_admin_all_brands" ON public.brands
  FOR ALL USING (public.is_super_admin());

DROP POLICY IF EXISTS "auth_read_active_brands" ON public.brands;
CREATE POLICY "auth_read_active_brands" ON public.brands
  FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);

-- ============================================================
-- PRODUCTS TABLE RLS
-- ============================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "super_admin_all_products" ON public.products;
CREATE POLICY "super_admin_all_products" ON public.products
  FOR ALL USING (public.is_super_admin());

DROP POLICY IF EXISTS "auth_read_active_products" ON public.products;
CREATE POLICY "auth_read_active_products" ON public.products
  FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);

-- ============================================================
-- SKUS TABLE RLS
-- ============================================================
ALTER TABLE public.skus ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "super_admin_all_skus" ON public.skus;
CREATE POLICY "super_admin_all_skus" ON public.skus
  FOR ALL USING (public.is_super_admin());

DROP POLICY IF EXISTS "auth_read_active_skus" ON public.skus;
CREATE POLICY "auth_read_active_skus" ON public.skus
  FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);

-- ============================================================
-- ORDERS TABLE RLS
-- ============================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "super_admin_all_orders" ON public.orders;
CREATE POLICY "super_admin_all_orders" ON public.orders
  FOR ALL USING (public.is_super_admin());

DROP POLICY IF EXISTS "retailer_read_own_orders" ON public.orders;
CREATE POLICY "retailer_read_own_orders" ON public.orders
  FOR SELECT USING (
    public.get_user_role() = 'retailer' AND retailer_id = auth.uid()
  );

DROP POLICY IF EXISTS "retailer_create_order" ON public.orders;
CREATE POLICY "retailer_create_order" ON public.orders
  FOR INSERT WITH CHECK (
    public.get_user_role() = 'retailer' AND retailer_id = auth.uid()
  );

DROP POLICY IF EXISTS "salesman_read_orders" ON public.orders;
CREATE POLICY "salesman_read_orders" ON public.orders
  FOR SELECT USING (
    public.get_user_role() = 'salesman' AND salesman_id = auth.uid()
  );

-- ============================================================
-- ORDER ITEMS TABLE RLS
-- ============================================================
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "super_admin_all_order_items" ON public.order_items;
CREATE POLICY "super_admin_all_order_items" ON public.order_items
  FOR ALL USING (public.is_super_admin());

DROP POLICY IF EXISTS "retailer_read_own_items" ON public.order_items;
CREATE POLICY "retailer_read_own_items" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.retailer_id = auth.uid())
  );

DROP POLICY IF EXISTS "retailer_create_items" ON public.order_items;
CREATE POLICY "retailer_create_items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.retailer_id = auth.uid())
  );

DROP POLICY IF EXISTS "salesman_read_order_items" ON public.order_items;
CREATE POLICY "salesman_read_order_items" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.salesman_id = auth.uid())
  );
