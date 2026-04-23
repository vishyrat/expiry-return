-- ============================================================
--  STEP 1: Run this entire file in Supabase SQL Editor
--  Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================

-- Table 1: Return Headers (one row per shop visit)
CREATE TABLE IF NOT EXISTS expired_returns (
  id            SERIAL PRIMARY KEY,
  ref_number    VARCHAR(20)   NOT NULL UNIQUE,
  exec_name     VARCHAR(100)  NOT NULL,
  shop_name     VARCHAR(150)  NOT NULL,
  shop_phone    VARCHAR(15),
  visit_date    DATE          NOT NULL,
  area          VARCHAR(150)  NOT NULL,
  submitted_at  TIMESTAMPTZ   DEFAULT NOW()
);

-- Table 2: Products (many per return)
CREATE TABLE IF NOT EXISTS return_products (
  id            SERIAL PRIMARY KEY,
  return_id     INTEGER       NOT NULL REFERENCES expired_returns(id) ON DELETE CASCADE,
  product_name  VARCHAR(255)  NOT NULL,
  brand         VARCHAR(100)  NOT NULL,
  mrp           NUMERIC(10,2) NOT NULL,
  mfg_date      CHAR(10)      NOT NULL,   -- Format: DD.MM.YYYY
  exp_date      CHAR(10)      NOT NULL,   -- Format: DD/MM/YYYY
  quantity      INTEGER       NOT NULL,
  CONSTRAINT chk_mrp      CHECK (mrp >= 0),
  CONSTRAINT chk_quantity CHECK (quantity >= 1)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_returns_shop     ON expired_returns(shop_name);
CREATE INDEX IF NOT EXISTS idx_returns_exec     ON expired_returns(exec_name);
CREATE INDEX IF NOT EXISTS idx_returns_date     ON expired_returns(visit_date);
CREATE INDEX IF NOT EXISTS idx_products_return  ON return_products(return_id);
CREATE INDEX IF NOT EXISTS idx_products_brand   ON return_products(brand);

-- ============================================================
--  STEP 2: Enable Row Level Security
-- ============================================================

ALTER TABLE expired_returns  ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_products  ENABLE ROW LEVEL SECURITY;

-- Allow public insert (executives submit without login)
CREATE POLICY "allow_insert_returns"  ON expired_returns  FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_insert_products" ON return_products  FOR INSERT WITH CHECK (true);

-- Allow public read (so app can confirm ref number)
CREATE POLICY "allow_read_returns"    ON expired_returns  FOR SELECT USING (true);
CREATE POLICY "allow_read_products"   ON return_products  FOR SELECT USING (true);

-- ============================================================
--  STEP 3 (Optional): Useful view for reporting
--  Run this to get a flat view of all returns with products
-- ============================================================

CREATE OR REPLACE VIEW return_summary AS
SELECT
  r.ref_number,
  r.exec_name,
  r.shop_name,
  r.area,
  r.visit_date,
  r.submitted_at,
  p.product_name,
  p.brand,
  p.mrp,
  p.mfg_date,
  p.exp_date,
  p.quantity,
  (p.mrp * p.quantity) AS total_value
FROM expired_returns r
JOIN return_products p ON p.return_id = r.id
ORDER BY r.submitted_at DESC;
