-- ============================================================
-- Dr. Fixit Product Catalog — Brand → Product → SKU
-- Prices: Retailer Landing Price (incl GST) as dealer_price
-- Run AFTER schema.sql + seed.sql
-- ============================================================

DO $$
DECLARE
  brand UUID;
  p_pidiproof UUID;
  p_powder_wp UUID;
  p_pidicrete_urp UUID;
  p_super_latex UUID;
  p_pidicrete_mpb UUID;
  p_pidicrete_wp UUID;
  p_all_seal UUID;
  p_powercrete UUID;
  p_primeseal UUID;
  p_raincoat_classic UUID;
  p_raincoat_select UUID;
  p_raincoat_coating UUID;
  p_raincoat_neo UUID;
  p_roofseal_select UUID;
  p_roofseal_classic UUID;
  p_roofseal_ultra UUID;
  p_sureseal UUID;
  p_raincoat_star UUID;
  p_pidifin_2k UUID;
  p_fastflex UUID;
  p_bitufix UUID;
  p_repellin UUID;
  p_dampguard UUID;
  p_krystalline UUID;
  p_epoxy_bond UUID;
  p_rust_remover UUID;
  p_pidicrete_am UUID;
  p_crackx_powder UUID;
  p_crackx_paste UUID;
  p_wall_putty UUID;
  p_primo_putty UUID;
  p_primo_white UUID;
  p_feviseal_gp UUID;
  p_feviseal_neutral UUID;
  p_feviseal_wp UUID;
  p_feviseal_hy100 UUID;
  p_feviseal_hy300 UUID;
  p_feviseal_multi UUID;
  p_mseal_bk UUID;
  p_fevimate_tc UUID;
  p_roff_cera UUID;
