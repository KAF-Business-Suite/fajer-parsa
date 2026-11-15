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
  if(u.includes('/token?grant_type=password'))return invalid?reply(400,{error:'invalid_grant'}):reply(200,{access_token:'token.synthetic.access',refresh_token:'token-synthetic-refresh',expires_in})
  if(u.includes('/token?grant_type=refresh_token'))return reply(200,{access_token:'token.synthetic.rotated',refresh_token:'token-synthetic-rotated',expires_in:3600})
  if(u===auth+'/user')return revoked?reply(401,{error:'invalid_session'}):reply(200,{id:fixture.id,role:'authenticated',is_anonymous:false})
  if(u===auth+'/logout')return reply(204,null)
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
test('revoked user fails restore, server clears cookie',async()=>{
 const good=mock(),{cookie}=await login(good.transport)
 const m=mock({revoked:true})
 const response=await handleBff(request('/api/session',{cookie}),env,m.transport)
 assert.equal(response.status,401)
 assert.match(response.headers.get('Set-Cookie'),/Max-Age=0/)
})
test('invalid or tampered cookie cannot be read',async()=>{
 const m=mock(),{cookie}=await login(m.transport)
 const tampered=cookie.slice(0,-1)+(cookie.endsWith('A')?'B':'A')
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
