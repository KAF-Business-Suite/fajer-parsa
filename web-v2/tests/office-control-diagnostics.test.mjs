import test from 'node:test'
import assert from 'node:assert/strict'
import {checkOfficeControls} from '../src/office-v2/office-control-diagnostics.ts'

const security={
 scope:'fajr_owner_console',emailVerification:'verified',totp:'not_enrolled',
 linkedProviders:['email'],session:{remember:false,expiresAt:'2026-12-01T09:00:00.000Z'},
 email:'secret@example.invalid',access_token:'must-not-expose'
}
const website={draftRevision:null,publishedRevision:'rev-qa',canEdit:true,canPublish:false,secret:'not-client'}
const resource={
 id:'cloudflare-pages/fajr-parsa-qa',provider:'cloudflare_pages',
 name:'fajr-parsa-qa',url:'https://fajr-parsa-qa.pages.dev',
 productionBranch:'main',permission:'read-only',ownerVerified:true,
 allowedActions:['inspect'],lastVerifiedAt:'2026-11-19T10:00:00Z',
 private_token:'not-client'
}
const paths=[
 '/api/security/overview',
 '/api/site-settings/draft',
 '/api/resources/providers/cloudflare/fajr-parsa-qa'
]
test('owner diagnostic uses exactly three no-write same-origin private GETs and exposes only safe statuses',async()=>{
 const calls=[]
 const transport=async(url,init)=>{
  calls.push({url,init})
  assert.equal(init.method,'GET')
  assert.equal(init.credentials,'same-origin')
  assert.equal(init.cache,'no-store')
  assert.equal(init.redirect,'error')
  assert.equal(init.body,undefined)
  assert.equal(init.headers['X-FP-Office-Request'],'same-origin')
  assert.equal(init.headers.Accept,'application/json')
  assert.equal(init.headers.Authorization,undefined)
  return Response.json(url===paths[0]?security:url===paths[1]?website:resource)
 }
 const result=await checkOfficeControls(transport)
 assert.deepEqual(calls.map(x=>x.url).sort(),[...paths].sort())
 assert.deepEqual(result,{
  kind:'read_only_diagnostic',
  checks:[
   {name:'identity',status:'ready',mode:'read_only'},
   {name:'website',status:'ready',mode:'permissions_reported',canEdit:true,canPublish:false},
   {name:'resources',status:'ready',mode:'read_only'}
  ]
 })
 assert.doesNotMatch(JSON.stringify(result),/secret|token|@example|rev-qa|productionBranch|private_token/)
})
test('403 and 401 are explicit, not faked as successful connections',async()=>{
 const out=await checkOfficeControls(async(path)=>{
  if(path===paths[0])return Response.json({error:'sign_in_required'},{status:401})
  if(path===paths[1])return Response.json({error:'access_denied'},{status:403})
  return Response.json({error:'unavailable'},{status:503})
 })
 assert.deepEqual(out.checks.map(x=>x.status),['sign_in_required','access_denied','unavailable'])
 assert.ok(out.checks.every(x=>x.mode==='not_verified'))
 assert.ok(out.checks.every(x=>!('canEdit' in x)&&!('canPublish' in x)))
})
test('malformed 200 payloads and network errors never grant a verified status',async()=>{
 const bad=await checkOfficeControls(async(path)=>{
  if(path===paths[2])throw Error('network unavailable')
  return Response.json({success:true})
 })
 assert.deepEqual(bad.checks.map(x=>x.status),['unavailable','unavailable','unavailable'])
})
test('server denies site edit permission without creating write controls',async()=>{
 const out=await checkOfficeControls(async(path)=>Response.json(
  path===paths[0]?security:path===paths[1]?{...website,canEdit:false,canPublish:false}:resource
 ))
 assert.equal(out.checks[1].status,'ready')
 assert.equal(out.checks[1].canEdit,false)
 assert.equal(out.checks[1].canPublish,false)
 assert.equal(out.kind,'read_only_diagnostic')
})
