/*
# Revoke EXECUTE on handle_new_user (re-apply after function recreate)

The previous migration recreated handle_new_user() with CREATE OR REPLACE, which
re-grants EXECUTE to anon and authenticated by default. This migration re-applies
the REVOKE to close the public API surface on that trigger function.
*/

REVOKE EXECUTE ON FUNCTION handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION handle_new_user() FROM authenticated;
