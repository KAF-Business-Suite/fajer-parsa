import { test, before } from 'node:test'
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
const exec = promisify(execFile)
const connection = new URL(process.env.OFFICE_TEST_DATABASE_URL || 'invalid:')
if (!['localhost','127.0.0.1','[::1]'].includes(connection.hostname)
 || connection.pathname !== '/fajr_office_test' || connection.protocol !== 'postgresql:'
 || connection.search || connection.hash) {
 throw new Error('A disposable loopback fajr_office_test database is required')
}
// Pass the synthetic connection in the environment, never in process arguments/output.
const env = { ...process.env, PGHOST: connection.hostname.replace(/^\[|\]$/g,''),
 PGPORT: connection.port || '5432', PGDATABASE: 'fajr_office_test',
 PGUSER: decodeURIComponent(connection.username), PGPASSWORD: decodeURIComponent(connection.password),
 PGCONNECT_TIMEOUT: '5' }
delete env.PGSERVICE
delete env.PGHOSTADDR
const sql = async text => (await exec('psql',['-XAt','-v','ON_ERROR_STOP=1','-v','VERBOSITY=verbose','-c',text],{env})).stdout.trim()
const actor='d5072836-0d50-4dfa-88dc-596e9befd276'
const other='19eb0b58-dee3-4db7-898e-f57f01c72ade'
const outsider='29eb0b58-dee3-4db7-898e-f57f01c72ade'
const slot = id => sql(`set role service_role; select public.fajr_office_take_slot('${id}')`).then(x=>x.split('\n').at(-1))

before(async()=>{
 await exec('psql',['-X','-v','ON_ERROR_STOP=1','-f',new URL('./sql-test/setup.sql',import.meta.url).pathname],{env})
})

test('atomic quota, isolation, expiry and permissions on PostgreSQL',async()=>{
 for(const role of ['anon','authenticated']){
  await assert.rejects(sql(`set role ${role}; select public.fajr_office_take_slot('${actor}')`),/permission denied/)
  await assert.rejects(sql(`set role ${role}; select * from fajr_private.office_quota`),/permission denied/)
 }
 await assert.rejects(slot(outsider),/Office access denied/)
 // Four concurrent waves keep the disposable database below its connection limit.
 const results=[]
 for(let wave=0;wave<4;wave++)results.push(...await Promise.all(Array.from({length:20},()=>slot(actor))))
 assert.equal(results.filter(x=>x==='t').length,60)
 assert.equal(results.filter(x=>x==='f').length,20)
 assert.equal(await sql(`select used from fajr_private.office_quota where user_id='${actor}'`),'60')
 assert.equal(await slot(other),'t')
 await sql(`update fajr_private.office_quota set window_started_at=clock_timestamp()-interval '61 seconds' where user_id='${actor}'`)
 assert.equal(await slot(actor),'t')
 assert.equal(await sql(`select used from fajr_private.office_quota where user_id='${actor}'`),'1')
 await sql(`update fajr_private.office_members set enabled=false where user_id='${actor}'`)
 await assert.rejects(slot(actor),/Office access denied/)
 assert.equal(await sql(`select count(*) from fajr_private.office_quota`),'2')
 assert.equal(await sql(`select count(*) from public.fajr_web_requests`),'0')
})

const requestId='00000000-0000-4000-8000-000000000001'
const rpc = async statement => (await sql(`set role service_role; ${statement}`)).split('\n').at(-1)
const list = (user,offset=0) => rpc(`select public.fajr_office_list('${user}',${offset})`).then(JSON.parse)
const change = (user,expected,status,id=requestId) => rpc(`select public.fajr_office_change('${user}','${id}','${expected}','${status}')`).then(JSON.parse)
const current = () => sql(`select status from public.fajr_web_requests where id='${requestId}'`)
const audits = () => sql(`select count(*) from fajr_private.office_audit where request_id='${requestId}'`)

test('read-only office listing is bounded, ordered and projected',async()=>{
 await sql(`update fajr_private.office_members set enabled=true,can_update=(user_id='${actor}')`)
 await sql(`insert into public.fajr_web_requests(id,service,destination,variant,contact,status,created_at)
 select ('00000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid,
 'synthetic','synthetic','','qa@example.invalid','received','2026-10-30T00:00:00Z'::timestamptz
 from generate_series(1,31) i`)
 const page1=await list(other),page2=await list(other,25)
 assert.equal(page1.length,25);assert.equal(page2.length,6)
 const ids=[...page1,...page2].map(row=>row.id)
 assert.equal(new Set(ids).size,31)
 assert.deepEqual(ids,[...ids].sort().reverse())
 assert.deepEqual(Object.keys(page1[0]).sort(),['id','service','destination','variant','contact','status','created_at'].sort())
 assert.deepEqual(await list(other,31),[])
 for(const offset of ['null',-1,1000000])await assert.rejects(list(other,offset),/Invalid offset/)
})

