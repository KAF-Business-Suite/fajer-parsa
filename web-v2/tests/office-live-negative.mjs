import {test} from 'node:test'
import assert from 'node:assert/strict'
const root='https://fajr-office-qa.khoojafahim.workers.dev'
const origin='https://fajr-office-qa.khoojafahim.workers.dev'
const strictBff=process.env.FAJR_OFFICE_LIVE_BFF_REQUIRED==='true'
// Retry only transient TCP/timeout failures on SAFE GET reads. HTTP failures,
 // authorization denials and writes are never retried or reclassified as PASS.
const grab=async(path,init={})=>{
 let last;
 const attempts=(init.method||'GET')==='GET'?3:1;
 for(let i=0;i<attempts;i++){
  try{
   const response=await fetch(root+path,{...init,signal:AbortSignal.timeout(16000),redirect:'error'});
   return {status:response.status,type:response.headers.get('content-type')||'',body:await response.text()};
  }catch(error){
   last=error;
   if(i+1===attempts)break;
   await new Promise(resolve=>setTimeout(resolve,250*(i+1)));
  }
 }
 throw last;
}
test('live staff login shell and script load via HTTPS',async()=>{
 const home=await grab('')
 assert.equal(home.status,200,'office HTML HTTPS must be live')
 assert.match(home.type,/text\/html/)
 assert.match(home.body,/دفتر مدیریت درخواست‌ها/)
 const css=await grab('/app.css')
 assert.equal(css.status,200)
 assert.match(css.type,/text\/css/)
 const js=await grab('/app.js')
 assert.equal(js.status,200)
 assert.match(js.type,/javascript/)
 assert.ok(js.body.includes("next==='console-security'?'/console#/security':null"),'QA Worker must keep the fixed internal Security Center destination after login')
 if(strictBff){
  assert.match(js.body,/\/api\/session\/login/,'BFF must use same-origin login')
  assert.doesNotMatch(js.body,/sessionStorage\.setItem|grant_type=password|grant_type=refresh_token/,'BFF browser must not manage passwords or refresh grants')
 }else{
  assert.ok(js.body.includes('/api/session/login')||js.body.includes('grant_type=password'),'Known office shell required')
  console.log('LIVE_BFF_ACCEPTANCE=NOT_RUN (explicit strict mode required)')
 }
})
test('direct office API denies unauthenticated reads/writes',async()=>{
 const api='https://krzxajtrhvupyywovdzy.supabase.co/functions/v1/fajr-office/api/office'
 for(const method of ['GET','POST']){
  const r=await fetch(api,{method,headers:{Origin:origin,...(method==='POST'?{'Content-Type':'application/json'}:{})},...(method==='POST'?{body:'{}'}:{}),signal:AbortSignal.timeout(16000),redirect:'error'})
  assert.equal(r.status,401)
  const body=await r.text()
  assert.doesNotMatch(body,/contact|service_role|password|auth.users/)
 }
})

test('public Supabase office config responds without any secret in logs',async()=>{
 const r=await fetch('https://krzxajtrhvupyywovdzy.supabase.co/functions/v1/fajr-office/config',{signal:AbortSignal.timeout(16000)})
 assert.equal(r.status,200,'Supabase public browser-safe config must respond')
 const data=await r.json()
 assert.equal(typeof data.publishableKey,'string')
 assert.ok(data.publishableKey.length>20)
})

test('live Supabase office API verifies signed-in JWT independently of Cloudflare',async()=>{
 const directUrl='https://krzxajtrhvupyywovdzy.supabase.co/functions/v1/fajr-office/api/office?offset=0';
 const response=await fetch(directUrl,{headers:{Authorization:'Bearer synthetic.invalid.token',Origin:origin},signal:AbortSignal.timeout(16000),redirect:'error'});
 const r={status:response.status,body:await response.text()}
 // No actual user is signed in; a healthy proxy must produce an Auth denial,
 // not an infrastructure/config failure or a misleading success.
 assert.equal(r.status,401,'Supabase office API must validate auth and reject synthetic JWT; observed HTTP '+r.status+' with '+r.body.slice(0,90))
 assert.doesNotMatch(r.body,/service_role|contact|password|auth.users/)
})