BEGIN
  -- Get or create brand
  SELECT id INTO brand FROM public.brands WHERE name = 'Dr. Fixit';
  IF brand IS NULL THEN
    INSERT INTO public.brands (name, is_active) VALUES ('Dr. Fixit', true) RETURNING id INTO brand;
  END IF;

  -- ========== CREATE PRODUCTS ==========

  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Pidiproof LW+', 'Integral liquid waterproofing compound for concrete & plaster') RETURNING id INTO p_pidiproof;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Powder Waterproof', 'Integral powder waterproofing compound for plaster & concrete') RETURNING id INTO p_powder_wp;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Pidicrete URP', 'SBR Latex for waterproofing & repairs') RETURNING id INTO p_pidicrete_urp;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Super Latex', 'SBR Latex for waterproofing & repairs') RETURNING id INTO p_super_latex;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Pidicrete MPB', 'Acrylic multi-purpose binder') RETURNING id INTO p_pidicrete_mpb;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Pidicrete WP', 'Acrylic waterproof polymer') RETURNING id INTO p_pidicrete_wp;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'All Seal', 'High strength Si bond polymer for waterproofing') RETURNING id INTO p_all_seal;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Powercrete', 'Acrylic polymer for waterproofing & repairs') RETURNING id INTO p_powercrete;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Primeseal', 'Efflorescence resistant penetrating primer') RETURNING id INTO p_primeseal;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Raincoat Classic', 'High build durable exterior elastomeric waterproof coating') RETURNING id INTO p_raincoat_classic;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Raincoat Select', 'High performance exterior waterproof coating') RETURNING id INTO p_raincoat_select;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Raincoat Waterproof Coating', 'Universal elastomeric base coat for exterior waterproof coating') RETURNING id INTO p_raincoat_coating;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Raincoat Neo', 'Premium high build waterproof acrylic coating for exterior surfaces') RETURNING id INTO p_raincoat_neo;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Roofseal Select', 'Heavy duty reinforced trafficable waterproof coating') RETURNING id INTO p_roofseal_select;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Roofseal Classic New', 'Unique heat reflecting roof waterproof coating') RETURNING id INTO p_roofseal_classic;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Roofseal Ultra', 'Next generation PU based roof waterproofing coating') RETURNING id INTO p_roofseal_ultra;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Sureseal', 'Waterproof coating (all rounder)') RETURNING id INTO p_sureseal;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Raincoat Star', 'High build durable exterior elastomeric waterproof coating') RETURNING id INTO p_raincoat_star;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Pidifin 2K', 'Acrylic cementitious two component waterproof coating') RETURNING id INTO p_pidifin_2k;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Fastflex', 'High performance polymer modified cementitious coating') RETURNING id INTO p_fastflex;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Bitufix', 'Bitumen emulsion paint for DPC') RETURNING id INTO p_bitufix;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Repellin WR', 'Silicone based water repellent for exterior surfaces') RETURNING id INTO p_repellin;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Dampguard Classic', 'Damp-proof coating for internal walls and RCC water tanks') RETURNING id INTO p_dampguard;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Krystalline', 'Cementitious concrete waterproofing') RETURNING id INTO p_krystalline;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Epoxy Bonding Agent', 'Two part solvent free epoxy resin based bonding agent') RETURNING id INTO p_epoxy_bond;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Rust Remover', 'Liquid for cleaning re-bars & steel surfaces') RETURNING id INTO p_rust_remover;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Pidicrete AM', 'Expansive plasticising admixture & grouting aid') RETURNING id INTO p_pidicrete_am;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Crack-X Powder', 'Non-shrink high strength powder crack filler') RETURNING id INTO p_crackx_powder;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Crack-X Paste', 'Ready to use high strength filler for cracks in plaster') RETURNING id INTO p_crackx_paste;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Waterproof Wall Putty', 'Cement based waterproof wall putty') RETURNING id INTO p_wall_putty;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Primo Putty', 'Acrylic exterior wall putty primer') RETURNING id INTO p_primo_putty;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Primo White', 'Alkali resistance acrylic exterior wall primer') RETURNING id INTO p_primo_white;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Feviseal GP Pro', 'Acetic cure silicone sealant for windows') RETURNING id INTO p_feviseal_gp;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Feviseal Neutral Pro', 'Silicone sealant') RETURNING id INTO p_feviseal_neutral;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Feviseal Weatherproof Pro', 'Silicone sealant') RETURNING id INTO p_feviseal_wp;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Feviseal HY 100', 'Low modulus hybrid sealant') RETURNING id INTO p_feviseal_hy100;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Feviseal HY 300', 'High modulus hybrid sealant') RETURNING id INTO p_feviseal_hy300;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Feviseal Multipurpose Acrylic Sealant', 'One pack elastomeric acrylic sealant') RETURNING id INTO p_feviseal_multi;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'M-Seal Feviseal Bathroom & Kitchen', 'Gap filling acrylic sealant') RETURNING id INTO p_mseal_bk;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Fevimate TC', 'One pack water resistant tile grout') RETURNING id INTO p_fevimate_tc;
  INSERT INTO public.products (brand_id, name, description) VALUES
    (brand, 'Roff Cera Clean', 'High performance tile cleaner') RETURNING id INTO p_roff_cera;

  -- ========== PIDIPROOF LW+ (101) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_pidiproof, 'DRF-101-200ML', '200 ML', NULL, 35.40, 47),
    (p_pidiproof, 'DRF-101-1LT',   '1 LT',   NULL, 128.74, 185),
    (p_pidiproof, 'DRF-101-5LT',   '5 LT',   NULL, 551.53, 770),
    (p_pidiproof, 'DRF-101-10LT',  '10 LT',  NULL, 1085.25, 1460),
    (p_pidiproof, 'DRF-101-20LT',  '20 LT',  NULL, 1936.14, 2600),
    (p_pidiproof, 'DRF-101-50LT',  '50 LT',  NULL, 4462.29, 5680),
    (p_pidiproof, 'DRF-101-100LT', '100 LT', NULL, 8221.53, 10365);

  -- ========== POWDER WATERPROOF (105) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_powder_wp, 'DRF-105-500GM', '500 GM', NULL, 31.86, 50);

  -- ========== PIDICRETE URP (301) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_pidicrete_urp, 'DRF-301-200GM', '200 GM',  NULL, 73.16, 110),
    (p_pidicrete_urp, 'DRF-301-500GM', '500 GM',  NULL, 148.68, 230),
    (p_pidicrete_urp, 'DRF-301-1KG',   '1 KG',   NULL, 289.10, 430),
    (p_pidicrete_urp, 'DRF-301-5KG',   '5 KG',   NULL, 1302.72, 2060),
    (p_pidicrete_urp, 'DRF-301-10KG',  '10 KG',  NULL, 2534.64, 3790),
    (p_pidicrete_urp, 'DRF-301-20KG',  '20 KG',  NULL, 4499.34, 6490),
    (p_pidicrete_urp, 'DRF-301-50KG',  '50 KG',  NULL, 10289.60, 14815),
    (p_pidicrete_urp, 'DRF-301-225KG', '225 KG', NULL, 42773.36, 52965);

  -- ========== SUPER LATEX (302) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_super_latex, 'DRF-302-200GM', '200 GM', NULL, 75.52, 105),
    (p_super_latex, 'DRF-302-500GM', '500 GM', NULL, 168.74, 280),
    (p_super_latex, 'DRF-302-1KG',   '1 KG',  NULL, 304.44, 470),
    (p_super_latex, 'DRF-302-5KG',   '5 KG',  NULL, 1432.52, 2170),
    (p_super_latex, 'DRF-302-20KG',  '20 KG', NULL, 5059.84, 7740);

  -- ========== PIDICRETE MPB (303) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_pidicrete_mpb, 'DRF-303-1KG',  '1 KG',  NULL, 292.64, 405),
    (p_pidicrete_mpb, 'DRF-303-10KG', '10 KG', NULL, 2515.76, 3540);

  -- ========== PIDICRETE WP (233) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_pidicrete_wp, 'DRF-233-1KG',  '1 KG',  NULL, 244.26, 335),
    (p_pidicrete_wp, 'DRF-233-5KG',  '5 KG',  NULL, 1121.00, 1510),
    (p_pidicrete_wp, 'DRF-233-20KG', '20 KG', NULL, 4197.26, 5610);

  -- ========== ALL SEAL (307) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_all_seal, 'DRF-307-1KG',  '1 KG',  NULL, 325.68, 475),
    (p_all_seal, 'DRF-307-5KG',  '5 KG',  NULL, 1522.20, 2220),
    (p_all_seal, 'DRF-307-10KG', '10 KG', NULL, 2849.70, 4150),
    (p_all_seal, 'DRF-307-20KG', '20 KG', NULL, 4872.22, 7095),
    (p_all_seal, 'DRF-307-50KG', '50 KG', NULL, 10877.24, 12685);

  -- ========== POWERCRETE (304) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_powercrete, 'DRF-304-20KG',  '20 KG',  NULL, 3518.76, 4600),
    (p_powercrete, 'DRF-304-50KG',  '50 KG',  NULL, 8248.20, 10835),
    (p_powercrete, 'DRF-304-100KG', '100 KG', NULL, 15167.72, 19835);

  -- ========== PRIMESEAL (604) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_primeseal, 'DRF-604-1LT',  '1 LT',  NULL, 278.48, 395),
    (p_primeseal, 'DRF-604-4LT',  '4 LT',  NULL, 1005.36, 1410),
    (p_primeseal, 'DRF-604-10LT', '10 LT', NULL, 2374.16, 3320),
    (p_primeseal, 'DRF-604-20LT', '20 LT', NULL, 4163.04, 6480);

  -- ========== RAINCOAT CLASSIC (641) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_raincoat_classic, 'DRF-641-1LT-WB',    '1 LT (White Base)',      NULL, 481.44, 755),
    (p_raincoat_classic, 'DRF-641-4LT-WB',    '4 LT (White Base)',      NULL, 1746.40, 2585),
    (p_raincoat_classic, 'DRF-641-10LT-WB',   '10 LT (White Base)',     NULL, 4122.92, 6100),
    (p_raincoat_classic, 'DRF-641-20LT-WB',   '20 LT (White Base)',     NULL, 8073.56, 11950),
    (p_raincoat_classic, 'DRF-641-950ML-MB',   '950 ML (Midtone Base)',  NULL, 425.98, 630),
    (p_raincoat_classic, 'DRF-641-3.8LT-MB',  '3.8 LT (Midtone Base)', NULL, 1636.90, 2425),
    (p_raincoat_classic, 'DRF-641-19LT-MB',   '19 LT (Midtone Base)',   NULL, 7642.86, 11310),
    (p_raincoat_classic, 'DRF-641-950ML-DB',   '950 ML (Dark Base)',     NULL, 417.48, 620),
    (p_raincoat_classic, 'DRF-641-3.8LT-DB',  '3.8 LT (Dark Base)',     NULL, 1534.24, 2270),
    (p_raincoat_classic, 'DRF-641-19LT-DB',   '19 LT (Dark Base)',      NULL, 7154.34, 10550);

  -- ========== RAINCOAT SELECT (642) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_raincoat_select, 'DRF-642-1LT-WB',    '1 LT (White Base)',      NULL, 548.70, 810),
    (p_raincoat_select, 'DRF-642-4LT-WB',    '4 LT (White Base)',      NULL, 1993.02, 2950),
    (p_raincoat_select, 'DRF-642-10LT-WB',   '10 LT (White Base)',     NULL, 4897.00, 7250),
    (p_raincoat_select, 'DRF-642-20LT-WB',   '20 LT (White Base)',     NULL, 9470.68, 14075),
    (p_raincoat_select, 'DRF-642-950ML-MB',   '950 ML (Midtone Base)',  NULL, 494.18, 730),
    (p_raincoat_select, 'DRF-642-3.8LT-MB',  '3.8 LT (Midtone Base)', NULL, 1895.32, 2805),
    (p_raincoat_select, 'DRF-642-9.5LT-MB',  '9.5 LT (Midtone Base)', NULL, 3877.48, 5300),
    (p_raincoat_select, 'DRF-642-19LT-MB',   '19 LT (Midtone Base)',   NULL, 8824.04, 13060),
    (p_raincoat_select, 'DRF-642-950ML-DB',   '950 ML (Dark Base)',     NULL, 462.32, 685),
    (p_raincoat_select, 'DRF-642-3.8LT-DB',  '3.8 LT (Dark Base)',     NULL, 1805.64, 2670),
    (p_raincoat_select, 'DRF-642-9.5LT-DB',  '9.5 LT (Dark Base)',     NULL, 3580.12, 4490),
    (p_raincoat_select, 'DRF-642-19LT-DB',   '19 LT (Dark Base)',      NULL, 8016.92, 11865);

  -- ========== RAINCOAT WATERPROOF COATING (643) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_raincoat_coating, 'DRF-643-1LT',  '1 LT',  NULL, 365.80, 540),
    (p_raincoat_coating, 'DRF-643-4LT',  '4 LT',  NULL, 1542.26, 1865),
    (p_raincoat_coating, 'DRF-643-10LT', '10 LT', NULL, 2987.76, 4420),
    (p_raincoat_coating, 'DRF-643-20LT', '20 LT', NULL, 5708.84, 8450);

  -- ========== RAINCOAT NEO (651) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_raincoat_neo, 'DRF-651-1LT-WB',    '1 LT (White Base)',      NULL, 259.60, 385),
    (p_raincoat_neo, 'DRF-651-4LT-WB',    '4 LT (White Base)',      NULL, 1005.36, 1490),
    (p_raincoat_neo, 'DRF-651-10LT-WB',   '10 LT (White Base)',     NULL, 2394.22, 3545),
    (p_raincoat_neo, 'DRF-651-20LT-WB',   '20 LT (White Base)',     NULL, 4714.10, 6835),
    (p_raincoat_neo, 'DRF-651-950ML-MB',   '950 ML (Midtone Base)',  NULL, 795.44, 1390),
    (p_raincoat_neo, 'DRF-651-3.8LT-MB',  '3.8 LT (Midtone Base)', NULL, 4375.97, 6480),
    (p_raincoat_neo, 'DRF-651-950ML-DB',   '950 ML (Dark Base)',     NULL, 234.58, 345),
    (p_raincoat_neo, 'DRF-651-3.8LT-DB',  '3.8 LT (Dark Base)',     NULL, 898.22, 1330),
    (p_raincoat_neo, 'DRF-651-19LT-DB',   '19 LT (Dark Base)',      NULL, 3810.46, 5760),
    (p_raincoat_neo, 'DRF-651-950ML-YB',   '950 ML (Yellow Base)',  NULL, 287.68, 425),
    (p_raincoat_neo, 'DRF-651-3.8LT-YB',  '3.8 LT (Yellow Base)',  NULL, 1115.34, 1650),
    (p_raincoat_neo, 'DRF-651-19LT-YB',   '19 LT (Yellow Base)',   NULL, 5169.18, 7650);

  -- ========== ROOFSEAL SELECT (653) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_roofseal_select, 'DRF-653-4LT-W',   '4 LT (White)',      NULL, 1342.84, 1950),
    (p_roofseal_select, 'DRF-653-20LT-W',  '20 LT (White)',     NULL, 6310.40, 8800),
    (p_roofseal_select, 'DRF-653-20LT-G',  '20 LT (Grey)',      NULL, 6310.40, 8800),
    (p_roofseal_select, 'DRF-653-4LT-T',   '4 LT (Terracotta)', NULL, 1342.84, 1950),
    (p_roofseal_select, 'DRF-653-20LT-T',  '20 LT (Terracotta)', NULL, 6310.64, 8800);

  -- ========== ROOFSEAL CLASSIC NEW (652) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_roofseal_classic, 'DRF-652-1LT-W',   '1 LT (White)',      NULL, 285.56, 465),
    (p_roofseal_classic, 'DRF-652-4LT-W',   '4 LT (White)',      NULL, 1070.26, 1675),
    (p_roofseal_classic, 'DRF-652-10LT-W',  '10 LT (White)',     NULL, 2499.26, 4075),
    (p_roofseal_classic, 'DRF-652-16LT-W',  '16 LT (White)',     NULL, 3994.06, 6600),
    (p_roofseal_classic, 'DRF-652-20LT-W',  '20 LT (White)',     NULL, 4783.72, 7555),
    (p_roofseal_classic, 'DRF-652-4LT-G',   '4 LT (Grey)',       NULL, 1070.26, 1675),
    (p_roofseal_classic, 'DRF-652-20LT-G',  '20 LT (Grey)',      NULL, 4783.72, 7555),
    (p_roofseal_classic, 'DRF-652-4LT-T',   '4 LT (Terracotta)', NULL, 1070.26, 1675),
    (p_roofseal_classic, 'DRF-652-20LT-T',  '20 LT (Terracotta)', NULL, 4783.72, 7555);

  -- ========== ROOFSEAL ULTRA (654) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_roofseal_ultra, 'DRF-654-7LT', '7 LT', NULL, 8752.06, 11310);

  -- ========== SURESEAL (610) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_sureseal, 'DRF-610-1KG',  '1 KG',  NULL, 252.52, 390),
    (p_sureseal, 'DRF-610-5KG',  '5 KG',  NULL, 1222.48, 1800),
    (p_sureseal, 'DRF-610-20KG', '20 KG', NULL, 4709.18, 6810);

  -- ========== RAINCOAT STAR (662) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_raincoat_star, 'DRF-662-950ML-DB',  'Dark Base (950 ML)',  NULL, 374.89, 555),
    (p_raincoat_star, 'DRF-662-3.8LT-DB',  'Dark Base (3.8 LT)', NULL, 1442.46, 2135),
    (p_raincoat_star, 'DRF-662-19LT-DB',   'Dark Base (19 LT)',  NULL, 6777.27, 5940),
    (p_raincoat_star, 'DRF-662-950ML-MT',  'Mid Tone (950 ML)',   NULL, 438.31, 650),
    (p_raincoat_star, 'DRF-662-3.8LT-MT',  'Mid Tone (3.8 LT)',  NULL, 1608.64, 2180),
    (p_raincoat_star, 'DRF-662-19LT-MT',   'Mid Tone (19 LT)',   NULL, 6937.04, 10265),
    (p_raincoat_star, 'DRF-662-1LT-WB',    'White Base (1 LT)',   NULL, 418.25, 620),
    (p_raincoat_star, 'DRF-662-4LT-WB',    'White Base (4 LT)',   NULL, 1605.79, 2375),
    (p_raincoat_star, 'DRF-662-10LT-WB',   'White Base (10 LT)',  NULL, 3870.47, 5730),
    (p_raincoat_star, 'DRF-662-20LT-WB',   'White Base (20 LT)',  NULL, 7376.18, 10915),
    (p_raincoat_star, 'DRF-662-950ML-YB',  'Yellow Base (950 ML)', NULL, 457.34, 675),
    (p_raincoat_star, 'DRF-662-3.8LT-YB',  'Yellow Base (3.8 LT)', NULL, 1774.81, 2625),
    (p_raincoat_star, 'DRF-662-9.5LT-YB',  'Yellow Base (9.5 LT)', NULL, 3745.06, 5545),
    (p_raincoat_star, 'DRF-662-19LT-YB',   'Yellow Base (19 LT)',  NULL, 8252.48, 12215);

  -- ========== PIDIFIN 2K (112) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_pidifin_2k, 'DRF-112-3KG',  '3 KG',  NULL, 362.85, 580),
    (p_pidifin_2k, 'DRF-112-15KG', '15 KG', NULL, 1529.28, 2360),
    (p_pidifin_2k, 'DRF-112-30KG', '30 KG', NULL, 2645.56, 4470);

  -- ========== FASTFLEX (113) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_fastflex, 'DRF-113-48KG', '48 KG', NULL, 6208.57, 8735);

  -- ========== BITUFIX (196) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_bitufix, 'DRF-196-5LT',  '5 LT',  NULL, 665.52, 970),
    (p_bitufix, 'DRF-196-20LT', '20 LT', NULL, 2153.50, 3240);

  -- ========== REPELLIN WR (103) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_repellin, 'DRF-103-1LT',  '1 LT',  NULL, 443.68, 600),
    (p_repellin, 'DRF-103-10LT', '10 LT', NULL, 4198.44, 5650);

  -- ========== DAMPGUARD CLASSIC (104) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_dampguard, 'DRF-104-500GM', '500 GM', NULL, 253.70, 360),
    (p_dampguard, 'DRF-104-1KG',   '1 KG',  NULL, 451.94, 620);

  -- ========== KRYSTALLINE (107) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_krystalline, 'DRF-107-25KG', '25 KG', NULL, 1968.24, 3025);

  -- ========== EPOXY BONDING AGENT (211) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_epoxy_bond, 'DRF-211-1KG', '1 KG', NULL, 828.36, 1150);

  -- ========== RUST REMOVER (204) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_rust_remover, 'DRF-204-500ML', '500 ML', NULL, 162.84, 220),
    (p_rust_remover, 'DRF-204-1LT',   '1 LT',  NULL, 246.62, 330);

  -- ========== PIDICRETE AM (207) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_pidicrete_am, 'DRF-207-225GM', '225 GM', NULL, 42.48, 70);

  -- ========== CRACK-X POWDER (202) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_crackx_powder, 'DRF-202-500GM', '500 GM', NULL, 44.84, 60),
    (p_crackx_powder, 'DRF-202-1KG',   '1 KG',  NULL, 69.62, 100),
    (p_crackx_powder, 'DRF-202-25KG',  '25 KG', NULL, 1477.36, 1900);

  -- ========== CRACK-X PASTE (201) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_crackx_paste, 'DRF-201-500GM', '500 GM', NULL, 197.06, 260),
    (p_crackx_paste, 'DRF-201-1KG',   '1 KG',  NULL, 355.18, 475),
    (p_crackx_paste, 'DRF-201-5KG',   '5 KG',  NULL, 1636.66, 2200);

  -- ========== WATERPROOF WALL PUTTY (024) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_wall_putty, 'DRF-024-5KG',  '5 KG',  NULL, 230.10, 335),
    (p_wall_putty, 'DRF-024-20KG', '20 KG', NULL, 778.80, 1170),
    (p_wall_putty, 'DRF-024-40KG', '40 KG', NULL, 1510.40, 2200);

  -- ========== PRIMO PUTTY (655) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_primo_putty, 'DRF-655-20KG', '20 KG', NULL, 3805.50, 5000);

  -- ========== PRIMO WHITE ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_primo_white, 'DRF-PW-1LT',  '1 LT',  NULL, 200.42, 275),
    (p_primo_white, 'DRF-PW-4LT',  '4 LT',  NULL, 747.15, 1000),
    (p_primo_white, 'DRF-PW-10LT', '10 LT', NULL, 1788.59, 2900),
    (p_primo_white, 'DRF-PW-20LT', '20 LT', NULL, 3434.95, 4700);

  -- ========== FEVISEAL GP PRO (501-GP) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_feviseal_gp, 'DRF-501GP-280ML-CLR', '280 ML (Clear)', NULL, 123.90, 325),
    (p_feviseal_gp, 'DRF-501GP-280ML-WHT', '280 ML (White)', NULL, 123.90, 325),
    (p_feviseal_gp, 'DRF-501GP-280ML-BLK', '280 ML (Black)', NULL, 123.90, 325);

  -- ========== FEVISEAL NEUTRAL PRO (501-NP) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_feviseal_neutral, 'DRF-501NP-280ML-WHT', '280 ML (White)', NULL, 141.60, 375),
    (p_feviseal_neutral, 'DRF-501NP-280ML-BLK', '280 ML (Black)', NULL, 141.60, 375);

  -- ========== FEVISEAL WEATHERPROOF PRO (501-WP) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_feviseal_wp, 'DRF-501WP-280ML-WHT', '280 ML (White)', NULL, 200.60, 425),
    (p_feviseal_wp, 'DRF-501WP-280ML-BLK', '280 ML (Black)', NULL, 200.60, 425),
    (p_feviseal_wp, 'DRF-501WP-280ML-CLR', '280 ML (Clear)', NULL, 200.60, 425);

  -- ========== FEVISEAL HY 100 ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_feviseal_hy100, 'DRF-HY100-GRY', 'LM Grey', NULL, 374.21, 850),
    (p_feviseal_hy100, 'DRF-HY100-WHT', 'LM White', NULL, 374.21, 850);

  -- ========== FEVISEAL HY 300 ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_feviseal_hy300, 'DRF-HY300-GRY', 'HM Grey', NULL, 526.28, 950),
    (p_feviseal_hy300, 'DRF-HY300-WHT', 'HM White', NULL, 526.28, 950);

  -- ========== FEVISEAL MULTIPURPOSE ACRYLIC (S15) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_feviseal_multi, 'DRF-S15-280ML-WHT', '280 ML (White)', NULL, 83.19, 250),
    (p_feviseal_multi, 'DRF-S15-280ML-CLR', '280 ML (Clear)', NULL, 83.19, 250),
    (p_feviseal_multi, 'DRF-S15-280ML-BLK', '280 ML (Black)', NULL, 83.19, 250);

  -- ========== M-SEAL FEVISEAL BATHROOM & KITCHEN (S01) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_mseal_bk, 'DRF-S01-280ML-WHT', '280 ML (White)', NULL, 88.50, 140);

  -- ========== FEVIMATE TC (404) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_fevimate_tc, 'DRF-404-500GM-LW', '500 GM (Lily White)', NULL, 39.65, 58),
    (p_fevimate_tc, 'DRF-404-500GM-IV', '500 GM (Ivory)',      NULL, 39.65, 58);

  -- ========== ROFF CERA CLEAN (T16) ==========
  INSERT INTO public.skus (product_id, sku_code, variant_label, case_size, dealer_price, mrp) VALUES
    (p_roff_cera, 'DRF-T16-500ML', '500 ML', NULL, 84.96, 150),
    (p_roff_cera, 'DRF-T16-1LT',   '1 LT',  NULL, 126.26, 225),
    (p_roff_cera, 'DRF-T16-5LT',   '5 LT',  NULL, 554.60, 990);

  RAISE NOTICE 'Inserted 41 Dr. Fixit products with all SKUs successfully!';
END $$;
