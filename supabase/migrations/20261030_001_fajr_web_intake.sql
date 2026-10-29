-- Applied 2026-10-30 after explicit owner approval for isolated QA intake.
-- Separate Fajr intake; no changes to KAF customers/cases or existing RLS.
begin;
create table public.fajr_web_requests (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  service text not null check(char_length(service) between 1 and 50),
  destination text not null check(char_length(destination) between 1 and 80),
  variant text not null default '' check(char_length(variant)<=120),
  contact text not null check(char_length(contact) between 7 and 120),
  consent boolean not null check(consent),
  status text not null default 'received' check(status in ('received','reviewing','contacted','closed')),
  created_at timestamptz not null default now()
);
alter table public.fajr_web_requests enable row level security;
revoke all on public.fajr_web_requests from anon,authenticated;
-- No public receipt lookup: a receipt is not an authentication credential.
create function public.fajr_receive_web_request(payload jsonb)
returns table(receipt uuid,replayed boolean)
language plpgsql security definer set search_path = '' as $$
declare saved public.fajr_web_requests; inserted_id uuid;
begin
  insert into public.fajr_web_requests(request_id,service,destination,variant,contact,consent)
  values ((payload->>'request_id')::uuid,payload->>'service',payload->>'destination',coalesce(payload->>'variant',''),payload->>'contact',(payload->>'consent')::boolean)
  on conflict(request_id) do nothing returning id into inserted_id;
  select * into strict saved from public.fajr_web_requests where request_id=(payload->>'request_id')::uuid;
  if saved.service is distinct from payload->>'service' or saved.destination is distinct from payload->>'destination'
    or saved.variant is distinct from coalesce(payload->>'variant','') or saved.contact is distinct from payload->>'contact'
    or saved.consent is distinct from (payload->>'consent')::boolean then
    raise exception 'Request conflict';
  end if;
  return query select saved.id,inserted_id is null;
end;
$$;
revoke all on function public.fajr_receive_web_request(jsonb) from public,anon,authenticated;
grant execute on function public.fajr_receive_web_request(jsonb) to service_role;
commit;
