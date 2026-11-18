import test from 'node:test'
import assert from 'node:assert/strict'
import {isPrivateOfficeConsole,readOwnerPagesMetadata,PRIVATE_PAGES_PATH} from '../src/office-v2/private-office-bridge.ts'

test('only the canonical authenticated Office /console origin can enter private mode',()=>{
 assert.equal(isPrivateOfficeConsole({hostname:'fajr-office-qa.khoojafahim.workers.dev',pathname:'/console'}),true)
 for(const [hostname,pathname] of [
  ['fajr-office-qa.khoojafahim.workers.dev','/'],
  ['fajr-office-qa.khoojafahim.workers.dev','/resources'],
  ['fp-admin-v2-review.fajr-parsa-qa.pages.dev','/console'],
  ['127.0.0.1','/console'],
  ['fajr-office-qa.khoojafahim.workers.dev.attacker.org','/console']
 ])assert.equal(isPrivateOfficeConsole({hostname,pathname}),false)
})
const owner={
 id:'cloudflare-pages/fajr-parsa-qa',provider:'cloudflare_pages',name:'fajr-parsa-qa',
 url:'https://fajr-parsa-qa.pages.dev',productionBranch:'main',
 permission:'read-only',ownerVerified:true,allowedActions:['inspect'],
 lastVerifiedAt:'2026-11-18T11:00:00.000Z'
}
test('same-origin provider read uses cookie session automatically, without JS tokens',async()=>{
 const calls=[]
 const res=await readOwnerPagesMetadata(async(path,init)=>{
  calls.push({path,init})
  return Response.json(owner,{status:200})
 })
 assert.equal(res.status,'connected')
 assert.equal(res.data.name,'fajr-parsa-qa')
 assert.equal(calls.length,1)
 assert.equal(calls[0].path,PRIVATE_PAGES_PATH)
 assert.equal(calls[0].init.method,'GET')
 assert.equal(calls[0].init.credentials,'same-origin')
 assert.equal(calls[0].init.cache,'no-store')
 assert.deepEqual(Object.keys(calls[0].init.headers).sort(),['Accept','X-FP-Office-Request'].sort())
 assert.equal(calls[0].init.headers.Authorization,undefined)
})
test('denied, expired and unavailable sessions are never shown as a verified connection',async()=>{
 for(const [code,status] of [[401,'sign_in_required'],[403,'access_denied'],[503,'unavailable']]){
  const res=await readOwnerPagesMetadata(async()=>Response.json({error:'no access'},{status:code}))
  assert.equal(res.status,status)
  assert.equal(res.data,null)
 }
})
test('mismatched upstream resource, excessive rights, or fake owner attestation fails closed',async()=>{
 for(const diff of [
  {name:'other-pages-project'},{url:'https://other.pages.dev'},
  {ownerVerified:false},{permission:'edit'},
  {allowedActions:['inspect','publish']},{allowedActions:['delete']},
  {id:'cloudflare-pages/kaf-project'},{provider:'wordpress'}
 ]){
  const res=await readOwnerPagesMetadata(async()=>Response.json({...owner,...diff}))
  assert.equal(res.status,'unavailable',JSON.stringify(diff))
 }
})
test('network errors and non-object payloads never fabricate verified connection',async()=>{
 assert.equal((await readOwnerPagesMetadata(async()=>{throw Error('network offline')})).status,'unavailable')
 assert.equal((await readOwnerPagesMetadata(async()=>Response.json([]))).status,'unavailable')
})
