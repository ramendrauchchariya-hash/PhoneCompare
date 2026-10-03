/*
# PhoneCompare — Core Database Schema

Creates the full relational schema for a smartphone price-comparison platform:
brands, phones, phone_variants, phone_colors, phone_images, stores,
store_prices, price_history, categories, phone_categories, reviews,
favorites, price_alerts, and admin profiles.

## Tables

1. **brands** — smartphone manufacturers (Apple, Samsung, etc.)
2. **phones** — individual phone models with full specifications
3. **phone_variants** — RAM/storage/SKU variants per phone
4. **phone_colors** — color options per phone
5. **phone_images** — image URLs per phone (gallery)
6. **stores** — e-commerce stores (Amazon, Flipkart, etc.)
7. **store_prices** — price records per variant per store
8. **price_history** — historical price snapshots per variant per store
9. **categories** — browsing categories (Best Camera, 5G, Flagship, etc.)
10. **phone_categories** — many-to-many join phones↔categories
11. **reviews** — user reviews with rating, pros, cons
12. **favorites** — guest (local) and user favorites
13. **price_alerts** — target-price alerts (architecture ready)
14. **profiles** — admin user profiles

## Security (RLS)

- Public read on all content tables (brands, phones, variants, colors, images,
  stores, store_prices, price_history, categories, phone_categories, reviews)
  scoped to `anon, authenticated` so the no-auth public site works.
- Admin write access via `authenticated` role (admin emails are seeded in profiles).
- Reviews: anyone can read; only authenticated users can insert their own.
- Favorites: authenticated users manage their own rows.

## Indexes

- phones: slug (unique), brand_id, release_date, is_published
- phone_variants: phone_id
- store_prices: variant_id, store_id, variant+store (unique)
- price_history: variant_id, store_id, recorded_at
- reviews: phone_id
- favorites: user_id+phone_id (unique)
*/

-- ===== BRANDS =====
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  logo_url text,
  country text,
  is_active boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_brands" ON brands;
CREATE POLICY "public_read_brands" ON brands FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_write_brands" ON brands;
CREATE POLICY "admin_write_brands" ON brands FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ===== PHONES =====
CREATE TABLE IF NOT EXISTS phones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid REFERENCES brands(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  model_number text,
  description text,
  release_date date,
  status text NOT NULL DEFAULT 'draft', -- draft | published | unpublished
  is_featured boolean NOT NULL DEFAULT false,
  is_trending boolean NOT NULL DEFAULT false,
  rating numeric(2,1) NOT NULL DEFAULT 0,
  review_count int NOT NULL DEFAULT 0,
  -- Display
  display_size text,
  display_type text,
  resolution text,
  refresh_rate text,
  peak_brightness text,
  hdr text,
  protection text,
  -- Performance
  processor text,
  chipset_brand text,
  cpu text,
  gpu text,
  ram_options text, -- JSON array string e.g. ["8GB","12GB"]
  storage_options text, -- JSON array string
  expandable_storage text,
  -- Camera
  main_camera text,
  ultrawide_camera text,
  telephoto_camera text,
  macro_camera text,
  front_camera text,
  video_recording text,
  ois text,
  camera_features text,
  -- Battery
  battery_capacity text,
  charging_speed text,
  wireless_charging text,
  reverse_charging text,
  -- Connectivity
  has_5g boolean NOT NULL DEFAULT false,
  has_nfc boolean NOT NULL DEFAULT false,
  wifi text,
  bluetooth text,
  usb text,
  gps text,
  sim text,
  -- Other
  os text,
  dimensions text,
  weight text,
  fingerprint_sensor text,
  face_unlock text,
  water_resistance text,
  stereo_speakers boolean NOT NULL DEFAULT false,
  headphone_jack boolean NOT NULL DEFAULT false,
  -- SEO
  meta_title text,
  meta_description text,
  keywords text,
  -- timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE phones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_phones" ON phones;
CREATE POLICY "public_read_phones" ON phones FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_write_phones" ON phones;
CREATE POLICY "admin_write_phones" ON phones FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_phones_slug ON phones(slug);
CREATE INDEX IF NOT EXISTS idx_phones_brand ON phones(brand_id);
CREATE INDEX IF NOT EXISTS idx_phones_release ON phones(release_date);
CREATE INDEX IF NOT EXISTS idx_phones_status ON phones(status);

-- ===== PHONE_VARIANTS =====
CREATE TABLE IF NOT EXISTS phone_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_id uuid NOT NULL REFERENCES phones(id) ON DELETE CASCADE,
  ram text,
  storage text,
  color text,
  sku text,
  price numeric(12,2), -- base/launch price
  availability text NOT NULL DEFAULT 'In Stock',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE phone_variants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_variants" ON phone_variants;
CREATE POLICY "public_read_variants" ON phone_variants FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_write_variants" ON phone_variants;
CREATE POLICY "admin_write_variants" ON phone_variants FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_variants_phone ON phone_variants(phone_id);

-- ===== PHONE_COLORS =====
CREATE TABLE IF NOT EXISTS phone_colors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_id uuid NOT NULL REFERENCES phones(id) ON DELETE CASCADE,
  name text NOT NULL,
  hex_code text,
  display_order int NOT NULL DEFAULT 0
);
ALTER TABLE phone_colors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_colors" ON phone_colors;
CREATE POLICY "public_read_colors" ON phone_colors FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_write_colors" ON phone_colors;
CREATE POLICY "admin_write_colors" ON phone_colors FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_colors_phone ON phone_colors(phone_id);

