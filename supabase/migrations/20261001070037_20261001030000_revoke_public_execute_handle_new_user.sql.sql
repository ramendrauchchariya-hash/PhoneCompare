/*
# Revoke EXECUTE on handle_new_user from PUBLIC

The function still had EXECUTE granted to the PUBLIC meta-role (which includes
anon and authenticated). Revoking from anon/authenticated individually had no
effect because the grant was on PUBLIC. This revokes from PUBLIC directly,
leaving only postgres and service_role with EXECUTE.
*/

REVOKE EXECUTE ON FUNCTION handle_new_user() FROM PUBLIC;
