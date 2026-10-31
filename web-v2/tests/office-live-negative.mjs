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
test('live office API denies unauthenticated reads/writes',async()=>{
 const get=await grab('/api/office',{headers:{Origin:origin}})
 assert.equal(get.status,401)
 assert.doesNotMatch(get.body,/contact|service_role|password|auth.users/)
 const post=await grab('/api/office',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:'{}'})
 assert.equal(post.status,401)
 assert.doesNotMatch(post.body,/contact|service_role|password|auth.users/)
})

test('public Supabase office config responds without any secret in logs',async()=>{
 const r=await fetch('https://krzxajtrhvupyywovdzy.supabase.co/functions/v1/fajr-office/config',{signal:AbortSignal.timeout(16000)})
 assert.equal(r.status,200,'Supabase public browser-safe config must respond')
 const data=await r.json()
 assert.equal(typeof data.publishableKey,'string')
 assert.ok(data.publishableKey.length>20)
})

test('live Cloudflare office proxy forwards syntactically valid but invalid JWT to Supabase',async()=>{
 const r=await grab('/api/office?offset=0',{headers:{Authorization:'Bearer synthetic.invalid.token'}})
 // No actual user is signed in; a healthy proxy must produce an Auth denial,
 // not an infrastructure/config failure or a misleading success.
 assert.equal(r.status,401,'Worker-to-Supabase proxy should reach Auth and reject synthetic JWT; observed HTTP '+r.status+' with '+r.body.slice(0,90))
 assert.doesNotMatch(r.body,/service_role|contact|password|auth.users/)
})
