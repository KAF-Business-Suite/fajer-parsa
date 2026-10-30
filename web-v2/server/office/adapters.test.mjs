import { test } from 'node:test'
import assert from 'node:assert/strict'
import { officeDependencies } from './adapters.ts'
import { handleOffice } from './handler.ts'

const origin='https://office.example.invalid', project='https://krzxajtrhvupyywovdzy.supabase.co'
const actor='d5072836-0d50-4dfa-88dc-596e9befd276', id='19eb0b58-dee3-4db7-898e-f57f01c72ade'
const config={enabled:true,origin,projectUrl:project,serverKey:'synthetic-server-key'}
const request=(method='GET',body)=>new Request('https://office.example.invalid/api',{method,headers:{Origin:origin,Authorization:'Bearer synthetic-user-token','Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})})
const auth=()=>Response.json({id:actor,role:'authenticated',is_anonymous:false})
const item={id,service:'synthetic',destination:'synthetic',variant:'synthetic',contact:'qa@example.invalid',status:'received',created_at:'2026-10-30T00:00:00Z'}

test('untrusted project URLs and missing shared limiter are rejected before network',()=>{
 for(const projectUrl of ['http://krzxajtrhvupyywovdzy.supabase.co','https://evil.invalid',project+'/path',project+'?x=1','https://user@krzxajtrhvupyywovdzy.supabase.co'])
  assert.throws(()=>officeDependencies({...config,projectUrl},async()=>true))
 assert.throws(()=>officeDependencies(config,undefined))
})
test('disabled office makes no Auth, quota or RPC calls',async()=>{
 let calls=0;const deps=officeDependencies({...config,enabled:false},async()=>{calls++;return true},async()=>{calls++;return auth()})
 assert.equal((await handleOffice(request(),deps)).status,503);assert.equal(calls,0)
})
test('server verifies token remotely and projects the bounded RPC result',async()=>{
 const calls=[];const deps=officeDependencies(config,async user=>{assert.equal(user,actor);return true},async(url,init)=>{calls.push({url:String(url),init});return calls.length===1?auth():Response.json([{...item,private_extra:'not-for-client'}])})
 const result=await handleOffice(request(),deps)
 assert.equal(result.status,200);assert.deepEqual(await result.json(),[item])
 assert.equal(calls[0].url,project+'/auth/v1/user');assert.equal(calls[0].init.headers.Authorization,'Bearer synthetic-user-token')
 assert.equal(calls[1].url,project+'/rest/v1/rpc/fajr_office_list');assert.equal(calls[1].init.headers.Authorization,'Bearer synthetic-server-key')
 assert.deepEqual(JSON.parse(calls[1].init.body),{actor,row_offset:0});assert.ok(calls.every(x=>x.init.redirect==='error'&&x.init.signal))
})
test('revoked, anonymous and malformed sessions never reach quota or RPC',async()=>{
 for(const response of [()=>new Response(null,{status:401}),()=>Response.json({id:actor,role:'authenticated',is_anonymous:true}),()=>Response.json({id:'owner',role:'authenticated'}),()=>Response.json({id:actor,role:'anon'})]){
  let calls=0,slots=0;const deps=officeDependencies(config,async()=>{slots++;return true},async()=>{calls++;return response()})
  assert.equal((await handleOffice(request(),deps)).status,401);assert.equal(calls,1);assert.equal(slots,0)
 }
})
test('Auth outage fails closed instead of attempting the database',async()=>{
 let calls=0;const deps=officeDependencies(config,async()=>true,async()=>{calls++;return Response.json({message:'private'},{status:500})})
 const result=await handleOffice(request(),deps);assert.equal(result.status,503);assert.doesNotMatch(await result.text(),/private/);assert.equal(calls,1)
})
test('shared quota denial returns 429 and no database call',async()=>{
 let calls=0;const deps=officeDependencies(config,async()=>false,async()=>{calls++;return auth()})
 const result=await handleOffice(request(),deps);assert.equal(result.status,429);assert.equal(result.headers.get('Retry-After'),'60');assert.equal(calls,1)
})
test('permission denial and expected-state conflict are typed and private',async()=>{
 for(const [code,status] of [['42501',403],['40001',409],['XX000',503]]){
  let calls=0;const deps=officeDependencies(config,async()=>true,async()=>++calls===1?auth():Response.json({code,message:'private-database-detail'},{status:400}))
  const result=await handleOffice(request('POST',{id,expected:'received',status:'reviewing'}),deps)
  assert.equal(result.status,status);assert.doesNotMatch(await result.text(),/private-database-detail/)
 }
})
test('unexpected, oversized and malformed RPC results never produce success',async()=>{
 for(const value of [{data:[item]},Array(26).fill(item),[{...item,status:'approved'}],[{...item,created_at:'invalid'}]]){
  let calls=0;const deps=officeDependencies(config,async()=>true,async()=>++calls===1?auth():Response.json(value))
  assert.equal((await handleOffice(request(),deps)).status,503)
 }
})
test('verified actor and expected state reach change RPC; returned identity must match',async()=>{
 let calls=0;const deps=officeDependencies(config,async()=>true,async(url,init)=>{
  if(++calls===1)return auth()
  assert.equal(String(url),project+'/rest/v1/rpc/fajr_office_change')
  assert.deepEqual(JSON.parse(init.body),{actor,request_uuid:id,expected_status:'received',next_status:'reviewing'})
  return Response.json({id,status:'reviewing',secret:'discard'})
 })
 const result=await handleOffice(request('POST',{id,expected:'received',status:'reviewing'}),deps)
 assert.equal(result.status,200);assert.deepEqual(await result.json(),{id,status:'reviewing'})
 let n=0;const bad=officeDependencies(config,async()=>true,async()=>++n===1?auth():Response.json({id:actor,status:'reviewing'}))
 assert.equal((await handleOffice(request('POST',{id,expected:'received',status:'reviewing'}),bad)).status,503)
})
