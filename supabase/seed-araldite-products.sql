-- ============================================================
-- Araldite Product Catalog — Brand → Product → SKU structure
-- Price list effective 1st August 2024 (Price including GST)
-- Run AFTER schema.sql and seed.sql
-- ============================================================

DO $$
DECLARE
  brand UUID;
  p_standard UUID;
  p_klear20 UUID;
  p_klear120 UUID;
  p_klear5 UUID;
  p_klad_pro UUID;
  p_klad_x UUID;
  p_xin UUID;
  p_easy_fix UUID;
  p_easy_fix_kwik UUID;
  p_sandx_roll UUID;
  p_sandx_sheet UUID;
  p_roff_t16 UUID;
  p_fev_super UUID;
  p_fev_rapid UUID;
  p_fk203 UUID;
  p_fk102 UUID;
  p_hdg UUID;
BEGIN
  SELECT id INTO brand FROM public.brands WHERE name = 'Araldite';
  IF brand IS NULL THEN
    RAISE EXCEPTION 'Brand "Araldite" not found. Run seed.sql first.';
  END IF;

  -- ========== CREATE PRODUCTS ==========
  INSERT INTO public.products (id, brand_id, name, description) VALUES
    (uuid_generate_v4(), brand, 'Standard Epoxy Adhesive', 'Standard 2-part epoxy adhesive')
  RETURNING id INTO p_standard;

  INSERT INTO public.products (id, brand_id, name, description) VALUES
    (uuid_generate_v4(), brand, 'Klear 20 Epoxy Adhesive', 'Crystal clear epoxy, 20-min setting')
  RETURNING id INTO p_klear20;

  INSERT INTO public.products (id, brand_id, name, description) VALUES
    (uuid_generate_v4(), brand, 'Klear 120 Epoxy Adhesive', 'Crystal clear epoxy, 120-min setting')
  RETURNING id INTO p_klear120;

  INSERT INTO public.products (id, brand_id, name, description) VALUES
    (uuid_generate_v4(), brand, 'Klear 5 Epoxy Adhesive', 'Crystal clear epoxy, 5-min rapid')
  RETURNING id INTO p_klear5;

  INSERT INTO public.products (id, brand_id, name, description) VALUES
    (uuid_generate_v4(), brand, 'Klad Pro Epoxy Adhesive', 'Professional grade tile adhesive')
  RETURNING id INTO p_klad_pro;

  INSERT INTO public.products (id, brand_id, name, description) VALUES
    (uuid_generate_v4(), brand, 'Klad X', 'Heavy duty construction adhesive')
  RETURNING id INTO p_klad_x;

  INSERT INTO public.products (id, brand_id, name, description) VALUES
    (uuid_generate_v4(), brand, 'XIN Adhesive', 'Multi-purpose adhesive by Araldite')
  RETURNING id INTO p_xin;

  INSERT INTO public.products (id, brand_id, name, description) VALUES
    (uuid_generate_v4(), brand, 'Easy Fix', 'Quick fix sealant')
  RETURNING id INTO p_easy_fix;

  INSERT INTO public.products (id, brand_id, name, description) VALUES
    (uuid_generate_v4(), brand, 'Easy Fix Kwik', 'Fast-setting sealant')
  RETURNING id INTO p_easy_fix_kwik;

  INSERT INTO public.products (id, brand_id, name, description) VALUES
    (uuid_generate_v4(), brand, 'SandX Roll', 'Sandpaper roll for sanding')
  RETURNING id INTO p_sandx_roll;

  INSERT INTO public.products (id, brand_id, name, description) VALUES
    (uuid_generate_v4(), brand, 'SandX Sheet', 'Sandpaper sheet for finishing')
  RETURNING id INTO p_sandx_sheet;

  INSERT INTO public.products (id, brand_id, name, description) VALUES
    (uuid_generate_v4(), brand, 'Roff T16 Cera Clean', 'Tile and ceramic cleaner')
  RETURNING id INTO p_roff_t16;

  INSERT INTO public.products (id, brand_id, name, description) VALUES
    (uuid_generate_v4(), brand, 'Fevitite Super Strong', 'High-strength epoxy paste')
  RETURNING id INTO p_fev_super;

  INSERT INTO public.products (id, brand_id, name, description) VALUES
    (uuid_generate_v4(), brand, 'Fevitite Rapid & Clear', 'Fast-setting transparent epoxy')
  RETURNING id INTO p_fev_rapid;

  INSERT INTO public.products (id, brand_id, name, description) VALUES
    (uuid_generate_v4(), brand, 'Fevi Kwik 203', 'Low viscosity instant adhesive')
  RETURNING id INTO p_fk203;

  INSERT INTO public.products (id, brand_id, name, description) VALUES
    (uuid_generate_v4(), brand, 'Fevi Kwik 102', 'Low viscosity instant adhesive')
  RETURNING id INTO p_fk102;

  INSERT INTO public.products (id, brand_id, name, description) VALUES
    (uuid_generate_v4(), brand, 'Heavy Duty Gun', 'Sealant dispensing gun')
  RETURNING id INTO p_hdg;

  -- ========== STANDARD EPOXY ADHESIVE SKUs ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_standard, 'ARL-STD-5G',       '5g',        '24x20', 15.00,    20),
    (p_standard, 'ARL-STD-9G',       '9g',        '8x20',  30.00,    40),
    (p_standard, 'ARL-STD-13G',      '13g',       '6x20',  43.00,    60),
    (p_standard, 'ARL-STD-36G',      '36g',       '6x12',  90.00,   130),
    (p_standard, 'ARL-STD-90G',      '90g',       '4x8',  178.00,   220),
    (p_standard, 'ARL-STD-180G',     '180g',      '4x6',  308.00,   380),
    (p_standard, 'ARL-STD-270G',     '270g',      '4x4',  483.00,   580),
    (p_standard, 'ARL-STD-450G',     '450g',      '12',   678.00,   850),
    (p_standard, 'ARL-STD-700G',     '700g',      '8',    820.00,   980),
    (p_standard, 'ARL-STD-1.08KG',   '1.08kg',    '4',   1032.00,  1235),
    (p_standard, 'ARL-STD-1.8KG-IN', '1.8kg IN',  '3',   1350.00,  1625),
    (p_standard, 'ARL-STD-1.8KG-U',  '1.8kg U',   '3',   1541.08,  1855),
    (p_standard, 'ARL-STD-3.6KG',    '3.6kg',     '3',   2434.21,  2775),
    (p_standard, 'ARL-STD-5.4KG',    '5.4kg',     '2',   3671.97,  4200),
    (p_standard, 'ARL-STD-9KG-IN',   '9kg IN',    '4',   5580.94,  6985),
    (p_standard, 'ARL-STD-9KG-U',    '9kg U',     '4',   5586.51,  6995);

  -- ========== KLEAR 20 SKUs ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_klear20, 'ARL-KL20-90G',   '90g',   '4x8', 245.00,   300),
    (p_klear20, 'ARL-KL20-250G',  '250g',  '4x4', 486.00,   650),
    (p_klear20, 'ARL-KL20-450G',  '450g',  '8',   852.00,  1090),
    (p_klear20, 'ARL-KL20-1KG',   '1kg',   '4',  1385.70,  1800),
    (p_klear20, 'ARL-KL20-2KG',   '2kg',   '4',  2284.90,  3200);

  -- ========== KLEAR 120 SKUs ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_klear120, 'ARL-KL120-180G',  '180g',  '4x6', 350.46,  450),
    (p_klear120, 'ARL-KL120-450G',  '450g',  '8',   719.80,  950),
    (p_klear120, 'ARL-KL120-1.8KG', '1.8kg', '3',  1511.53, 1965);

  -- ========== KLEAR 5 SKUs ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_klear5, 'ARL-KL5-5G',      '5g',      '8x20', 42.00,    50),
    (p_klear5, 'ARL-KL5-10G',     '10g',     '6x20', 53.00,    65),
    (p_klear5, 'ARL-KL5-26G',     '26g',     '6x12', 108.00,  135),
    (p_klear5, 'ARL-KL5-90G',     '90g',     '4x8',  245.00,  300),
    (p_klear5, 'ARL-KL5-180G',    '180g',    '3x6',  386.00,  470),
    (p_klear5, 'ARL-KL5-270G',    '270g',    '4x4',  525.00,  630),
    (p_klear5, 'ARL-KL5-450G',    '450g',    '8',    852.00, 1090),
    (p_klear5, 'ARL-KL5-1.08KG',  '1.08kg',  '4',   1487.50, 1785);

  -- ========== KLAD PRO SKUs ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_klad_pro, 'ARL-KPRO-4KG', '4kg', '4', 1521.02, 3250);

  -- ========== KLAD X SKUs ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_klad_x, 'ARL-KLDX-300G',  '300g',  '16', 375.97,  550),
    (p_klad_x, 'ARL-KLDX-1.5KG', '1.5kg', '6', 1399.91, 1800);

  -- ========== XIN SKUs ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_xin, 'ARL-XIN-450G',  '450g',  '40', 432.00,  510),
    (p_xin, 'ARL-XIN-1.8KG', '1.8kg', '3', 1000.00, 1400);

  -- ========== EASY FIX SKUs ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_easy_fix, 'ARL-EF-435G', '435g', '24', 322.86, 565);

  -- ========== EASY FIX KWIK SKUs ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_easy_fix_kwik, 'ARL-EFK-290ML', '290ml', '24', 463.00, 600);

  -- ========== SANDX ROLL SKUs (100mm) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_sandx_roll, 'ARL-SXR-60-100',  'Grit 60 (100mm x 50M)',  '2 X50 M', 1635.22, 2600),
    (p_sandx_roll, 'ARL-SXR-80-100',  'Grit 80 (100mm x 50M)',  '2X50 M',  1468.75, 2350),
    (p_sandx_roll, 'ARL-SXR-100-100', 'Grit 100 (100mm x 50M)', '2X50 M',  1468.75, 2350),
    (p_sandx_roll, 'ARL-SXR-120-100', 'Grit 120 (100mm x 50M)', '2X50 M',  1468.75, 2350),
    (p_sandx_roll, 'ARL-SXR-180-100', 'Grit 180 (100mm x 25M)', '2X25 M',   812.50, 1300),
    (p_sandx_roll, 'ARL-SXR-220-100', 'Grit 220 (100mm x 25M)', '2X25 M',   812.50, 1300),
    (p_sandx_roll, 'ARL-SXR-320-100', 'Grit 320 (100mm x 25M)', '2X25 M',   812.50, 1300);

  -- ========== SANDX ROLL SKUs (75mm) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_sandx_roll, 'ARL-SXR-60-75',  'Grit 60 (75mm x 50M)',  '2X50 M', 1225.96, 2550),
    (p_sandx_roll, 'ARL-SXR-80-75',  'Grit 80 (75mm x 50M)',  '2X50 M', 1225.96, 2550),
    (p_sandx_roll, 'ARL-SXR-100-75', 'Grit 100 (75mm x 50M)', '2X50 M', 1153.85, 2100),
    (p_sandx_roll, 'ARL-SXR-120-75', 'Grit 120 (75mm x 50M)', '2X50 M', 1153.85, 2100),
    (p_sandx_roll, 'ARL-SXR-180-75', 'Grit 180 (75mm x 25M)', '2X25 M',  628.93, 1000),
    (p_sandx_roll, 'ARL-SXR-220-75', 'Grit 220 (75mm x 25M)', '2X25 M',  628.93, 1000),
    (p_sandx_roll, 'ARL-SXR-320-75', 'Grit 320 (75mm x 25M)', '2X25 M',  628.93, 1000);

  -- ========== SANDX SHEET SKUs ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_sandx_sheet, 'ARL-SXS-P80',   'P80 (23x28cm)',   '10 x 50', 721.60,  1250),
    (p_sandx_sheet, 'ARL-SXS-P120',  'P120 (23x28cm)',  '10 x 50', 721.60,  1250),
    (p_sandx_sheet, 'ARL-SXS-P150',  'P150 (23x28cm)',  '10 x 50', 721.60,  1250),
    (p_sandx_sheet, 'ARL-SXS-P180',  'P180 (23x28cm)',  '10 x 50', 721.60,  1250),
    (p_sandx_sheet, 'ARL-SXS-P220',  'P220 (23x28cm)',  '10 x 50', 721.60,  1250),
    (p_sandx_sheet, 'ARL-SXS-P320',  'P320 (23x28cm)',  '10 x 50', 721.60,  1250),
    (p_sandx_sheet, 'ARL-SXS-P400',  'P400 (23x28cm)',  '10 x 50', 721.60,  1250),
    (p_sandx_sheet, 'ARL-SXS-P600',  'P600 (23x28cm)',  '10 x 50', 721.60,  1250),
    (p_sandx_sheet, 'ARL-SXS-P800',  'P800 (23x28cm)',  '10 x 50', 891.25,  1250),
    (p_sandx_sheet, 'ARL-SXS-P1000', 'P1000 (23x28cm)', '10 x 50', 967.03,  1250),
    (p_sandx_sheet, 'ARL-SXS-P1200', 'P1200 (23x28cm)', '10 x 50', 967.03,  1250),
    (p_sandx_sheet, 'ARL-SXS-P1500', 'P1500 (23x28cm)', '10 x 50', 967.03,  1250);

  -- ========== ROFF T16 SKUs ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_roff_t16, 'ARL-T16-500ML', '500ml', '20', 85.00,  150),
    (p_roff_t16, 'ARL-T16-1LTR',  '1 Ltr', '12', 126.00, 225),
    (p_roff_t16, 'ARL-T16-5LTR',  '5 Ltr', '3',  554.60, 990);

  -- ========== FEVITITE SUPER STRONG SKUs ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_fev_super, 'ARL-FSS-450G',  '450g',  '20', 375.00,  500),
    (p_fev_super, 'ARL-FSS-900G',  '900g',  '6',  580.00,  750),
    (p_fev_super, 'ARL-FSS-1.8KG', '1.8kg', '6',  961.00, 1400);

  -- ========== FEVITITE RAPID & CLEAR SKUs ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_fev_rapid, 'ARL-FRC-450G', '450g', '20', 720.00, 1000);

  -- ========== FEVI KWIK 203 SKUs ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_fk203, 'ARL-FK203-20G', '20g', '120', 57.15,   80),
    (p_fk203, 'ARL-FK203-50G', '50g', '40',  114.28, 160);

  -- ========== FEVI KWIK 102 SKUs ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_fk102, 'ARL-FK102-20G', '20g', '60', 50.00, 80);

  -- ========== HEAVY DUTY GUN SKUs ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_hdg, 'ARL-HDG-1', '1 Gun', '20', 706.27, 1399);

  RAISE NOTICE 'Inserted 17 Araldite products with 76 SKUs successfully!';
END $$;
