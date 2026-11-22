-- KAF-35 G2 | QA-first read-only owner permission check, no resource mutation.
-- Additive scoped endpoint for the Fajr administration only. Never grant this
-- access for KAF/Personal merely because they share the same Supabase project.
begin;
create or replace function public.fajr_resource_owner_check()
returns boolean
language sql
stable
security definer
set search_path=''
as $function$
 select exists (
  select 1
  from fajr_private.office_members office
  join public.business_members bm on bm.user_id=office.user_id
  where office.user_id=auth.uid()
    and office.enabled=true
    and office.can_update=true
    and office.can_publish_site=true
    and bm.status='active'
    and bm.role='owner'
    and 'fajr'=any(bm.companies)
 )
$function$;
revoke all on function public.fajr_resource_owner_check() from public,anon,authenticated;
grant execute on function public.fajr_resource_owner_check() to authenticated;
commit;
