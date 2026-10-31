import {test} from 'node:test'
import assert from 'node:assert/strict'
const root='https://fajr-office-qa.khoojafahim.workers.dev'
const origin='https://fajr-office-qa.khoojafahim.workers.dev'
const grab=async(path,init={})=>{
 const response=await fetch(root+path,{...init,signal:AbortSignal.timeout(16000),redirect:'error'})
 return {status:response.status,type:response.headers.get('content-type')||'',body:await response.text()}
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
 assert.match(js.body,/auth\/v1\/token\?grant_type=password/)
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

test('unused old Cloudflare proxy is disabled',async()=>{const r=await grab('/api/office',{headers:{Authorization:'Bearer synthetic.invalid.token'}});assert.equal(r.status,410)})
