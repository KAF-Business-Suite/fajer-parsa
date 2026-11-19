import test from 'node:test'
import assert from 'node:assert/strict'
import {handleSecurityOverview,sanitizeSecuritySummary} from './security-overview.mjs'

const base='https://fajr-office-qa.khoojafahim.workers.dev'
const clock=()=>Math.floor(Date.now()/1000)+3600
const value=()=>({access:'secret.access.synthetic',refresh:'secret.refresh.synthetic',until:clock(),remember:true})
const who=()=>({
 id:'00000000-0000-4000-8000-000000000001',role:'authenticated',
 email:'private@example.invalid',email_confirmed_at:'2026-11-01T00:00:00Z',
 identities:[{provider:'email'},{provider:'google'},{provider:'untrusted-provider'}],
 factors:[{factor_type:'totp',status:'verified',id:'private-factor-id',totp:{secret:'private-secret'}}]
})
const ownerRpc='https://example.invalid/rest/v1/rpc/fajr_resource_owner_check'
function req(path='/api/security/overview',{method='GET',header=true,cookie=true}={}){
 return new Request(base+path,{method,headers:{...(header?{'X-FP-Office-Request':'same-origin'}:{}),...(cookie?{Cookie:'__Host-fp-office-session=fake'}:{})}})
}
function fixture({identity=who(),session=value(),role=200,absent=false,authError=0}={}){
 const calls=[]
 const services={
  guard:r=>r.headers.get('X-FP-Office-Request')==='same-origin',
  parseSession:async()=>absent?null:session,
  publicKey:async()=> 'sb_publishable_synthetic',
  restore:async()=>authError?{error:authError}:{value:session,cookie:null,user:identity},
  ownerRpc,
  clearCookie:()=> '__Host-fp-office-session=; Max-Age=0; HttpOnly',
  err:(status,error,cookie)=>new Response(JSON.stringify({error}),{status,headers:cookie?{'Set-Cookie':cookie}:{}}),
  ok:(data)=>Response.json(data)
 }
 const transport=async(url,init)=>{
  calls.push({url,method:init.method,redirect:init.redirect,headers:init.headers});
  assert.equal(url,ownerRpc);
  return Response.json(role===200?true:false,{status:role});
 }
 return {services,transport,calls}
}
test('owner sees sanitized real session posture, no auth tokens, PII, factor secrets or unknown providers',async()=>{
 const f=fixture();
 const r=await handleSecurityOverview(req(),{FAJR_SESSION_KEY:{}},f.services,f.transport);
 assert.equal(r.status,200);
 const data=await r.json();
 assert.deepEqual(Object.keys(data).sort(),['emailVerification','linkedProviders','scope','session','totp']);
 assert.equal(data.scope,'fajr_owner_console');
 assert.deepEqual(data.linkedProviders,['email','google']);
 assert.equal(data.totp,'enabled');
 assert.equal(data.emailVerification,'verified');
 assert.equal(data.session.remember,true);
 assert.match(data.session.expiresAt,/^20\d\d-/);
 assert.doesNotMatch(JSON.stringify(data),/secret|access|refresh|private@example|private-factor|private-secret|untrusted-provider/);
 assert.equal(f.calls.length,1);
 assert.equal(f.calls[0].redirect,'manual');
 assert.equal(f.calls[0].method,'POST');
});
test('unknown MFA factor list is never falsely shown as disabled',()=>{
 const u=who();delete u.factors;delete u.email_confirmed_at;
 const x=sanitizeSecuritySummary(u,value());
 assert.equal(x.totp,'unknown');
 assert.equal(x.emailVerification,'unknown');
 const y=sanitizeSecuritySummary({...who(),factors:[]},value());
 assert.equal(y.totp,'not_enrolled');
});
test('anonymous, wrong method, invalid query and denied guards get no owner identity',async()=>{
 for(const [request,options,status] of [
  [req('/api/security/overview',{cookie:false}),{absent:true},401],
  [req('/api/security/overview',{header:false}),{},403],
  [req('/api/security/overview?secret=1'),{},400],
  [req('/api/security/overview',{method:'POST'}),{},405],
  [req('/api/security/overview'),{},503]
 ]){
  const f=fixture(options);
  const env=status===503?{}:{FAJR_SESSION_KEY:{}};
  const response=await handleSecurityOverview(request,env,f.services,f.transport);
  assert.equal(response.status,status);
  assert.equal(f.calls.length,0);
 }
});
test('role deny and identity outage fail closed, without returning data',async()=>{
 for(const [options,status] of [[{role:403},403],[{role:503},503],[{role:200,identity:{id:'bad',role:'anon'}},503],[{authError:401},401]]){
  const f=fixture(options);
  const r=await handleSecurityOverview(req(),{FAJR_SESSION_KEY:{}},f.services,f.transport);
  assert.equal(r.status,status);
  assert.equal((await r.json()).scope,undefined);
 }
});
test('only exact route is handled',async()=>{
 const f=fixture();
 assert.equal(await handleSecurityOverview(req('/api/security/wrong'),{},f.services,f.transport),null);
});
