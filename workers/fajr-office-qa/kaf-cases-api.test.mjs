import test from 'node:test'
import assert from 'node:assert/strict'
import {handleKafCasesRead} from './kaf-cases-api.mjs'

const origin='https://fajr-office-qa.khoojafahim.workers.dev'
const role='https://krzxajtrhvupyywovdzy.supabase.co/rest/v1/rpc/fajr_resource_owner_check'
const source='https://krzxajtrhvupyywovdzy.supabase.co/rest/v1/kaf_work_items'
const env={FAJR_SESSION_KEY:'synthetic'}
const row={id:'00000000-0000-4000-8000-000000000001',
 workspace_id:'d5072836-0d50-4dfa-88dc-596e9befd276',company_key:'fajr',
 code:'FP-CASE-01',title:'Synthetic visa case',status:'در جریان',
 due_date:'2026-12-01',assigned_to:'synthetic manager',next_action:'Synthetic follow-up',
 revision:2,updated_at:'2026-11-18T10:00:00Z',customer_id:'private-must-not-leak',
 created_by:'private-must-not-leak',internal_token:'private-must-not-leak'}
function req(path='/api/kaf/cases',opts={}){
 return new Request(origin+path,{method:opts.method||'GET',headers:{
  ...(opts.header===false?{}:{'X-FP-Office-Request':'same-origin'}),
  ...(opts.site?{'Sec-Fetch-Site':opts.site}:{})}})
}
function services({anon=false,expired=false}={}){
 return {
  guard:r=>r.headers.get('X-FP-Office-Request')==='same-origin'&&r.headers.get('Sec-Fetch-Site')!=='cross-site',
  parseSession:async()=>anon?null:{opaque:'cookie only'},
  publicKey:async()=> 'sb_publishable_synthetic',
  restore:async()=>expired?{error:401}:{value:{access:'synthetic-user-token'},cookie:'cookie-rotated'},
  clearCookie:()=> '__Host-fp-office-session=; Max-Age=0',
  err:(status,error)=>Response.json({error},{status,headers:{'Cache-Control':'no-store'}}),
  ok:(data)=>Response.json(data,{headers:{'Cache-Control':'no-store'}})
 }
}
function upstream({owner=true,roleStatus=200,readStatus=200,rows=[row],offline=false}={}){
 const calls=[]
 return {calls,transport:async(url,init)=>{
  calls.push({url,init})
  if(offline)throw Error('offline')
  assert.equal(init.redirect,'manual')
  assert.equal(init.cache,'no-store')
  if(url===role){
   assert.equal(init.method,'POST')
   assert.equal(init.headers.Authorization,'Bearer synthetic-user-token')
   assert.equal(init.headers.apikey,'sb_publishable_synthetic')
   return Response.json(owner,{status:roleStatus})
  }
  const parsed=new URL(url)
  if(parsed.origin===new URL(source).origin&&parsed.pathname==='/rest/v1/kaf_work_items'){
   assert.equal(init.method,'GET')
   assert.equal(init.headers.Authorization,'Bearer synthetic-user-token')
   assert.equal(init.headers.apikey,'sb_publishable_synthetic')
   assert.equal(parsed.searchParams.get('company_key'),'eq.fajr')
   assert.equal(parsed.searchParams.get('limit'),'25')
   assert.equal(parsed.searchParams.get('order'),'updated_at.desc,id.desc')
   assert.doesNotMatch(parsed.search,/service_role|rpc|company_key=eq.rpc/)
   return Response.json(rows,{status:readStatus})
  }
  throw Error('unapproved upstream '+url)
 }}
}
test('exact path, strict pagination, same-origin and GET-only before auth or DB',async()=>{
 const u=upstream()
 assert.equal(await handleKafCasesRead(req('/api/kaf/unknown'),env,services(),u.transport),null)
 for(const [request,status] of [
  [req('/api/kaf/cases',{method:'POST'}),405],
  [req('/api/kaf/cases?company_key=eq.rpc'),400],
  [req('/api/kaf/cases?offset=01'),400],
  [req('/api/kaf/cases?offset=1'),400],
  [req('/api/kaf/cases?offset=25&offset=50'),400],
  [req('/api/kaf/cases?offset=10025'),400],
  [req('/api/kaf/cases',{header:false}),403],
  [req('/api/kaf/cases',{site:'cross-site'}),403]
 ]){
  const r=await handleKafCasesRead(request,env,services(),u.transport)
  assert.equal(r.status,status)
 }
 assert.equal(u.calls.length,0)
})
test('anonymous, expired or missing key never reach owner check or KAF data',async()=>{
 const u=upstream()
 assert.equal((await handleKafCasesRead(req(),env,services({anon:true}),u.transport)).status,401)
 assert.equal((await handleKafCasesRead(req(),env,services({expired:true}),u.transport)).status,401)
 assert.equal((await handleKafCasesRead(req(),{},services(),u.transport)).status,503)
 assert.equal(u.calls.length,0)
})
test('Fajr owner verification required even when KAF table grants read',async()=>{
 for(const v of [{owner:false},{roleStatus:403},{roleStatus:500},{offline:true}]){
  const u=upstream(v)
  const r=await handleKafCasesRead(req(),env,services(),u.transport)
  assert.equal(r.status,v.roleStatus===500||v.offline?503:403)
  assert.ok(u.calls.length<=1)
 }
})
test('real KAF tenant-only RLS request, strictly projected Fajr cases and next-action, no sensitive data',async()=>{
 const u=upstream()
 const r=await handleKafCasesRead(req('/api/kaf/cases?offset=25'),env,services(),u.transport)
 assert.equal(r.status,200)
 assert.equal(r.headers.get('Cache-Control'),'no-store')
 assert.equal(u.calls.length,2)
 const upstreamUrl=new URL(u.calls[1].url)
 assert.equal(upstreamUrl.searchParams.get('offset'),'25')
 assert.equal(upstreamUrl.searchParams.get('company_key'),'eq.fajr')
 const response=await r.text()
 const [item]=JSON.parse(response)
 assert.deepEqual(item,{
  id:row.id,workspaceId:row.workspace_id,company:'fajr',code:row.code,title:row.title,
  status:row.status,dueDate:row.due_date,assignedTo:row.assigned_to,
  nextAction:row.next_action,revision:row.revision,updatedAt:row.updated_at
 })
 assert.doesNotMatch(response,/private-must-not-leak|synthetic-user-token|sb_publishable|customer_id|created_by/)
})
test('RLS upstream denial, wrong company and malformed rows fail closed without demo fallback',async()=>{
 for(const v of [{readStatus:403},{readStatus:429},{readStatus:503},{rows:[{...row,company_key:'rpc'}]},
  {rows:[{...row,revision:'1'}]},{rows:Array.from({length:26},()=>row)},{rows:{rows:[row]}}]){
  const u=upstream(v)
  const r=await handleKafCasesRead(req(),env,services(),u.transport)
  assert.equal(r.status,v.readStatus===403?403:v.readStatus===429?429:503)
  assert.doesNotMatch(await r.text(),/Synthetic visa case|internal_token/)
 }
})
