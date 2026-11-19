import test from 'node:test'
import assert from 'node:assert/strict'
import {handlePrivateConsole,consoleAssetPathAllowed,consolePinnedOrigin} from './console-gateway.mjs'

const BASE='https://fajr-office-qa.khoojafahim.workers.dev'
const CSP="default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'"
const security={'Content-Security-Policy':CSP,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}
const cookie='__Host-fp-office-session=synthetic-cookie-only'
function request(path,headers={},method='GET'){return new Request(BASE+path,{method,headers})}
function fake({auth=200,assetStatus=200,wrongHtml=false,redirectAsset=false}={}){
 const calls=[]
 const transport=async(url,init)=>{
  calls.push({url,init})
  assert.equal(init.redirect,'manual')
  assert.equal(init.method,'GET')
  assert.equal(init.cache,'no-store')
  assert.ok(!init.headers.Cookie&&!init.headers.Authorization,'No cookie or API key may reach immutable Pages')
  if(assetStatus!==200)return new Response('Blocked',{status:assetStatus})
  if(redirectAsset)return new Response(null,{status:302,headers:{Location:'https://attacker.example'}})
  if(url.endsWith('/office-preview'))return new Response(wrongHtml?'<html>wrong</html>':'<html lang="fa"><head><script type="module" src="./assets/office-preview-abc123.js"></script></head><body><div id="root"></div></body></html>',{status:200,headers:{'Content-Type':'text/html'}})
  return new Response('console.log("static test bundle")',{status:200,headers:{'Content-Type':'application/javascript'}})
 }
 const handleConsoleAccess=async(req)=>{
  assert.equal(new URL(req.url).pathname,'/api/session')
  assert.equal(req.headers.get('X-FP-Office-Request'),'same-origin')
  assert.equal(req.headers.get('Cookie'),cookie)
  return Response.json(auth===200?{authenticated:true}:{error:'denied'},{status:auth,headers:auth===200?{}:{'Set-Cookie':'__Host-fp-office-session=; Max-Age=0'}})
 }
 return{calls,transport,services:{handleConsoleAccess,security}}
}
test('private 46-module route not available on public/noncanonical domains',async()=>{
 const m=fake()
 assert.equal(await handlePrivateConsole(new Request('https://fajr-parsa-qa.pages.dev/console'),{},m.services,m.transport),null)
 assert.equal(await handlePrivateConsole(request('/unknown'),{},m.services,m.transport),null)
 assert.equal(await handlePrivateConsole(request('/assets/../../etc/passwd'),{},m.services,m.transport),null)
 assert.equal(m.calls.length,0)
})
test('no cookie returns office login redirect BEFORE any network or HTML',async()=>{
 const m=fake()
 const r=await handlePrivateConsole(request('/console'),{},m.services,m.transport)
 assert.equal(r.status,302)
 assert.equal(r.headers.get('Location'),'/?next=console')
 assert.equal(r.headers.get('Cache-Control'),'no-store')
 assert.equal(m.calls.length,0)
})
test('invalid or revoked staff session never releases private HTML',async()=>{
 for(const code of [401,403,503]){
  const m=fake({auth:code})
  const r=await handlePrivateConsole(request('/console',{Cookie:cookie}),{},m.services,m.transport)
  assert.equal(r.status,code===401?302:code)
  assert.equal(m.calls.length,0,'no Pages content fetched before Office privilege acceptance')
 }
})
test('authorized staff sees existing 46 module bundle and strictly same-origin CSP',async()=>{
 const m=fake()
 const r=await handlePrivateConsole(request('/console',{Cookie:cookie}),{},m.services,m.transport)
 assert.equal(r.status,200)
 assert.equal(r.headers.get('Cache-Control'),'private, no-store')
 assert.equal(r.headers.get('X-Robots-Tag'),'noindex, nofollow')
 assert.match(r.headers.get('Content-Security-Policy'),/font-src 'self'/)
 assert.match(r.headers.get('Content-Security-Policy'),/script-src 'self'/)
 const html=await r.text()
 assert.ok(html.includes('id="root"'))
 assert.equal(m.calls.length,1)
 assert.equal(m.calls[0].url,consolePinnedOrigin()+'/office-preview')
})
test('asset proxy allows only immutable local hashed assets; no user-controlled host or redirect',async()=>{
 assert.equal(consoleAssetPathAllowed('/assets/office-preview-abc123.js'),true)
 assert.equal(consoleAssetPathAllowed('/assets/font-abc.woff2'),true)
 for(const bad of ['/assets/../../api.js','/assets/foo.js/next','/assets/.env',
 '/assets/x.html','/assets/x.txt','/assets/x.js?url=https://evil.com','/assets/%2e%2e%2fsecret.js','/console-assets/s.js'])
  assert.equal(consoleAssetPathAllowed(bad),false,bad)
 const m=fake()
 const r=await handlePrivateConsole(request('/assets/office-preview-abc123.js',{Cookie:cookie}),{},m.services,m.transport)
 assert.equal(r.status,200)
 assert.match(r.headers.get('Content-Type'),/text\/javascript/)
 assert.equal(m.calls.length,1)
 assert.equal(m.calls[0].url,consolePinnedOrigin()+'/assets/office-preview-abc123.js')
 const noRedirect=fake({redirectAsset:true})
 assert.equal((await handlePrivateConsole(request('/assets/office-preview-abc123.js'),{},noRedirect.services,noRedirect.transport)).status,503)
})
test('immutable source unavailable or malformed HTML fails closed without switching to mutable alias',async()=>{
 for(const flags of [{assetStatus:503},{wrongHtml:true}]){
  const m=fake(flags)
  const r=await handlePrivateConsole(request('/console',{Cookie:cookie}),{},m.services,m.transport)
  assert.equal(r.status,503)
 }
})
test('mutations, query strings, unknown extensions and cross-site paths denied',async()=>{
 const m=fake()
 assert.equal((await handlePrivateConsole(request('/console',{},'POST'),{},m.services,m.transport)).status,405)
 assert.equal((await handlePrivateConsole(request('/assets/office-preview-abc123.js?remote=https://evil.com'),{},m.services,m.transport)).status,400)
 assert.equal(await handlePrivateConsole(request('/assets/secret.json'),{},m.services,m.transport),null)
 assert.equal(m.calls.length,0)
})