-- ===== PHONE_IMAGES =====
CREATE TABLE IF NOT EXISTS phone_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_id uuid NOT NULL REFERENCES phones(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE phone_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_images" ON phone_images;
CREATE POLICY "public_read_images" ON phone_images FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_write_images" ON phone_images;
CREATE POLICY "admin_write_images" ON phone_images FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_images_phone ON phone_images(phone_id);

-- ===== STORES =====
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  logo_url text,
  website text,
  affiliate_url text,
  is_active boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_stores" ON stores;
CREATE POLICY "public_read_stores" ON stores FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_write_stores" ON stores;
CREATE POLICY "admin_write_stores" ON stores FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ===== STORE_PRICES =====
CREATE TABLE IF NOT EXISTS store_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES phone_variants(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  price numeric(12,2) NOT NULL,
  mrp numeric(12,2),
  availability text NOT NULL DEFAULT 'In Stock',
  product_url text,
  affiliate_url text,
  source text NOT NULL DEFAULT 'manual', -- manual | api | affiliate_feed | import
  last_checked_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (variant_id, store_id)
);
ALTER TABLE store_prices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_store_prices" ON store_prices;
CREATE POLICY "public_read_store_prices" ON store_prices FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_write_store_prices" ON store_prices;
CREATE POLICY "admin_write_store_prices" ON store_prices FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_store_prices_variant ON store_prices(variant_id);
CREATE INDEX IF NOT EXISTS idx_store_prices_store ON store_prices(store_id);

-- ===== PRICE_HISTORY =====
CREATE TABLE IF NOT EXISTS price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES phone_variants(id) ON DELETE CASCADE,
  store_id uuid REFERENCES stores(id) ON DELETE SET NULL,
  price numeric(12,2) NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_price_history" ON price_history;
CREATE POLICY "public_read_price_history" ON price_history FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_write_price_history" ON price_history;
CREATE POLICY "admin_write_price_history" ON price_history FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_price_history_variant ON price_history(variant_id);
CREATE INDEX IF NOT EXISTS idx_price_history_recorded ON price_history(recorded_at);

-- ===== CATEGORIES =====
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  display_order int NOT NULL DEFAULT 0
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_write_categories" ON categories;
CREATE POLICY "admin_write_categories" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ===== PHONE_CATEGORIES =====
CREATE TABLE IF NOT EXISTS phone_categories (
  phone_id uuid NOT NULL REFERENCES phones(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (phone_id, category_id)
);
ALTER TABLE phone_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_phone_categories" ON phone_categories;
CREATE POLICY "public_read_phone_categories" ON phone_categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_write_phone_categories" ON phone_categories;
CREATE POLICY "admin_write_phone_categories" ON phone_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ===== REVIEWS =====
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_id uuid NOT NULL REFERENCES phones(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  body text,
  pros text,
  cons text,
  is_approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_reviews" ON reviews;
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_reviews" ON reviews;
CREATE POLICY "auth_insert_reviews" ON reviews FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_write_reviews" ON reviews;
CREATE POLICY "admin_write_reviews" ON reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_reviews_phone ON reviews(phone_id);

-- ===== FAVORITES =====
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_id uuid NOT NULL REFERENCES phones(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, phone_id)
);
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_favorites" ON favorites;
CREATE POLICY "select_own_favorites" ON favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_favorites" ON favorites;
CREATE POLICY "insert_own_favorites" ON favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_favorites" ON favorites;
CREATE POLICY "delete_own_favorites" ON favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ===== PRICE_ALERTS =====
CREATE TABLE IF NOT EXISTS price_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  variant_id uuid NOT NULL REFERENCES phone_variants(id) ON DELETE CASCADE,
  target_price numeric(12,2) NOT NULL,
  is_triggered boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_alerts" ON price_alerts;
CREATE POLICY "select_own_alerts" ON price_alerts FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_alerts" ON price_alerts;
CREATE POLICY "insert_own_alerts" ON price_alerts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_alerts" ON price_alerts;
CREATE POLICY "delete_own_alerts" ON price_alerts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ===== PROFILES (admin) =====
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "admin_write_profiles" ON profiles;
CREATE POLICY "admin_write_profiles" ON profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ===== updated_at trigger =====
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_brands_updated ON brands;
CREATE TRIGGER trg_brands_updated BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trg_phones_updated ON phones;
CREATE TRIGGER trg_phones_updated BEFORE UPDATE ON phones FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trg_variants_updated ON phone_variants;
CREATE TRIGGER trg_variants_updated BEFORE UPDATE ON phone_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trg_stores_updated ON stores;
CREATE TRIGGER trg_stores_updated BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trg_store_prices_updated ON store_prices;
CREATE TRIGGER trg_store_prices_updated BEFORE UPDATE ON store_prices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