test('deployed Worker fails closed for unauthenticated visitors; strict BFF check is separate',async()=>{
 const noHeader=await grab('/api/session')
 const session=await grab('/api/session',{headers:{'X-FP-Office-Request':'same-origin'}})
 const office=await grab('/api/office?offset=0',{headers:{'X-FP-Office-Request':'same-origin'}})
 const legacy=await grab('/api/office',{headers:{Authorization:'Bearer synthetic.invalid.token'}})
 for(const result of [noHeader,session,office,legacy]){
  assert.notEqual(result.status,200,'No unauthenticated Office data')
  assert.doesNotMatch(result.body,/service_role|@example.invalid|refresh_token|auth.users/)
 }
 if(strictBff){
  assert.equal(noHeader.status,403)
  assert.equal(session.status,401)
  assert.match(session.body,/sign_in_required/)
  assert.equal(office.status,401)
  assert.equal(legacy.status,403)
 }else{
  console.log('LIVE_OFFICE_DENIALS=PASS; PERSISTENT_BFF_SESSION=NOT_TESTED_IN_NONSTRICT_MODE')
 }
})


test('live QA synthetic invalid-credentials roundtrip proves Worker reaches Supabase Auth',async()=>{
 if(!strictBff){
  console.log('LIVE_SYNTHETIC_AUTH_ROUNDTRIP=NOT_RUN: requires explicit strict QA mode');
  return;
 }
 // A nonexistent account is deliberately used; a healthy Auth path returns 401.
 // A 503 means Worker egress is still broken, regardless of local unit PASS.
 const response=await fetch(root+'/api/session/login',{
  method:'POST',
  headers:{Origin:origin,'X-FP-Office-Request':'same-origin','Content-Type':'application/json'},
  body:JSON.stringify({email:'qa-fajr-worker-connectivity@example.invalid',password:'synthetic-only-no-real-account',remember:false}),
  signal:AbortSignal.timeout(16000),
  redirect:'error'
 });
 const stage=response.headers.get('x-fp-auth-stage');
 let payload;try{payload=await response.json()}catch{payload={error:'unparseable'}}
 assert.equal(response.status,401,
  'Expected explicit nonexistent-user rejection, not unavailable transport. HTTP '+response.status+' at '+(stage||'unknown-stage'));
 assert.deepEqual(payload,{error:'login_failed'});
 assert.equal(response.headers.get('set-cookie'),null,'A rejected synthetic sign-in must never create a staff session');
 console.log('LIVE_SYNTHETIC_AUTH_ROUNDTRIP=PASS (Worker->config->GoTrue reachability; no genuine account)');
});


test('live QA security center denies unauthenticated access and resolves immutable console source',async()=>{
 const health=await grab('/__qa/console-source-health')
 assert.equal(health.status,200,'QA private console source must serve a verified immutable Pages build; body: '+health.body.slice(0,90))
 assert.deepEqual(JSON.parse(health.body),{status:'ready'})
 const withoutHeader=await grab('/api/security/overview')
 assert.equal(withoutHeader.status,403,'CSRF-style same-origin guard is mandatory')
 const withHeader=await grab('/api/security/overview',{headers:{'X-FP-Office-Request':'same-origin'}})
 assert.equal(withHeader.status,401,'Unapproved visitor must never see owner account status')
 assert.deepEqual(JSON.parse(withHeader.body),{error:'sign_in_required'})
 for(const answer of [withoutHeader,withHeader]){
  assert.doesNotMatch(answer.body,/refresh_token|access_token|secret|email_confirmed_at|@example/)
 }
})
