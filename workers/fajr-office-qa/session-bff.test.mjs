import test from 'node:test'
import assert from 'node:assert/strict'
import {webcrypto} from 'node:crypto'
import {handleBff} from './worker.mjs'
if(!globalThis.crypto)globalThis.crypto=webcrypto

const base='https://fajr-office-qa.khoojafahim.workers.dev'
const auth='https://krzxajtrhvupyywovdzy.supabase.co/auth/v1'
const config='https://krzxajtrhvupyywovdzy.supabase.co/functions/v1/fajr-office/config'
const office='https://krzxajtrhvupyywovdzy.supabase.co/functions/v1/fajr-office/api/office'
const key=await crypto.subtle.generateKey({name:'AES-GCM',length:256},true,['encrypt','decrypt'])
const env={FAJR_SESSION_KEY:key}
const authHeader='X-FP-Office-Request'
const fixture={id:'00000000-0000-4000-8000-000000000001',service:'synthetic visa',destination:'QA',variant:'',contact:'qa@example.invalid',status:'received',created_at:'2026-11-15T00:00:00Z'}

function request(path,{method='GET',body,cookie,origin=base,header=true,fetchSite}={}){
 const headers={...(header?{[authHeader]:'same-origin'}:{}),...(cookie?{Cookie:cookie}:{}),...(method==='POST'?{Origin:origin,'Content-Type':'application/json'}:{}),...(fetchSite?{'Sec-Fetch-Site':fetchSite}:{})}
 return new Request(base+path,{method,headers,...(method==='POST'?{body:JSON.stringify(body||{})}:{})})
}
function reply(status,data){return Response.json(data,{status})}
function mock({denied=false,expires_in=3600,invalid=false,revoked=false}={}){
 const calls=[];
 const transport=async(url,init={})=>{
  const u=String(url),method=init.method||'GET'
  calls.push({url:u,method,authorization:init.headers?.Authorization,origin:init.headers?.Origin,body:init.body?JSON.parse(init.body):null})
  if(u===config)return reply(200,{publishableKey:'sb_publishable_synthetic_key_2026'})
  if(u.includes('/token?grant_type=password'))return invalid?reply(400,{error_code:'invalid_credentials'}):reply(200,{access_token:'token.synthetic.access',refresh_token:'token-synthetic-refresh',expires_in})
  if(u.includes('/token?grant_type=refresh_token'))return reply(200,{access_token:'token.synthetic.rotated',refresh_token:'token-synthetic-rotated',expires_in:3600})
  if(u===auth+'/user')return revoked?reply(401,{error:'invalid_session'}):reply(200,{id:fixture.id,role:'authenticated',is_anonymous:false})
  if(u===auth+'/logout')return new Response(null,{status:204})
  if(u.startsWith(office)){
   assert.equal(init.headers?.Origin,base)
   assert.match(init.headers?.Authorization||'',/^Bearer token\.synthetic\./)
   if(denied)return reply(403,{error:'forbidden'})
   if(method==='GET')return reply(200,[fixture])
   return reply(200,{id:fixture.id,status:'reviewing'})
  }
  throw Error('unexpected upstream '+u)
 }
 return {transport,calls}
}
async function login(transport,remember=false){
 const response=await handleBff(request('/api/session/login',{method:'POST',body:{email:'qa@example.invalid',password:'synthetic-only',remember}}),env,transport)
 const setCookie=response.headers.get('Set-Cookie')
 return {response,setCookie,cookie:setCookie?.split(';')[0]}
}