test('anonymous/customer RPCs and direct tables remain inaccessible',async()=>{
 for(const role of ['anon','authenticated']){
  for(const statement of [
   `select public.fajr_office_list('${actor}',0)`,
   `select public.fajr_office_change('${actor}','${requestId}','received','closed')`,
   'select * from public.fajr_web_requests',
   'select * from fajr_private.office_members',
   'select * from fajr_private.office_audit',
  ])await assert.rejects(sql(`set role ${role}; ${statement}`),/permission denied/)
 }
 await assert.rejects(list(outsider),/Office access denied/)
 await assert.rejects(change(outsider,'received','closed'),/Office access denied/)
 await assert.rejects(change(other,'received','closed'),/Office access denied/)
 await assert.rejects(sql('set role service_role; select * from public.fajr_web_requests'),/permission denied/)
 assert.equal(await current(),'received');assert.equal(await audits(),'0')
})

test('authorized change and audit commit together; no-op does not duplicate audit',async()=>{
 assert.deepEqual(await change(actor,'received','reviewing'),{id:requestId,status:'reviewing'})
 assert.equal(await current(),'reviewing');assert.equal(await audits(),'1')
 const record=JSON.parse(await sql(`select row_to_json(a) from fajr_private.office_audit a where request_id='${requestId}'`))
 assert.equal(record.actor_id,actor);assert.equal(record.previous_status,'received');assert.equal(record.next_status,'reviewing')
 assert.ok(Number.isFinite(Date.parse(record.created_at)))
 await change(actor,'reviewing','reviewing');assert.equal(await audits(),'1')
 await assert.rejects(change(actor,'received','closed'),/40001/)
 await assert.rejects(change(actor,'reviewing','approved'),/Invalid status/)
 await assert.rejects(change(actor,'received','closed','00000000-0000-4000-8000-000000000099'),/40001/)
 assert.equal(await current(),'reviewing');assert.equal(await audits(),'1')
})

test('audit failure rolls back the request change',async()=>{
 await sql(`create function fajr_private.reject_test_audit() returns trigger language plpgsql as $$
 begin raise exception 'synthetic audit failure'; end; $$;
 create trigger reject_test_audit before insert on fajr_private.office_audit
 for each row execute function fajr_private.reject_test_audit()`)
 try{
  await assert.rejects(change(actor,'reviewing','contacted'),/synthetic audit failure/)
  assert.equal(await current(),'reviewing');assert.equal(await audits(),'1')
 }finally{
  await sql('drop trigger reject_test_audit on fajr_private.office_audit; drop function fajr_private.reject_test_audit()')
 }
})

test('competing updates admit one winner and one audit entry',async()=>{
 const results=await Promise.allSettled([change(actor,'reviewing','contacted'),change(actor,'reviewing','closed')])
 assert.equal(results.filter(x=>x.status==='fulfilled').length,1)
 const rejected=results.find(x=>x.status==='rejected');assert.match(rejected.reason.stderr,/40001/)
 const winner=results.find(x=>x.status==='fulfilled').value.status
 assert.equal(await current(),winner);assert.equal(await audits(),'2')
 assert.equal(await sql(`select next_status from fajr_private.office_audit where request_id='${requestId}' order by id desc limit 1`),winner)
})

test('revoked membership blocks both list and change without side effects',async()=>{
 const previous=await current()
 await sql(`update fajr_private.office_members set enabled=false where user_id='${actor}'`)
 await assert.rejects(list(actor),/Office access denied/)
 await assert.rejects(change(actor,previous,'received'),/Office access denied/)
 assert.equal(await current(),previous);assert.equal(await audits(),'2')
 assert.equal(await sql('select count(*) from public.fajr_web_requests'),'31')
})

test('revoking KAF Fajr membership also revokes office despite a remaining office grant',async()=>{
 await sql(`update fajr_private.office_members set enabled=true,can_update=true where user_id='${actor}'`)
 const previous=await current()
 await sql(`update public.business_members set status='suspended' where user_id='${actor}'`)
 await assert.rejects(list(actor),/Office access denied/)
 await assert.rejects(change(actor,previous,'received'),/Office access denied/)
 await assert.rejects(slot(actor),/Office access denied/)
 await sql(`update public.business_members set status='active',companies=ARRAY['rpc'] where user_id='${actor}'`)
 await assert.rejects(list(actor),/Office access denied/)
 await assert.rejects(change(actor,previous,'received'),/Office access denied/)
 await sql(`update public.business_members set companies=ARRAY['fajr','rpc'] where user_id='${actor}'`)
 assert.equal((await list(actor)).length,25)
 assert.equal(await current(),previous)
 assert.equal(await audits(),'2')
})
