/*
# Fix function search_path and revoke EXECUTE on handle_new_user

## Summary
Fixes security advisor warnings:
1. Sets `search_path = public` on trigger functions to prevent search_path injection.
2. Revokes EXECUTE on `handle_new_user` from anon and authenticated so it can only be called by the database trigger, not via the REST API.

## Changes
- `handle_updated_at()` — added `SET search_path = public`
- `handle_new_user()` — added `SET search_path = public`, revoked EXECUTE from anon + authenticated
- `update_updated_at()` — added `SET search_path = public` (pre-existing function from first migration)
*/

-- Fix search_path on handle_updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix search_path on handle_new_user and revoke public EXECUTE
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION handle_new_user() FROM authenticated;

-- Fix search_path on the pre-existing update_updated_at function from the first migration
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
