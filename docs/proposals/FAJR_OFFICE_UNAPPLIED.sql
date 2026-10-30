-- PROPOSED ONLY. Not applied. Explicit office membership must be provisioned by owner.
begin;
create schema if not exists fajr_private;
revoke all on schema fajr_private from public,anon,authenticated;
create table fajr_private.office_members (
 user_id uuid primary key references auth.users(id),
 enabled boolean not null default false,
 can_update boolean not null default false
);
create table fajr_private.office_audit (
 id bigint generated always as identity primary key,
 request_id uuid not null references public.fajr_web_requests(id),
 actor_id uuid not null references auth.users(id),
 previous_status text not null,
 next_status text not null,
 created_at timestamptz not null default now()
);
alter table fajr_private.office_members enable row level security;
alter table fajr_private.office_audit enable row level security;
revoke all on fajr_private.office_members,fajr_private.office_audit from public,anon,authenticated;
-- One bounded row per explicitly provisioned member; no untrusted user can grow this table.
create table fajr_private.office_quota (
 user_id uuid primary key references fajr_private.office_members(user_id) on delete cascade,
 window_started_at timestamptz not null,
 used integer not null check (used between 1 and 60)
);
alter table fajr_private.office_quota enable row level security;
revoke all on fajr_private.office_quota from public,anon,authenticated;
-- Fixed window: at most 60 admitted requests per member per 60-second window.
-- PostgreSQL row conflict locking serializes parallel server instances.
create function public.fajr_office_take_slot(actor uuid)
returns boolean language plpgsql security definer set search_path='' as $$
declare admitted uuid; checked_at timestamptz;
begin
 perform 1 from fajr_private.office_members where user_id=actor and enabled for update;
 if not found then
  raise sqlstate '42501' using message='Office access denied';
 end if;
 checked_at:=clock_timestamp();
 insert into fajr_private.office_quota as q(user_id,window_started_at,used)
 values(actor,checked_at,1)
 on conflict(user_id) do update set
  window_started_at=case when q.window_started_at<=checked_at-interval '60 seconds' then checked_at else q.window_started_at end,
  used=case when q.window_started_at<=checked_at-interval '60 seconds' then 1 else q.used+1 end
 where q.window_started_at<=checked_at-interval '60 seconds' or q.used<60
 returning user_id into admitted;
 return admitted is not null;
end;$$;
revoke all on function public.fajr_office_take_slot(uuid) from public,anon,authenticated;
grant execute on function public.fajr_office_take_slot(uuid) to service_role;
create function public.fajr_office_list(actor uuid,row_offset integer default 0)
returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from fajr_private.office_members where user_id=actor and enabled) then raise sqlstate '42501' using message='Office access denied';end if;
 if row_offset<0 or row_offset>999999 then raise exception 'Invalid offset';end if;
 return coalesce((select jsonb_agg(to_jsonb(r)) from (
 select id,service,destination,variant,contact,status,created_at
 from public.fajr_web_requests order by created_at desc,id desc limit 25 offset row_offset
 )r),'[]'::jsonb);
end;$$;
create function public.fajr_office_change(actor uuid,request_uuid uuid,expected_status text,next_status text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare current_status text;
begin
 if not exists(select 1 from fajr_private.office_members where user_id=actor and enabled and can_update) then raise sqlstate '42501' using message='Office access denied';end if;
 if next_status is null or next_status not in ('received','reviewing','contacted','closed') then raise exception 'Invalid status';end if;
 select status into current_status from public.fajr_web_requests where id=request_uuid for update;
 if not found or current_status is distinct from expected_status then raise sqlstate '40001' using message='Refresh required';end if;
 if current_status<>next_status then
 update public.fajr_web_requests set status=next_status where id=request_uuid;
 insert into fajr_private.office_audit(request_id,actor_id,previous_status,next_status) values(request_uuid,actor,current_status,next_status);
 end if;
 return jsonb_build_object('id',request_uuid,'status',next_status);
end;$$;
revoke all on function public.fajr_office_list(uuid,integer),public.fajr_office_change(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.fajr_office_list(uuid,integer),public.fajr_office_change(uuid,uuid,text,text) to service_role;
commit;