test('tracking query on /console does not block safe owner navigation or affect backend or fixed source',async()=>{
 // This was reported from the actual S21 screenshot: temporarily unavailable (query).
 // Hash fragments stay in the browser and do not reach the server.
 const m=fake()
 const path='/console?utm_source=chatgpt&next=https%3A%2F%2Fattacker.example%2Fcallback'
 const ok=await handlePrivateConsole(request(path+'#/requests',{Cookie:cookie}),{},m.services,m.transport)
 assert.equal(ok.status,200)
 assert.ok((await ok.text()).includes('id="root"'))
 assert.equal(ok.headers.get('Cache-Control'),'private, no-store')
 assert.equal(m.calls.length,1)
 assert.equal(m.calls[0].url,consolePinnedOrigin()+'/office-preview')
 assert.equal(m.calls[0].init.headers.Cookie,undefined)
 assert.equal(m.calls[0].init.headers.Authorization,undefined)
 const guest=fake()
 const denied=await handlePrivateConsole(request(path),{},guest.services,guest.transport)
 assert.equal(denied.status,302)
 assert.equal(denied.headers.get('Location'),'/?next=console')
 assert.equal(guest.calls.length,0)
 const revoked=fake({auth:403})
 const forbidden=await handlePrivateConsole(request(path,{Cookie:cookie}),{},revoked.services,revoked.transport)
 assert.equal(forbidden.status,403)
 assert.equal(revoked.calls.length,0)
})

test('QA source probe has no staff cookie requirement and checks only pinned immutable public frontend',async()=>{
 const m=fake();
 const r=await handlePrivateConsole(request('/__qa/console-source-health'),{},m.services,m.transport);
 assert.equal(r.status,200);
 assert.equal((await r.json()).status,'ready');
 assert.equal(m.calls.length,1);
 assert.equal(m.calls[0].url,consolePinnedOrigin()+'/office-preview');
 assert.equal(m.calls[0].init.headers.Cookie,undefined);
 const bad=fake({assetStatus:503});
 const result=await handlePrivateConsole(request('/__qa/console-source-health'),{},bad.services,bad.transport);
 assert.equal(result.status,503);
 assert.deepEqual(await result.json(),{status:'source_unavailable'});
 assert.equal((await handlePrivateConsole(request('/__qa/console-source-health?path=other'),{},m.services,m.transport)).status,400);
 assert.equal((await handlePrivateConsole(request('/__qa/console-source-health',{},'POST'),{},m.services,m.transport)).status,405);
})
test('private route failure stage is sanitized and does not echo cookies',async()=>{
 const m=fake({auth:503});
 const r=await handlePrivateConsole(request('/console',{Cookie:cookie}),{},m.services,m.transport);
 assert.equal(r.status,503);
 assert.equal(r.headers.get('X-FP-Console-Stage'),'session_upstream');
 assert.ok((await r.text()).includes('session_upstream'));
 assert.doesNotMatch(await (async()=>JSON.stringify([...r.headers]))(),/synthetic-cookie|Authorization|Bearer/);
 const upstream=fake({assetStatus:503});
 const x=await handlePrivateConsole(request('/console',{Cookie:cookie}),{},upstream.services,upstream.transport);
 assert.equal(x.status,503);
 assert.equal(x.headers.get('X-FP-Console-Stage'),'source_upstream');
})
