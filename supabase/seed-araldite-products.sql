-- ============================================================
-- Araldite Product Catalog — All SKUs
-- Price list effective 1st August 2024 (Price including GST)
-- Run this AFTER schema.sql and seed.sql
-- ============================================================

-- Get the Araldite brand ID
DO $$
DECLARE
  brand UUID;
BEGIN
  SELECT id INTO brand FROM public.brands WHERE name = 'Araldite';
  IF brand IS NULL THEN
    RAISE EXCEPTION 'Brand "Araldite" not found. Run seed.sql first.';
  END IF;

  -- ========== STANDARD EPOXY ADHESIVE ==========
  INSERT INTO public.products (brand_id, sku_code, product_name, dealer_price, mrp) VALUES
    (brand, 'ARL-STD-5G',       'Standard Epoxy Adhesive 5g',         15.00,    20),
    (brand, 'ARL-STD-9G',       'Standard Epoxy Adhesive 9g',         30.00,    40),
    (brand, 'ARL-STD-13G',      'Standard Epoxy Adhesive 13g',        43.00,    60),
    (brand, 'ARL-STD-36G',      'Standard Epoxy Adhesive 36g',        90.00,   130),
    (brand, 'ARL-STD-90G',      'Standard Epoxy Adhesive 90g',       178.00,   220),
    (brand, 'ARL-STD-180G',     'Standard Epoxy Adhesive 180g',      308.00,   380),
    (brand, 'ARL-STD-270G',     'Standard Epoxy Adhesive 270g',      483.00,   580),
    (brand, 'ARL-STD-450G',     'Standard Epoxy Adhesive 450g',      678.00,   850),
    (brand, 'ARL-STD-700G',     'Standard Epoxy Adhesive 700g',      820.00,   980),
    (brand, 'ARL-STD-1.08KG',   'Standard Epoxy Adhesive 1.08kg',   1032.00,  1235),
    (brand, 'ARL-STD-1.8KG-IN', 'Standard Epoxy Adhesive 1.8kg IN', 1350.00,  1625),
    (brand, 'ARL-STD-1.8KG-U',  'Standard Epoxy Adhesive 1.8kg U',  1541.08,  1855),
    (brand, 'ARL-STD-3.6KG',    'Standard Epoxy Adhesive 3.6kg',    2434.21,  2775),
    (brand, 'ARL-STD-5.4KG',    'Standard Epoxy Adhesive 5.4kg',    3671.97,  4200),
    (brand, 'ARL-STD-9KG-IN',   'Standard Epoxy Adhesive 9kg IN',   5580.94,  6985),
    (brand, 'ARL-STD-9KG-U',    'Standard Epoxy Adhesive 9kg U',    5586.51,  6995);

  -- ========== KLEAR 20 EPOXY ADHESIVE ==========
  INSERT INTO public.products (brand_id, sku_code, product_name, dealer_price, mrp) VALUES
    (brand, 'ARL-KL20-90G',    'Klear 20 Epoxy Adhesive 90g',       245.00,   300),
    (brand, 'ARL-KL20-250G',   'Klear 20 Epoxy Adhesive 250g',      486.00,   650),
    (brand, 'ARL-KL20-450G',   'Klear 20 Epoxy Adhesive 450g',      852.00,  1090),
    (brand, 'ARL-KL20-1KG',    'Klear 20 Epoxy Adhesive 1kg',      1385.70,  1800),
    (brand, 'ARL-KL20-2KG',    'Klear 20 Epoxy Adhesive 2kg',      2284.90,  3200);

  -- ========== KLEAR 120 EPOXY ADHESIVE ==========
  INSERT INTO public.products (brand_id, sku_code, product_name, dealer_price, mrp) VALUES
    (brand, 'ARL-KL120-180G',  'Klear 120 Epoxy Adhesive 180g',     350.46,   450),
    (brand, 'ARL-KL120-450G',  'Klear 120 Epoxy Adhesive 450g',     719.80,   950),
    (brand, 'ARL-KL120-1.8KG', 'Klear 120 Epoxy Adhesive 1.8kg',   1511.53,  1965);

  -- ========== KLEAR 5 EPOXY ADHESIVE ==========
  INSERT INTO public.products (brand_id, sku_code, product_name, dealer_price, mrp) VALUES
    (brand, 'ARL-KL5-5G',      'Klear 5 Epoxy Adhesive 5g',          42.00,    50),
    (brand, 'ARL-KL5-10G',     'Klear 5 Epoxy Adhesive 10g',         53.00,    65),
    (brand, 'ARL-KL5-26G',     'Klear 5 Epoxy Adhesive 26g',        108.00,   135),
    (brand, 'ARL-KL5-90G',     'Klear 5 Epoxy Adhesive 90g',        245.00,   300),
    (brand, 'ARL-KL5-180G',    'Klear 5 Epoxy Adhesive 180g',       386.00,   470),
    (brand, 'ARL-KL5-270G',    'Klear 5 Epoxy Adhesive 270g',       525.00,   630),
    (brand, 'ARL-KL5-450G',    'Klear 5 Epoxy Adhesive 450g',       852.00,  1090),
    (brand, 'ARL-KL5-1.08KG',  'Klear 5 Epoxy Adhesive 1.08kg',   1487.50,  1785);

  -- ========== KLAD PRO EPOXY ADHESIVE ==========
  INSERT INTO public.products (brand_id, sku_code, product_name, dealer_price, mrp) VALUES
    (brand, 'ARL-KPRO-4KG',    'Klad Pro Epoxy Adhesive 4kg',      1521.02,  3250);

  -- ========== KLAD X ==========
  INSERT INTO public.products (brand_id, sku_code, product_name, dealer_price, mrp) VALUES
    (brand, 'ARL-KLDX-300G',   'Klad X 300g',                       375.97,   550),
    (brand, 'ARL-KLDX-1.5KG',  'Klad X 1.5kg',                    1399.91,  1800);

  -- ========== XIN (Product of Araldite) ==========
  INSERT INTO public.products (brand_id, sku_code, product_name, dealer_price, mrp) VALUES
    (brand, 'ARL-XIN-450G',    'XIN Adhesive 450g',                  432.00,   510),
    (brand, 'ARL-XIN-1.8KG',   'XIN Adhesive 1.8kg',               1000.00,  1400);

  -- ========== EASY FIX ==========
  INSERT INTO public.products (brand_id, sku_code, product_name, dealer_price, mrp) VALUES
    (brand, 'ARL-EF-435G',     'Easy Fix 435g',                      322.86,   565);

  -- ========== EASY FIX KWIK ==========
  INSERT INTO public.products (brand_id, sku_code, product_name, dealer_price, mrp) VALUES
    (brand, 'ARL-EFK-290ML',   'Easy Fix Kwik 290ml',                463.00,   600);

  -- ========== SANDX ROLL (100mm width) ==========
  INSERT INTO public.products (brand_id, sku_code, product_name, dealer_price, mrp) VALUES
    (brand, 'ARL-SXR-60-100',  'SandX Roll Grit 60 (100mm x 50M)',   1635.22,  2600),
    (brand, 'ARL-SXR-80-100',  'SandX Roll Grit 80 (100mm x 50M)',   1468.75,  2350),
    (brand, 'ARL-SXR-100-100', 'SandX Roll Grit 100 (100mm x 50M)',  1468.75,  2350),
    (brand, 'ARL-SXR-120-100', 'SandX Roll Grit 120 (100mm x 50M)',  1468.75,  2350),
    (brand, 'ARL-SXR-180-100', 'SandX Roll Grit 180 (100mm x 25M)',   812.50,  1300),
    (brand, 'ARL-SXR-220-100', 'SandX Roll Grit 220 (100mm x 25M)',   812.50,  1300),
    (brand, 'ARL-SXR-320-100', 'SandX Roll Grit 320 (100mm x 25M)',   812.50,  1300);

  -- ========== SANDX ROLL (75mm width) ==========
  INSERT INTO public.products (brand_id, sku_code, product_name, dealer_price, mrp) VALUES
    (brand, 'ARL-SXR-60-75',   'SandX Roll Grit 60 (75mm x 50M)',   1225.96,  2550),
    (brand, 'ARL-SXR-80-75',   'SandX Roll Grit 80 (75mm x 50M)',   1225.96,  2550),
    (brand, 'ARL-SXR-100-75',  'SandX Roll Grit 100 (75mm x 50M)',  1153.85,  2100),
    (brand, 'ARL-SXR-120-75',  'SandX Roll Grit 120 (75mm x 50M)',  1153.85,  2100),
    (brand, 'ARL-SXR-180-75',  'SandX Roll Grit 180 (75mm x 25M)',   628.93,  1000),
    (brand, 'ARL-SXR-220-75',  'SandX Roll Grit 220 (75mm x 25M)',   628.93,  1000),
    (brand, 'ARL-SXR-320-75',  'SandX Roll Grit 320 (75mm x 25M)',   628.93,  1000);

  -- ========== SANDX SHEET (23 x 28 cm) ==========
  INSERT INTO public.products (brand_id, sku_code, product_name, dealer_price, mrp) VALUES
    (brand, 'ARL-SXS-P80',     'SandX Sheet P80 (23x28cm)',          721.60,  1250),
    (brand, 'ARL-SXS-P120',    'SandX Sheet P120 (23x28cm)',         721.60,  1250),
    (brand, 'ARL-SXS-P150',    'SandX Sheet P150 (23x28cm)',         721.60,  1250),
    (brand, 'ARL-SXS-P180',    'SandX Sheet P180 (23x28cm)',         721.60,  1250),
    (brand, 'ARL-SXS-P220',    'SandX Sheet P220 (23x28cm)',         721.60,  1250),
    (brand, 'ARL-SXS-P320',    'SandX Sheet P320 (23x28cm)',         721.60,  1250),
    (brand, 'ARL-SXS-P400',    'SandX Sheet P400 (23x28cm)',         721.60,  1250),
    (brand, 'ARL-SXS-P600',    'SandX Sheet P600 (23x28cm)',         721.60,  1250),
    (brand, 'ARL-SXS-P800',    'SandX Sheet P800 (23x28cm)',         891.25,  1250),
    (brand, 'ARL-SXS-P1000',   'SandX Sheet P1000 (23x28cm)',        967.03,  1250),
    (brand, 'ARL-SXS-P1200',   'SandX Sheet P1200 (23x28cm)',        967.03,  1250),
    (brand, 'ARL-SXS-P1500',   'SandX Sheet P1500 (23x28cm)',        967.03,  1250);

  -- ========== ROFF T16 CERA CLEAN ==========
  INSERT INTO public.products (brand_id, sku_code, product_name, dealer_price, mrp) VALUES
    (brand, 'ARL-T16-500ML',   'Roff T16 Cera Clean 500ml',           85.00,   150),
    (brand, 'ARL-T16-1LTR',    'Roff T16 Cera Clean 1 Ltr',          126.00,   225),
    (brand, 'ARL-T16-5LTR',    'Roff T16 Cera Clean 5 Ltr',          554.60,   990);

  -- ========== FEVITITE SUPER STRONG ==========
  INSERT INTO public.products (brand_id, sku_code, product_name, dealer_price, mrp) VALUES
    (brand, 'ARL-FSS-450G',    'Fevitite Super Strong 450g',          375.00,   500),
    (brand, 'ARL-FSS-900G',    'Fevitite Super Strong 900g',          580.00,   750),
    (brand, 'ARL-FSS-1.8KG',   'Fevitite Super Strong 1.8kg',        961.00,  1400);

  -- ========== FEVITITE RAPID & CLEAR ==========
  INSERT INTO public.products (brand_id, sku_code, product_name, dealer_price, mrp) VALUES
    (brand, 'ARL-FRC-450G',    'Fevitite Rapid & Clear 450g',         720.00,  1000);

  -- ========== FEVI KWIK 203 LOW VISCOSITY ==========
  INSERT INTO public.products (brand_id, sku_code, product_name, dealer_price, mrp) VALUES
    (brand, 'ARL-FK203-20G',   'Fevi Kwik 203 Low Viscosity 20g',      57.15,    80),
    (brand, 'ARL-FK203-50G',   'Fevi Kwik 203 Low Viscosity 50g',     114.28,   160);

  -- ========== FEVI KWIK 102 LOW VISCOSITY ==========
  INSERT INTO public.products (brand_id, sku_code, product_name, dealer_price, mrp) VALUES
    (brand, 'ARL-FK102-20G',   'Fevi Kwik 102 Low Viscosity 20g',      50.00,    80);

  -- ========== HEAVY DUTY GUN ==========
  INSERT INTO public.products (brand_id, sku_code, product_name, dealer_price, mrp) VALUES
    (brand, 'ARL-HDG-1',       'Heavy Duty Gun',                      706.27,  1399);

  RAISE NOTICE 'Inserted all Araldite products successfully!';
END $$;
