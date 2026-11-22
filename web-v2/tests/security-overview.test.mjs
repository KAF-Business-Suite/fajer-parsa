import test from 'node:test'
import assert from 'node:assert/strict'
import {parseSecurityOverview,readSecurityOverview} from '../src/office-v2/security-overview.ts'
const valid={
 scope:'fajr_owner_console',emailVerification:'verified',totp:'enabled',
 linkedProviders:['email','google'],session:{remember:true,expiresAt:'2026-11-19T09:00:00.000Z'}
}
test('client accepts only sanitized owner summary fields',()=>{
 const input={...valid,access_token:'sensitive',refresh_token:'never-in-js',email:'private@example.invalid'}
 const output=parseSecurityOverview(input)
 assert.deepEqual(output,valid)
 assert.equal('access_token' in output,false)
});
test('client rejects wrong role, unsafe providers, duplicate identities, wrong expiry and malformed types',()=>{
 for(const input of [
  {...valid,scope:'authenticated_staff'},
  {...valid,linkedProviders:['other']},
  {...valid,linkedProviders:['google','google']},
  {...valid,totp:'maybe'},
  {...valid,emailVerification:true},
  {...valid,session:{remember:'yes',expiresAt:'2026-11-19T09:00:00.000Z'}},
  {...valid,session:{remember:true,expiresAt:'not-a-date'}},
  null,[],{}
 ])assert.equal(parseSecurityOverview(input),null,JSON.stringify(input));
});
test('read only private API never sends a JWT, receives only allowlisted fields',async()=>{
 let called=0
 const result=await readSecurityOverview(async(url,init)=>{
  called++
  assert.equal(url,'/api/security/overview')
  assert.equal(init.method,'GET')
  assert.equal(init.credentials,'same-origin')
  assert.equal(init.headers['X-FP-Office-Request'],'same-origin')
  assert.equal(init.cache,'no-store')
  assert.equal(init.body,undefined)
  return Response.json({...valid,privateKey:'not-returned'})
 })
 assert.equal(called,1)
 assert.equal(result.status,'ready')
 assert.deepEqual(result.data,valid)
});
test('anonymous, denied, rate-limited, malformed and network failures never show mock account facts',async()=>{
 for(const [status,code] of [[401,'sign_in_required'],[403,'access_denied'],[429,'rate_limited'],[503,'unavailable']]){
  const result=await readSecurityOverview(async()=>Response.json({scope:'fake'},{status}))
  assert.deepEqual(result,{status:code,data:null})
 }
 assert.deepEqual(await readSecurityOverview(async()=>Response.json({bad:true})),{status:'unavailable',data:null})
 assert.deepEqual(await readSecurityOverview(async()=>{throw Error('offline')}),{status:'unavailable',data:null})
});
