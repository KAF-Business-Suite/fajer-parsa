-- FP-SITE-CONTROL-01 | additive Fajr-only, fail-closed, no public raw table reads
-- QA-first migration. Reviewed source for KAF-25 / KAF-31; no unrelated table mutations.
begin;
create table if not exists fajr_private.site_settings_state (
 site text primary key check (site='fajr-parsa'),
 draft jsonb not null,
 draft_revision uuid not null default gen_random_uuid(),
 published jsonb,
 published_revision uuid,
 updated_at timestamptz not null default now(),
 updated_by uuid,
 published_at timestamptz,
 published_by uuid
);
alter table fajr_private.site_settings_state enable row level security;
revoke all on fajr_private.site_settings_state from public, anon, authenticated;

create table if not exists fajr_private.site_settings_history (
 id bigint generated always as identity primary key,
 site text not null check (site='fajr-parsa'),
 action text not null check(action in ('draft','publish','rollback')),
 actor uuid not null,
 previous_draft jsonb,
 next_draft jsonb,
 previous_published jsonb,
 next_published jsonb,
 created_at timestamptz not null default now()
);
create index if not exists fajr_site_history_latest on fajr_private.site_settings_history (site,id desc);
alter table fajr_private.site_settings_history enable row level security;
revoke all on fajr_private.site_settings_history from public, anon, authenticated;

alter table fajr_private.office_members add column if not exists can_publish_site boolean not null default false;
-- Only an unambiguous existing sole enabled Fajr editor becomes the owner publisher.
-- Otherwise publication stays blocked until a separately reviewed role assignment.
update fajr_private.office_members om
set can_publish_site=true
where om.enabled=true and om.can_update=true
 and exists (select 1 from public.business_members bm
  where bm.user_id=om.user_id and bm.status='active'
  and bm.role='owner' and 'fajr'=any(bm.companies))
 and (select count(*) from fajr_private.office_members om2
  join public.business_members bm2 on bm2.user_id=om2.user_id
  where om2.enabled and om2.can_update and bm2.status='active'
  and bm2.role='owner' and 'fajr'=any(bm2.companies))=1;

insert into fajr_private.site_settings_state(site,draft)
values ('fajr-parsa',
 '{"contact":{"whatsapp":"","email":""},"design":{"fontPreset":"vazirmatn-manrope"},"office":{"address":{"fa":"","ps":"","en":"","ar":""},"hours":{"fa":"","ps":"","en":"","ar":""}},"content":{"notice":{"fa":"","ps":"","en":"","ar":""},"faq":[]}}'::jsonb)
on conflict(site) do nothing;

create or replace function fajr_private.site_valid_text4(v jsonb, maximum integer)
returns boolean language plpgsql immutable set search_path='' as $$
declare k text;
begin
 if jsonb_typeof(v)<>'object' or (select count(*) from jsonb_object_keys(v))<>4 then return false; end if;
 for k in select jsonb_object_keys(v) loop
  if k not in ('fa','ps','en','ar') then return false; end if;
  if jsonb_typeof(v->k)<>'string' or length(v->>k)>maximum then return false; end if;
 end loop;
 return true;
end $$;
revoke all on function fajr_private.site_valid_text4(jsonb,integer) from public,anon,authenticated;

