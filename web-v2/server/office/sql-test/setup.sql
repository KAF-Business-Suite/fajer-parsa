\set ON_ERROR_STOP on
-- Disposable CI database only. These roles model Supabase, not live identities.
create role anon;
create role authenticated;
create role service_role;
create schema auth;
create table auth.users(id uuid primary key);
create table public.fajr_web_requests (
 id uuid primary key, service text, destination text, variant text, contact text,
 status text, private_extra text default 'never-forward', created_at timestamptz default now()
);
create table public.business_members(user_id uuid references auth.users(id),status text not null,companies text[] not null,role text not null);
alter table public.business_members enable row level security;
revoke all on public.business_members from public,anon,authenticated,service_role;
alter table public.fajr_web_requests enable row level security;
revoke all on public.fajr_web_requests from public,anon,authenticated,service_role;
\ir ../../../../docs/proposals/FAJR_OFFICE_UNAPPLIED.sql
insert into auth.users values
 ('d5072836-0d50-4dfa-88dc-596e9befd276'),
 ('19eb0b58-dee3-4db7-898e-f57f01c72ade'),
 ('29eb0b58-dee3-4db7-898e-f57f01c72ade');
insert into fajr_private.office_members(user_id,enabled) values
 ('d5072836-0d50-4dfa-88dc-596e9befd276',true),
 ('19eb0b58-dee3-4db7-898e-f57f01c72ade',true);

insert into public.business_members(user_id,status,companies,role) values
 ('d5072836-0d50-4dfa-88dc-596e9befd276','active',ARRAY['fajr','rpc'],'owner'),
 ('19eb0b58-dee3-4db7-898e-f57f01c72ade','active',ARRAY['fajr'],'staff'),
 ('29eb0b58-dee3-4db7-898e-f57f01c72ade','active',ARRAY['rpc'],'owner');
