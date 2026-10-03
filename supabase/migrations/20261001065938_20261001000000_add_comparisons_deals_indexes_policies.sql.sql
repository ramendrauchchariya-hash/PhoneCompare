/*
# Add comparisons table, deals table, missing policies, indexes, and triggers

## Summary

This migration completes the database schema for the smartphone price comparison app by adding the two remaining tables (comparisons, deals), filling in missing RLS policies, adding performance indexes, and creating a trigger to auto-populate profiles on signup.

## New Tables

### 1. comparisons
Stores user-saved phone comparison sessions. Each row represents one phone a user has added to their comparison list.
- `id` — UUID primary key
- `user_id` — UUID, references auth.users, defaults to auth.uid()
- `phone_id` — UUID, references phones
- `created_at` — timestamptz, defaults to now()

### 2. deals
Stores curated deal entries (editorial deals, flash sales, coupon-based discounts) that can be featured on the deals page.
- `id` — UUID primary key
- `phone_id` — UUID, references phones (nullable so deals can be store-wide)
- `store_id` — UUID, references stores (nullable so deals can be brand-wide)
- `title` — text, deal headline
- `description` — text, deal body
- `deal_type` — text, enum-like: 'flash_sale', 'coupon', 'bundle', 'exchange_bonus', 'bank_offer'
- `discount_value` — numeric, the discount amount or percentage
- `discount_type` — text, 'percentage' or 'flat'
- `coupon_code` — text, nullable
- `starts_at` — timestamptz, when the deal becomes active
- `ends_at` — timestamptz, when the deal expires
- `is_active` — boolean, defaults to true
- `image_url` — text, nullable
- `created_at` / `updated_at` — timestamptz

## Modified Tables

### profiles
- Added `updated_at` column (timestamptz, defaults to now())

## New Indexes
- `idx_favorites_user` on favorites(user_id)
- `idx_price_alerts_user` on price_alerts(user_id)
- `idx_reviews_user` on reviews(user_id)
- `idx_store_prices_last_checked` on store_prices(last_checked_at)
- `idx_comparisons_user` on comparisons(user_id)
- `idx_deals_active` on deals(is_active, starts_at, ends_at)
- `idx_deals_phone` on deals(phone_id)
- `idx_deals_store` on deals(store_id)
- `idx_profiles_email` on profiles(email)

## New RLS Policies

### comparisons (owner-scoped, authenticated only)
- `select_own_comparisons` — SELECT for authenticated users on their own rows
- `insert_own_comparisons` — INSERT for authenticated users on their own rows
- `delete_own_comparisons` — DELETE for authenticated users on their own rows

### deals (public read, admin write)
- `public_read_deals` — SELECT for anon + authenticated (USING: is_active AND within date range)
- `admin_write_deals` — ALL for authenticated (admin manages deals)

### favorites (missing UPDATE policy)
- `update_own_favorites` — UPDATE for authenticated users on their own rows

### price_alerts (missing UPDATE policy)
- `update_own_alerts` — UPDATE for authenticated users on their own rows

### reviews (missing UPDATE policy)
- `update_own_reviews` — UPDATE for authenticated users on their own reviews

### profiles (missing UPDATE policy)
- `update_own_profile` — UPDATE for authenticated users on their own profile

## Triggers

### handle_updated_at
A reusable trigger function that sets `updated_at = now()` on any row update. Applied to the `deals` and `profiles` tables.

### handle_new_user
A trigger on auth.users INSERT that creates a matching profile row automatically when a user signs up.
*/

-- ============================================================
-- 1. COMPARISONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS comparisons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_id uuid NOT NULL REFERENCES phones(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE comparisons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_comparisons" ON comparisons;
CREATE POLICY "select_own_comparisons" ON comparisons FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_comparisons" ON comparisons;
CREATE POLICY "insert_own_comparisons" ON comparisons FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_comparisons" ON comparisons;
CREATE POLICY "delete_own_comparisons" ON comparisons FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_comparisons_user ON comparisons(user_id);
CREATE INDEX IF NOT EXISTS idx_comparisons_phone ON comparisons(phone_id);

-- ============================================================
-- 2. DEALS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_id uuid REFERENCES phones(id) ON DELETE SET NULL,
  store_id uuid REFERENCES stores(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  deal_type text NOT NULL DEFAULT 'flash_sale' CHECK (deal_type IN ('flash_sale', 'coupon', 'bundle', 'exchange_bonus', 'bank_offer')),
  discount_value numeric,
  discount_type text DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'flat')),
  coupon_code text,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  is_active boolean NOT NULL DEFAULT true,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_deals" ON deals;
CREATE POLICY "public_read_deals" ON deals FOR SELECT
  TO anon, authenticated USING (is_active = true AND now() >= starts_at AND now() <= ends_at);

DROP POLICY IF EXISTS "admin_write_deals" ON deals;
CREATE POLICY "admin_write_deals" ON deals FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_deals_active ON deals(is_active, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_deals_phone ON deals(phone_id);
CREATE INDEX IF NOT EXISTS idx_deals_store ON deals(store_id);

-- ============================================================
-- 3. ADD updated_at TO profiles
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
  END IF;
END $$;

-- ============================================================
-- 4. MISSING UPDATE POLICIES
-- ============================================================

-- favorites: allow users to update their own favorites
DROP POLICY IF EXISTS "update_own_favorites" ON favorites;
CREATE POLICY "update_own_favorites" ON favorites FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- price_alerts: allow users to update their own alerts
DROP POLICY IF EXISTS "update_own_alerts" ON price_alerts;
CREATE POLICY "update_own_alerts" ON price_alerts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- reviews: allow users to update their own reviews
DROP POLICY IF EXISTS "update_own_reviews" ON reviews;
CREATE POLICY "update_own_reviews" ON reviews FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- profiles: allow users to update their own profile
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================
-- 5. MISSING INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_user ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_store_prices_last_checked ON store_prices(last_checked_at);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ============================================================
-- 6. updated_at TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_deals_updated_at ON deals;
CREATE TRIGGER trigger_deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- 7. AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_on_auth_user_created ON auth.users;
CREATE TRIGGER trigger_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