create or replace function fajr_private.site_valid_draft(v jsonb)
returns boolean language plpgsql immutable set search_path='' as $$
declare k text; q jsonb; i integer;
begin
 if jsonb_typeof(v)<>'object' or octet_length(v::text)>14000 then return false; end if;
 for k in select jsonb_object_keys(v) loop
  if k not in ('contact','design','office','content') then return false; end if;
 end loop;
 if jsonb_typeof(v->'contact')<>'object' or jsonb_typeof(v->'design')<>'object' then return false; end if;
 for k in select jsonb_object_keys(v->'contact') loop
  if k not in ('whatsapp','email','phone','mapUrl') then return false; end if;
 end loop;
 for k in select jsonb_object_keys(v->'design') loop
  if k<>'fontPreset' then return false; end if;
 end loop;
 if jsonb_typeof(v#>'{contact,whatsapp}')<>'string' or length(v#>>'{contact,whatsapp}')>15
 or jsonb_typeof(v#>'{contact,email}')<>'string' or length(v#>>'{contact,email}')>254
 or (v#>>'{design,fontPreset}') not in ('vazirmatn-manrope','estedad-inter') then return false; end if;
 if v#>'{contact,phone}' is not null and
  (jsonb_typeof(v#>'{contact,phone}')<>'string' or length(v#>>'{contact,phone}')>16) then return false; end if;
 if v#>'{contact,mapUrl}' is not null and
  (jsonb_typeof(v#>'{contact,mapUrl}')<>'string' or length(v#>>'{contact,mapUrl}')>350) then return false; end if;
 if v->'office' is not null then
  if jsonb_typeof(v->'office')<>'object' then return false; end if;
  for k in select jsonb_object_keys(v->'office') loop
   if k not in ('address','hours') then return false; end if;
  end loop;
  if not fajr_private.site_valid_text4(v#>'{office,address}',300)
  or not fajr_private.site_valid_text4(v#>'{office,hours}',120) then return false; end if;
 end if;
 if v->'content' is not null then
  if jsonb_typeof(v->'content')<>'object' then return false; end if;
  for k in select jsonb_object_keys(v->'content') loop
   if k not in ('notice','faq') then return false; end if;
  end loop;
  if not fajr_private.site_valid_text4(v#>'{content,notice}',500)
   or jsonb_typeof(v#>'{content,faq}')<>'array'
   or jsonb_array_length(v#>'{content,faq}')>5 then return false; end if;
  for q in select value from jsonb_array_elements(v#>'{content,faq}') loop
   if jsonb_typeof(q)<>'object' or
    (select count(*) from jsonb_object_keys(q))<>2
    or not (q ? 'question' and q ? 'answer')
    or not fajr_private.site_valid_text4(q->'question',180)
    or not fajr_private.site_valid_text4(q->'answer',600) then return false; end if;
  end loop;
 end if;
 return true;
exception when others then return false;
end $$;
revoke all on function fajr_private.site_valid_draft(jsonb) from public,anon,authenticated;

create or replace function fajr_private.site_valid_publish(v jsonb)
returns boolean language plpgsql immutable set search_path='' as $$
declare url text;
begin
 if not fajr_private.site_valid_draft(v) then return false; end if;
 if (v#>>'{contact,whatsapp}') !~ '^[1-9][0-9]{6,14}$'
  or (v#>>'{contact,email}') !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,24}$' then return false; end if;
 if v#>>'{contact,phone}' is not null and (v#>>'{contact,phone}') <> ''
 and (v#>>'{contact,phone}') !~ '^\+?[1-9][0-9]{6,14}$' then return false; end if;
 url:=v#>>'{contact,mapUrl}';
 if url is not null and url<>'' and url !~ '^https://(maps\.app\.goo\.gl/[A-Za-z0-9_-]+/?|((www\.)?google\.com|maps\.google\.com)/maps[^<>"[:space:]]*|www\.openstreetmap\.org/[^<>"[:space:]]*)$' then return false; end if;
 return true;
end $$;
revoke all on function fajr_private.site_valid_publish(jsonb) from public,anon,authenticated;

-- Single transactional office RPC: internal tables never exposed through PostgREST.
create or replace function public.fajr_site_control(p_action text,p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare principal uuid:=auth.uid(); access_row fajr_private.office_members%rowtype;
 state_row fajr_private.site_settings_state%rowtype; doc jsonb; previous jsonb;
 next_public jsonb; rev uuid; target jsonb; trail jsonb;
begin
 if principal is null then raise exception 'unauthorized' using errcode='42501'; end if;
 select * into access_row from fajr_private.office_members
 where user_id=principal and enabled=true;
 if not found or not access_row.can_update or not exists (
  select 1 from public.business_members bm where bm.user_id=principal
   and bm.status='active' and 'fajr'=any(bm.companies)
 ) then raise exception 'forbidden' using errcode='42501'; end if;
 if p_action not in ('read','draft','preview','publish','rollback') then
  raise exception 'invalid action' using errcode='22023'; end if;
 if p_action<>'read' and p_action<>'preview' and not access_row.can_update then
  raise exception 'editor role required' using errcode='42501'; end if;
 if p_action in ('publish','rollback') and
  (not access_row.can_publish_site or not exists (
   select 1 from public.business_members bm where bm.user_id=principal
   and bm.status='active' and bm.role='owner' and 'fajr'=any(bm.companies)
  )) then
  raise exception 'publisher role required' using errcode='42501'; end if;
 select * into state_row from fajr_private.site_settings_state
 where site='fajr-parsa' for update;
 if not found then raise exception 'site settings unavailable' using errcode='55000'; end if;
 if p_action='draft' then
  doc:=p_payload->'draft';
  if not fajr_private.site_valid_draft(doc) then
   raise exception 'invalid draft' using errcode='22023'; end if;
  if (p_payload->>'expected') is distinct from state_row.draft_revision::text then
   raise exception 'stale draft revision' using errcode='40001'; end if;
  insert into fajr_private.site_settings_history(site,action,actor,previous_draft,next_draft)
    values('fajr-parsa','draft',principal,state_row.draft,doc);
  update fajr_private.site_settings_state
  set draft=doc,draft_revision=gen_random_uuid(),updated_at=now(),updated_by=principal
  where site='fajr-parsa';
 elsif p_action='preview' then
  if not access_row.can_update or not fajr_private.site_valid_publish(state_row.draft) then
   raise exception 'draft not ready' using errcode='22023'; end if;
 elsif p_action='publish' then
  if (p_payload->>'confirmed') is distinct from 'true' or
   (p_payload->>'expected') is distinct from state_row.draft_revision::text or
   coalesce(p_payload->>'expectedPublished','') <> coalesce(state_row.published_revision::text,'') then
   raise exception 'confirmation or revision mismatch' using errcode='40001'; end if;
  if not fajr_private.site_valid_publish(state_row.draft) then
   raise exception 'invalid published content' using errcode='22023'; end if;
  rev:=gen_random_uuid();
  doc:=state_row.draft;
  next_public:=jsonb_build_object('version',1,'site','fajr-parsa','revision',rev::text,
   'publishedAt',to_char(now() at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS"Z"'),
   'contact',doc->'contact','design',doc->'design');
  if doc ? 'office' then next_public:=next_public||jsonb_build_object('office',doc->'office'); end if;
  if doc ? 'content' then next_public:=next_public||jsonb_build_object('content',doc->'content'); end if;
  insert into fajr_private.site_settings_history(site,action,actor,previous_published,next_published)
    values('fajr-parsa','publish',principal,state_row.published,next_public);
  update fajr_private.site_settings_state set published=next_public,published_revision=rev,
   published_at=now(),published_by=principal where site='fajr-parsa';
 elsif p_action='rollback' then
  if (p_payload->>'confirmed') is distinct from 'true' or
   coalesce(p_payload->>'expectedPublished','') <> coalesce(state_row.published_revision::text,'') then
   raise exception 'confirmation or revision mismatch' using errcode='40001'; end if;
  select next_published into target from fajr_private.site_settings_history
   where site='fajr-parsa' and next_published->>'revision'=p_payload->>'targetRevision'
   order by id desc limit 1;
  if target is null then raise exception 'unknown revision' using errcode='22023'; end if;
  rev:=gen_random_uuid();
  next_public:=jsonb_set(jsonb_set(target,'{revision}',to_jsonb(rev::text)),
   '{publishedAt}',to_jsonb(to_char(now() at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS"Z"')));
  insert into fajr_private.site_settings_history(site,action,actor,previous_published,next_published)
   values('fajr-parsa','rollback',principal,state_row.published,next_public);
  update fajr_private.site_settings_state set published=next_public,published_revision=rev,
   published_at=now(),published_by=principal where site='fajr-parsa';
 end if;
 select * into state_row from fajr_private.site_settings_state where site='fajr-parsa';
 select coalesce(jsonb_agg(jsonb_build_object('revision',next_published->>'revision',
  'action',action,'at',created_at) order by id desc),'[]'::jsonb)
 into trail from (select id,action,created_at,next_published from fajr_private.site_settings_history
 where site='fajr-parsa' and next_published is not null order by id desc limit 15) x;
 return jsonb_build_object('draft',state_row.draft,'draftRevision',state_row.draft_revision::text,
  'published',state_row.published,'publishedRevision',state_row.published_revision,
  'canEdit',access_row.can_update,'canPublish',access_row.can_publish_site,'history',trail);
end $$;
revoke all on function public.fajr_site_control(text,jsonb) from public,anon,authenticated;
grant execute on function public.fajr_site_control(text,jsonb) to authenticated;

create or replace function public.fajr_site_published_public()
returns jsonb language sql stable security definer set search_path='' as $$
 select published from fajr_private.site_settings_state where site='fajr-parsa';
$$;
revoke all on function public.fajr_site_published_public() from public,anon,authenticated;
grant execute on function public.fajr_site_published_public() to anon,authenticated;
commit;