test('trusted device creates only encrypted HttpOnly same-origin cookie, never returns token',async()=>{
 const m=mock(),{response,setCookie,cookie}=await login(m.transport,true)
 assert.equal(response.status,200)
 assert.deepEqual(await response.json(),{authenticated:true})
 assert.match(setCookie,/HttpOnly; Secure; SameSite=Lax; Max-Age=/)
 assert.match(setCookie,/Path=\//)
 assert.match(cookie,/^__Host-fp-office-session=/)
 assert.doesNotMatch(cookie,/synthetic|access|refresh/)
 assert.equal(response.headers.get('Cache-Control'),'no-store')
 const seen=await handleBff(request('/api/session',{cookie}),env,m.transport)
 assert.equal(seen.status,200)
 assert.deepEqual(await seen.json(),{authenticated:true})
 assert.equal(m.calls.some(x=>x.url===auth+'/user'),true)
 const list=await handleBff(request('/api/office?offset=0',{cookie}),env,m.transport)
 assert.equal(list.status,200)
 assert.deepEqual(await list.json(),[fixture])
 const write=await handleBff(request('/api/office',{method:'POST',body:{id:fixture.id,expected:'received',status:'reviewing'},cookie}),env,m.transport)
 assert.equal(write.status,200)
 assert.deepEqual(await write.json(),{id:fixture.id,status:'reviewing'})
 assert.equal(m.calls.find(x=>x.method==='POST'&&x.url===office).authorization,'Bearer token.synthetic.access')
})
test('short browser session cookie has no persistent Max-Age',async()=>{
 const {setCookie}=await login(mock().transport,false)
 assert.doesNotMatch(setCookie,/Max-Age=/)
})
test('CSRF and cross-origin API calls are denied before reading cookies or calling provider',async()=>{
 const m=mock(),{cookie}=await login(m.transport)
 const count=m.calls.length
 for(const req of [
  request('/api/office',{cookie,header:false}),
  request('/api/office',{cookie,fetchSite:'cross-site'}),
  request('/api/session/logout',{method:'POST',cookie,origin:'https://evil.invalid'}),
  request('/api/session/login',{method:'POST',body:{email:'qa@example.invalid',password:'synthetic',remember:true},origin:'https://evil.invalid'})
 ]){
  const response=await handleBff(req,env,m.transport)
  assert.equal(response.status,403)
 }
 assert.equal(m.calls.length,count)
})
test('unauthorized identity denied and no cookie minted',async()=>{
 const m=mock({denied:true}),result=await login(m.transport)
 assert.equal(result.response.status,403)
 assert.equal(result.setCookie,null)
})
test('invalid password denied and no cookie minted',async()=>{
 const result=await login(mock({invalid:true}).transport)
 assert.equal(result.response.status,401)
 assert.equal((await result.response.json()).error,'login_failed')
 assert.equal(result.setCookie,null)
})


test('Cloudflare Worker outbound Auth and Office calls all use supported manual redirect mode',async()=>{
 const m=mock(),seen=[];
 const transport=(url,init={})=>{
  if([config,auth+'/token?grant_type=password',office].some(target=>String(url).startsWith(target))){
   assert.equal(init.redirect,'manual','Worker subrequests cannot use unsupported error mode');
   seen.push(String(url));
  }
  return m.transport(url,init);
 };
 const {response}=await login(transport,true);
 assert.equal(response.status,200);
 assert.ok(seen.some(x=>x===config));
 assert.ok(seen.some(x=>x.includes('/token?grant_type=password')));
 assert.ok(seen.some(x=>x.startsWith(office)));
});
test('manual redirect does not follow public config to an untrusted host',async()=>{
 const m=mock(),transport=(url,init)=>String(url)===config?new Response(null,{status:302,headers:{Location:'https://untrusted.invalid'}}):m.transport(url,init);
 const {response,setCookie}=await login(transport);
 assert.equal(response.status,503);
 assert.equal(response.headers.get('X-FP-Auth-Stage'),'config');
 assert.equal(setCookie,null);
});

test('an Auth 503 is never returned as a wrong-password response',async()=>{
 const m=mock(),transport=async(url,init={})=>String(url).includes('/token?grant_type=password')?reply(503,{error:'temporarily_unavailable'}):m.transport(url,init);
 const {response,setCookie}=await login(transport);
 assert.equal(response.status,503);
 assert.deepEqual(await response.json(),{error:'auth_unavailable'});
 assert.equal(setCookie,null);
});
test('Auth 400 with a different code is not misrepresented as bad credentials',async()=>{
 const m=mock(),transport=async(url,init={})=>String(url).includes('/token?grant_type=password')?reply(400,{error_code:'captcha_failed'}):m.transport(url,init);
 const {response}=await login(transport);
 assert.equal(response.status,503);
 assert.deepEqual(await response.json(),{error:'auth_unavailable'});
});

test('diagnostic stage is generic, safe, and distinguishes failing outbound Worker calls',async()=>{
 const scenarios=[
  {stage:'config',fail:url=>String(url)===config},
  {stage:'transport',fail:url=>String(url).includes('/token?grant_type=password')}
 ];
 for(const x of scenarios){
  const m=mock();
  const transport=(url,init)=>x.fail(url)?Promise.reject(new Error('synthetic test exception: no personal data')):m.transport(url,init);
  const {response}=await login(transport);
  assert.equal(response.status,503);
  assert.deepEqual(await response.json(),{error:'auth_unavailable'});
  assert.equal(response.headers.get('X-FP-Auth-Stage'),x.stage);
  assert.doesNotMatch(JSON.stringify(Object.fromEntries(response.headers)),/synthetic test exception|password|publishable|token/);
 }
 const m=mock(),transport=(url,init)=>String(url).includes('/token?grant_type=password')?reply(403,{error:'upstream_rejected'}):m.transport(url,init);
 const {response}=await login(transport);
 assert.equal(response.status,503);
 assert.equal(response.headers.get('X-FP-Auth-Stage'),'upstream-403');
 assert.equal((await response.json()).error,'auth_unavailable');
});
test('public config outage is classified as transport failure, never bad credentials',async()=>{
 const m=mock(),transport=async(url,init={})=>String(url)===config?Promise.reject(Error('synthetic connectivity')):m.transport(url,init);
 const {response,setCookie}=await login(transport);
 assert.equal(response.status,503);
 assert.deepEqual(await response.json(),{error:'auth_unavailable'});
 assert.equal(response.headers.get('X-FP-Auth-Stage'),'config');
 assert.equal(setCookie,null);
});
test('valid Auth followed by Office 503 is an Office failure, never a login failure',async()=>{
 const m=mock(),transport=async(url,init={})=>String(url).startsWith(office)?reply(503,{error:'office_unavailable'}):m.transport(url,init);
 const {response,setCookie}=await login(transport);
 assert.equal(response.status,503);
 assert.deepEqual(await response.json(),{error:'office_unavailable'});
 assert.equal(setCookie,null);
 assert.equal(m.calls.some(x=>x.url.includes('/token?grant_type=password')),true,'Auth succeeded before Office failed');
});
test('Auth rate limit is reported without hinting wrong password',async()=>{
 const m=mock(),transport=async(url,init={})=>String(url).includes('/token?grant_type=password')?reply(429,{error_code:'over_request_rate_limit'}):m.transport(url,init);
 const {response}=await login(transport);
 assert.equal(response.status,429);
 assert.deepEqual(await response.json(),{error:'rate_limited'});
});

test('revoked user fails restore, server clears cookie',async()=>{
 const good=mock(),{cookie}=await login(good.transport)
 const m=mock({revoked:true})
 const response=await handleBff(request('/api/session',{cookie}),env,m.transport)
 assert.equal(response.status,401)
 assert.match(response.headers.get('Set-Cookie'),/Max-Age=0/)
})
test('invalid or tampered cookie cannot be read',async()=>{
 const m=mock(),{cookie}=await login(m.transport)
 // Changing the final base64url character can modify unused padding bits only.
 // Mutate a middle ciphertext character to guarantee an actual authenticated-byte change.
 const separator=cookie.indexOf('=')
 const payload=cookie.slice(separator+1)
 const index=Math.floor(payload.length/2)
 const tampered=cookie.slice(0,separator+1)+payload.slice(0,index)+(payload[index]==='A'?'B':'A')+payload.slice(index+1)
 const result=await handleBff(request('/api/session',{cookie:tampered}),env,m.transport)
 assert.equal(result.status,401)
})
test('near-expired token is refreshed server-side and cookie rotated',async()=>{
 const m=mock({expires_in:1}),{cookie}=await login(m.transport,true)
 const response=await handleBff(request('/api/office?offset=0',{cookie}),env,m.transport)
 assert.equal(response.status,200)
 assert.match(response.headers.get('Set-Cookie')||'',/HttpOnly/)
 assert.ok(m.calls.some(x=>x.url.includes('grant_type=refresh_token')))
 assert.equal(m.calls.some(x=>x.authorization==='Bearer token.synthetic.rotated'),true)
})
test('server logout revokes and clears private cookie without exposing tokens',async()=>{
 const m=mock(),{cookie}=await login(m.transport,true)
 const result=await handleBff(request('/api/session/logout',{method:'POST',cookie}),env,m.transport)
 assert.equal(result.status,200)
 assert.deepEqual(await result.json(),{signedOut:true})
 assert.match(result.headers.get('Set-Cookie'),/Max-Age=0; HttpOnly; Secure/)
 assert.ok(m.calls.some(x=>x.url===auth+'/logout'))
})
test('missing and invalid cookies return 401 without contacting config, Auth or office',async()=>{
 for(const req of [request('/api/session'),request('/api/office?offset=0'),request('/api/session',{cookie:'__Host-fp-office-session=bogus-cookie'})]){
  const m=mock()
  const r=await handleBff(req,env,m.transport)
  assert.equal(r.status,401)
  assert.equal(m.calls.length,0,'No network call for an absent or malformed cookie')
  assert.match(r.headers.get('Cache-Control')||'',/no-store/)
 }
})
test('missing encryption key fails closed and never reaches Auth',async()=>{
 const m=mock()
 const result=await handleBff(request('/api/session'),{},m.transport)
 assert.equal(result.status,503)
 assert.equal(m.calls.length,0)
})
test('credentials absent from client code and office backend remains sole data authority',async()=>{
 const {default:worker}=await import('./worker.mjs')
 const response=await worker.fetch(new Request(base+'/app.js'),env)
 const code=await response.text()
 assert.ok(code.includes('/api/session/login'))
 assert.ok(code.includes('/api/session/logout'))
 assert.ok(code.includes('/api/office'))
 assert.doesNotMatch(code,/sessionStorage\.setItem|localStorage\.setItem|grant_type=password|grant_type=refresh_token/)
 assert.doesNotMatch(code,/service_role|SUPABASE_SERVICE_ROLE_KEY/)
})

// neutral server-session check: never show the sign-in screen during a valid cookie restore.
test('secure Office startup shows a neutral loading view, restores safe history state and clears on logout',async()=>{
 const {default:worker}=await import('./worker.mjs')
 const page=await (await worker.fetch(new Request(base+'/'),env)).text()
 const script=await (await worker.fetch(new Request(base+'/app.js'),env)).text()
 const css=await (await worker.fetch(new Request(base+'/app.css'),env)).text()
 assert.match(page,/id="session-loading"[^>]*role="status"/)
 assert.match(page,/id="login-view"[^>]*hidden/)
 assert.match(css,/\[hidden\]\{display:none!important\}/)
 assert.match(script,/bff\('GET','\/api\/session',null\)/)
 assert.match(script,/return load\(bootPage\)/)
 assert.match(script,/history\.replaceState\(/)
 assert.match(script,/history\.replaceState\(null/)
 assert.match(script,/revealOffice\(false\)/)
 assert.doesNotMatch(script,/sessionStorage\.setItem|localStorage\.setItem/)
})
