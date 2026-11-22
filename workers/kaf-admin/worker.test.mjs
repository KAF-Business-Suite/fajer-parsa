import test from 'node:test'
import assert from 'node:assert/strict'
import {handleAdminRequest,KAF_ENTRY_ORIGIN,VERIFIED_BFF_ORIGIN,PINNED_KAF_PAGES_ORIGIN} from './worker.mjs'
const entry=KAF_ENTRY_ORIGIN
const cookie='__Host-fp-office-session=synthetic-session-just-for-unit-test'
function make({role=200,upstreamError=false}={}){
 const calls=[],pages=[]
 const env={KAF_OWNER_BFF:{async fetch(req){
  calls.push({url:req.url,method:req.method,origin:req.headers.get('Origin'),cookie:req.headers.get('Cookie'),headers:Object.fromEntries(req.headers.entries())})
  const url=new URL(req.url)
  assert.equal(url.origin,VERIFIED_BFF_ORIGIN)
  if(upstreamError)throw Error('synthetic backend unavailable')
  if(url.pathname==='/api/session')return Response.json(role===200?{authenticated:true,scope:'fajr_owner_console'}:{error:'denied'},{status:role})
  if(url.pathname==='/console')return new Response('<html><body><main id="login-view">KAF Admin sign-in</main></body></html>',{headers:{'Content-Type':'text/html; charset=utf-8'}})
  if(url.pathname==='/admin-auth.js')return new Response('console.log("KAF")',{headers:{'Content-Type':'text/javascript'}})
  if(url.pathname==='/api/session/login')return Response.json({authenticated:true},{headers:{'Set-Cookie':'__Host-fp-office-session=sealed; Secure; HttpOnly; Path=/; SameSite=Lax'}})
  if(url.pathname==='/api/session/logout')return Response.json({signedOut:true},{headers:{'Set-Cookie':'__Host-fp-office-session=; Secure; HttpOnly; Path=/; Max-Age=0'}})
  return Response.json({error:'not_found'},{status:404})
 }}}
 const transport=async(url,opts)=>{
  pages.push({url,opts})
  assert.equal(opts?.headers?.Cookie,undefined,'Never send staff cookie to immutable public Pages')
  if(url===PINNED_KAF_PAGES_ORIGIN+'/office-preview')return new Response('<!doctype html><html><head><script src="/assets/kaf-123.js"></script></head><body><div id="root"></div></body></html>',{status:200})
  if(url===PINNED_KAF_PAGES_ORIGIN+'/assets/kaf-123.js')return new Response('const a=1',{status:200})
  return new Response('not found',{status:404})
 }
 return {calls,pages,env,transport}
}
test('new KAF host is strictly required; external links can open guest /console',async()=>{
 const m=make()
 const r=await handleAdminRequest(new Request(entry+'/console',{headers:{'Sec-Fetch-Site':'cross-site'}}),m.env,m.transport)
 assert.equal(r.status,200)
 assert.match(await r.text(),/KAF Admin sign-in/)
 assert.equal(r.headers.get('Cache-Control'),'private, no-store')
 assert.equal(r.headers.get('X-Robots-Tag'),'noindex, nofollow')
 assert.equal(m.pages.length,0,'guest does not access React preview')
 assert.equal(m.calls[0].url,VERIFIED_BFF_ORIGIN+'/console')
 assert.equal((await handleAdminRequest(new Request('https://fake.example/console'),m.env,m.transport)).status,403)
 assert.equal((await handleAdminRequest(new Request(entry+'/'),m.env,m.transport)).headers.get('Location'),'/console')
})
test('permitted owner receives immutable KAF React on same new hostname',async()=>{
 const m=make()
 const r=await handleAdminRequest(new Request(entry+'/console#/security',{headers:{Cookie:cookie}}),m.env,m.transport)
 assert.equal(r.status,200)
 assert.match(await r.text(),/id="root"/)
 assert.equal(m.calls.length,1)
 assert.equal(m.calls[0].url,VERIFIED_BFF_ORIGIN+'/api/session')
 assert.equal(m.calls[0].cookie,cookie)
 assert.equal(m.calls[0].headers['x-fp-office-request'],'same-origin')
 assert.equal(m.pages[0].url,PINNED_KAF_PAGES_ORIGIN+'/office-preview')
})
test('revocation, unknown session and backend failure cannot serve protected HTML',async()=>{
 for(const status of [401,403,503]){
  const m=make({role:status})
  const r=await handleAdminRequest(new Request(entry+'/console',{headers:{Cookie:cookie}}),m.env,m.transport)
  assert.equal(r.status,status===401?200:status)
  assert.equal(m.pages.length,0)
 }
 const m=make({upstreamError:true})
 assert.equal((await handleAdminRequest(new Request(entry+'/console',{headers:{Cookie:cookie}}),m.env,m.transport)).status,503)
 assert.equal(m.pages.length,0)
})
test('same-origin POST forwards only to the verified BFF with normalized Origin and HttpOnly cookie',async()=>{
 const m=make()
 const r=await handleAdminRequest(new Request(entry+'/api/session/login',{method:'POST',headers:{Origin:entry,'Content-Type':'application/json','X-FP-Office-Request':'same-origin','Sec-Fetch-Site':'same-origin'},body:JSON.stringify({email:'test@example.invalid',password:'synthetic-no-secret',remember:false})}),m.env,m.transport)
 assert.equal(r.status,200)
 assert.match(r.headers.get('Set-Cookie')||'',/HttpOnly/)
 assert.equal(m.calls.length,1)
 assert.equal(m.calls[0].origin,VERIFIED_BFF_ORIGIN)
 assert.equal(m.calls[0].url,VERIFIED_BFF_ORIGIN+'/api/session/login')
 assert.equal((await handleAdminRequest(new Request(entry+'/api/session/login',{method:'POST',headers:{Origin:'https://evil.example','X-FP-Office-Request':'same-origin'},body:'{}'}),m.env,m.transport)).status,403)
 assert.equal((await handleAdminRequest(new Request(entry+'/api/session/login',{method:'POST',headers:{Origin:entry},body:'{}'}),m.env,m.transport)).status,403)
 assert.equal(m.calls.length,1,'cross-site and missing-CSRF POST blocked')
})
test('reset callback keeps independent login and styles are never mixed with private assets',async()=>{
 const m=make()
 const r=await handleAdminRequest(new Request(entry+'/console?mode=recovery',{headers:{Cookie:cookie}}),m.env,m.transport)
 assert.equal(r.status,200)
 assert.match(await r.text(),/login-view/)
 assert.equal(m.pages.length,0)
 const js=await handleAdminRequest(new Request(entry+'/admin-auth.js'),m.env,m.transport)
 assert.equal(js.status,200)
 assert.match(await js.text(),/KAF/)
 const asset=await handleAdminRequest(new Request(entry+'/assets/kaf-123.js'),m.env,m.transport)
 assert.equal(asset.status,200)
 assert.match(asset.headers.get('Content-Type'),/text\/javascript/)
 assert.equal((await handleAdminRequest(new Request(entry+'/assets/kaf-123.js?url=https://evil.test'),m.env,m.transport)).status,400)
 assert.equal((await handleAdminRequest(new Request(entry+'/api/evil%2fpath',{headers:{'X-FP-Office-Request':'same-origin'}}),m.env,m.transport)).status,404)
})
