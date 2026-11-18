import {test,before} from 'node:test';
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const exec=promisify(execFile);
const uri=new URL(process.env.OFFICE_TEST_DATABASE_URL||'invalid:');
if(uri.protocol!=='postgresql:'||!['localhost','127.0.0.1','[::1]'].includes(uri.hostname)||uri.pathname!=='/fajr_office_test'||uri.search||uri.hash)throw Error('Disposable loopback test database only');
const env={...process.env,PGHOST:uri.hostname,PGPORT:uri.port||'5432',PGDATABASE:'fajr_office_test',PGUSER:decodeURIComponent(uri.username),PGPASSWORD:decodeURIComponent(uri.password),PGCONNECT_TIMEOUT:'5'};
delete env.PGSERVICE;delete env.PGHOSTADDR;
async function command(statement){const r=await exec('psql',['-XAt','-v','ON_ERROR_STOP=1','-c',statement],{env});return r.stdout.trim()}
const owner='d5072836-0d50-4dfa-88dc-596e9befd276';
const staff='19eb0b58-dee3-4db7-898e-f57f01c72ade';
const other='29eb0b58-dee3-4db7-898e-f57f01c72ade';
const as=(actor,role,statement)=>command('set role '+role+"; set request.jwt.claim.sub='"+actor+"'; "+statement).then(s=>s.split('\n').filter(line=>line!=='SET'&&line!=='').at(-1)||'');
const rpc=(actor,action,payload={})=>as(actor,'authenticated',"select public.fajr_site_control('"+action+"','"+JSON.stringify(payload)+"'::jsonb)").then(JSON.parse);
const draft={contact:{whatsapp:'93700123456',email:'qa@example.invalid'},design:{fontPreset:'vazirmatn-manrope'},office:{address:{fa:'کابل',ps:'کابل',en:'Kabul',ar:'كابل'},hours:{fa:'۹ تا ۵',ps:'۹ تر ۵',en:'9 to 5',ar:'٩ إلى ٥'}},content:{notice:{fa:'پیام ساختگی',ps:'ازموينه',en:'Synthetic only',ar:'للاختبار فقط'},faq:[]}};
let oldRevision,firstPublished;
before(async()=>{
 await exec('psql',['-X','-v','ON_ERROR_STOP=1','-f',new URL('./sql-test/setup.sql',import.meta.url).pathname],{env});
 await command("create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; update fajr_private.office_members set can_update=true where user_id='"+owner+"'");
 await exec('psql',['-X','-v','ON_ERROR_STOP=1','-f',new URL('../../../supabase/migrations/20261116_001_fajr_site_control.sql',import.meta.url).pathname],{env});
 await exec('psql',['-X','-v','ON_ERROR_STOP=1','-f',new URL('../../../supabase/migrations/20261118_001_fajr_resource_owner_check.sql',import.meta.url).pathname],{env});
});
test('private tables inaccessible and unrelated tenants denied',async()=>{
 for(const role of ['anon','authenticated']){
  await assert.rejects(as(owner,role,'select * from fajr_private.site_settings_state'),/permission denied/);
  await assert.rejects(as(owner,role,'select * from fajr_private.site_settings_history'),/permission denied/);
 }
 await assert.rejects(as(other,'authenticated',"select public.fajr_site_control('read','{}'::jsonb)"),/forbidden|42501/);
 await assert.rejects(as(staff,'authenticated',"select public.fajr_site_control('read','{}'::jsonb)"),/forbidden|42501/);
 assert.equal(await as(owner,'anon','select public.fajr_site_published_public()'),'');
 const x=await rpc(owner,'read');assert.equal(x.canEdit,true);assert.equal(x.canPublish,true);oldRevision=x.draftRevision;
});
test('draft revision protection, allowlist and public read separation',async()=>{
 const saved=await rpc(owner,'draft',{expected:oldRevision,draft});
 assert.notEqual(saved.draftRevision,oldRevision);
 assert.equal(saved.draft.contact.whatsapp,draft.contact.whatsapp);
 await assert.rejects(rpc(owner,'draft',{expected:oldRevision,draft}),/40001|stale/);
 await assert.rejects(rpc(owner,'draft',{expected:saved.draftRevision,draft:{...draft,role:'admin'}}),/22023|invalid/);
 assert.equal(await as(owner,'anon','select public.fajr_site_published_public()'),'');
});
test('explicit publish, public-only read and historical rollback',async()=>{
 const beforePub=await rpc(owner,'read');
 await assert.rejects(rpc(owner,'publish',{expected:beforePub.draftRevision,expectedPublished:''}),/40001|confirmation/);
 const published=await rpc(owner,'publish',{expected:beforePub.draftRevision,expectedPublished:'',confirmed:true});
 firstPublished=published.publishedRevision;
 assert.equal(published.published.contact.whatsapp,draft.contact.whatsapp);
 const publicOnly=JSON.parse(await as(owner,'anon','select public.fajr_site_published_public()'));
 assert.equal(publicOnly.revision,firstPublished);
 assert.equal(Object.hasOwn(publicOnly,'draft'),false);
 const revised={...draft,contact:{...draft.contact,whatsapp:'93700999999'}};
 const saved=await rpc(owner,'draft',{expected:published.draftRevision,draft:revised});
 const latest=await rpc(owner,'publish',{expected:saved.draftRevision,expectedPublished:firstPublished,confirmed:true});
 await assert.rejects(rpc(owner,'rollback',{targetRevision:firstPublished,expectedPublished:firstPublished,confirmed:true}),/40001|revision/);
 const restored=await rpc(owner,'rollback',{targetRevision:firstPublished,expectedPublished:latest.publishedRevision,confirmed:true});
 assert.equal(restored.published.contact.whatsapp,draft.contact.whatsapp);
 assert.notEqual(restored.publishedRevision,firstPublished);
 assert.equal(restored.history.length,3);
});
test('owner-only resource probe checks active company membership AND present owner role',async()=>{
 assert.equal(await as(owner,'authenticated','select public.fajr_resource_owner_check()'),'t');
 assert.equal(await as(staff,'authenticated','select public.fajr_resource_owner_check()'),'f');
 assert.equal(await as(other,'authenticated','select public.fajr_resource_owner_check()'),'f');
 await assert.rejects(as(owner,'anon','select public.fajr_resource_owner_check()'),/permission denied/);
 // A downgrade must take effect immediately even when can_publish_site stays true.
 await command("update public.business_members set role='staff' where user_id='"+owner+"'");
 assert.equal(await as(owner,'authenticated','select public.fajr_resource_owner_check()'),'f');
 await command("update public.business_members set role='owner' where user_id='"+owner+"'");
 assert.equal(await as(owner,'authenticated','select public.fajr_resource_owner_check()'),'t');
 await command("update fajr_private.office_members set enabled=false where user_id='"+owner+"'");
 assert.equal(await as(owner,'authenticated','select public.fajr_resource_owner_check()'),'f');
 await command("update fajr_private.office_members set enabled=true where user_id='"+owner+"'");
 assert.equal(await as(owner,'authenticated','select public.fajr_resource_owner_check()'),'t');
});
test('revoking company membership and publish role blocks writes',async()=>{
 await command("update public.business_members set companies=array['rpc'] where user_id='"+owner+"'");
 await assert.rejects(rpc(owner,'read'),/42501|forbidden/);
 await command("update public.business_members set companies=array['fajr','rpc'] where user_id='"+owner+"'");
 await command("update fajr_private.office_members set can_publish_site=false where user_id='"+owner+"'");
 assert.equal(await as(owner,'authenticated','select public.fajr_resource_owner_check()'),'f');
 await assert.rejects(rpc(owner,'publish',{confirmed:true,expected:'x',expectedPublished:'x'}),/42501|publisher/);
});
