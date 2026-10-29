begin;
create schema fajr_private;
revoke all on schema fajr_private from public,anon,authenticated;
create table fajr_private.intake_control (
 singleton boolean primary key default true check(singleton),
 enabled boolean not null default false,
 minute_start timestamptz not null default date_trunc('minute',now()),
 day_start timestamptz not null default date_trunc('day',now()),
 minute_count integer not null default 0,
 day_count integer not null default 0
);
alter table fajr_private.intake_control enable row level security;
revoke all on fajr_private.intake_control from public,anon,authenticated;
insert into fajr_private.intake_control(singleton) values(true);
create function public.fajr_intake_configuration() returns jsonb
language sql security definer set search_path='' as $$
 select jsonb_build_object('enabled',c.enabled,'secret',(select s.decrypted_secret from vault.decrypted_secrets s where s.name='fajr_intake_qa_turnstile' limit 1))
 from fajr_private.intake_control c where singleton=true;
$$;
revoke all on function public.fajr_intake_configuration() from public,anon,authenticated;
grant execute on function public.fajr_intake_configuration() to service_role;
create function public.fajr_take_intake_slot() returns boolean
language plpgsql security definer set search_path='' as $$
declare c fajr_private.intake_control; m timestamptz:=date_trunc('minute',now());d timestamptz:=date_trunc('day',now());
begin
 select * into strict c from fajr_private.intake_control where singleton=true for update;
 if not c.enabled then return false; end if;
 if c.minute_start<>m then c.minute_start:=m;c.minute_count:=0;end if;
 if c.day_start<>d then c.day_start:=d;c.day_count:=0;end if;
 if c.minute_count>=12 or c.day_count>=100 then return false;end if;
 update fajr_private.intake_control set minute_start=m,day_start=d,minute_count=c.minute_count+1,day_count=c.day_count+1 where singleton=true;
 return true;
end;
$$;
revoke all on function public.fajr_take_intake_slot() from public,anon,authenticated;
grant execute on function public.fajr_take_intake_slot() to service_role;
commit;
