import {test} from 'node:test'
import assert from 'node:assert/strict'
import {onRequest,qaOrigin} from './pages-entry.ts'

const fakeId='d5072836-0d50-4dfa-88dc-596e9befd276'
const receipt='31122fb7-582a-4b5a-8db9-4f371ceac3bf'
const qaHostname=new URL(qaOrigin).hostname
const payload={
  requestId:fakeId,service:'ویزا و اقامت',destination:'امارات',
  variant:'FP-09 isolated QA',contact:'fp09@example.invalid',
  consent:true,challenge:'fake-challenge',website:''
}
const fullEnv=()=>({
  FAJR_INTAKE_ENABLED:'true',
  SUPABASE_URL:'https://example.supabase.co',
  SUPABASE_SERVER_KEY:'synthetic-non-secret-only',
  TURNSTILE_SECRET_KEY:'synthetic-non-secret-only',
  FAJR_RATE_LIMIT:{limit:async()=>({success:true})}
})
const req=(url=qaOrigin+'/api/requests',body=payload,headers={})=>new Request(url,{
  method:'POST',
  headers:{Origin:qaOrigin,'Content-Type':'application/json','CF-Connecting-IP':'198.51.100.10',...headers},
  body:JSON.stringify(body)
})
const deny=async (request,env,code=503)=>{
  const res=await onRequest({request,env})
  assert.equal(res.status,code)
  return res
}

test('FP-09 exact QA host only: production, immutable preview, old QA, other route blocked before any API',async()=>{
  let calls=0
  const env=fullEnv();env.FAJR_RATE_LIMIT.limit=async()=>{calls++;return{success:true}}
  for(const url of [
    'https://fajr-parsa-qa.pages.dev/api/requests',
    'https://test-hash.fajr-parsa-qa.pages.dev/api/requests',
    'https://qa-fajr-visual-review-202610.fajr-parsa-qa.pages.dev/api/requests',
    'https://evil.example/api/requests',
    qaOrigin+'/api/unrelated',
  ]){
    const response=await deny(req(url),env)
    assert.equal(response.headers.get('Cache-Control'),'no-store')
    assert.equal(response.headers.get('X-Robots-Tag'),'noindex')
  }
  assert.equal(calls,0)
})
test('FP-09 incomplete bindings or disabled flag fail closed with no fetch',async()=>{
  const cases=[{},fullEnv(),...['SUPABASE_URL','SUPABASE_SERVER_KEY','TURNSTILE_SECRET_KEY','FAJR_RATE_LIMIT'].map(key=>{const v=fullEnv();delete v[key];return v})]
  cases[1].FAJR_INTAKE_ENABLED='false'
  for(const env of cases){const r=await deny(req(),env);assert.deepEqual(await r.json(),{error:'intake_not_enabled'})}
})
test('FP-09 rate limit, untrusted origin and missing trusted IP cannot save data',async()=>{
  let fetches=0
  const oldFetch=globalThis.fetch
  globalThis.fetch=async()=>{fetches++;throw Error('network was not allowed')}
  try{
    const env=fullEnv();env.FAJR_RATE_LIMIT.limit=async()=>({success:false})
    assert.equal((await onRequest({request:req(),env})).status,429)
    assert.equal((await onRequest({request:req(qaOrigin+'/api/requests',payload,{Origin:'https://evil.example'}),env:fullEnv()})).status,403)
    assert.equal((await onRequest({request:req(qaOrigin+'/api/requests',payload,{'CF-Connecting-IP':''}),env:fullEnv()})).status,429)
    assert.equal(fetches,0)
  }finally{globalThis.fetch=oldFetch}
})
test('FP-09 QA network adapters use synthetic Turnstile and Supabase mock without real keys',async()=>{
  let calls=0
  const oldFetch=globalThis.fetch
  globalThis.fetch=async(url,opts)=>{
    const href=String(url)
    calls++
    if(href==='https://challenges.cloudflare.com/turnstile/v0/siteverify'){
      const fields=new URLSearchParams(opts.body)
      assert.equal(fields.get('secret'),'synthetic-non-secret-only')
      assert.equal(fields.get('response'),'fake-challenge')
      assert.equal(fields.get('remoteip'),'198.51.100.10')
      return Response.json({success:true,hostname:qaHostname,action:'fajr_intake'})
    }
    if(href==='https://example.supabase.co/rest/v1/rpc/fajr_receive_web_request'){
      assert.equal(opts.headers.Authorization,'Bearer synthetic-non-secret-only')
      const body=JSON.parse(opts.body)
      assert.equal(body.payload.request_id,fakeId)
      assert.equal(body.payload.contact,'fp09@example.invalid')
      return Response.json([{receipt,replayed:false}])
    }
    throw Error('Unexpected external endpoint: '+href)
  }
  try{
    const res=await onRequest({request:req(),env:fullEnv()})
    assert.equal(res.status,201)
    assert.deepEqual(await res.json(),{status:'received',receipt,replayed:false})
    assert.equal(calls,2,'only Turnstile and known Supabase RPC may be called')
  }finally{globalThis.fetch=oldFetch}
})
test('FP-09 hostname mismatch fails challenge and skips all server writes',async()=>{
  let calls=0
  const oldFetch=globalThis.fetch
  globalThis.fetch=async(url)=>{
    calls++
    assert.equal(String(url),'https://challenges.cloudflare.com/turnstile/v0/siteverify')
    return Response.json({success:true,hostname:'fajr-parsa-qa.pages.dev',action:'fajr_intake'})
  }
  try{
    assert.equal((await onRequest({request:req(),env:fullEnv()})).status,403)
    assert.equal(calls,1)
  }finally{globalThis.fetch=oldFetch}
})
